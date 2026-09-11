const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const cors = require("cors");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const express = require("express");
const app = express();
app.use(express.json());
app.use(cookieParser());
const port = 4000;
const { query } = require("./db");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

async function requireAuth(req, res, next) {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.status(401).json({ error: "Not logged in" });
    }
    const rows = await query(
      `SELECT users.id, users.email, users.name, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = $1 AND sessions.expires_at > NOW()`,
      [sessionId],
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Session invalid or expired" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/employees", requireAuth, async (req, res) => {
  const employees = await query(
    "SELECT * FROM employees WHERE manager_id = $1",
    [req.user.id],
  );
  res.json(employees);
});

app.post("/api/employees", requireAuth, async (req, res) => {
  try {
    const { name, designation } = req.body;

    if (!name || !designation) {
      return res
        .status(400)
        .json({ error: "Name and designation are required" });
    }

    const rows = await query(
      "INSERT INTO employees (name, designation, manager_id) VALUES ($1, $2, $3) RETURNING id, name, designation",
      [name, designation, req.user.id],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const rows = await query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, password_hash, name, role],
    );

    res.status(201).json({ id: rows[0].id, email });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const rows = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
      [sessionId, user.id, expiresAt],
    );
    res.cookie("session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    if (sessionId) {
      await query("DELETE FROM sessions WHERE id=$1", [sessionId]);
    }
    res.clearCookie("session");
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/me", async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.status(401).json({ error: "Not logged in" });
    }
    const rows = await query(
      `SELECT users.id, users.email, users.name, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = $1 AND sessions.expires_at > NOW()`,
      [sessionId],
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Session invalid or expired" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Must come BEFORE "/api/cases/:id" — otherwise "preview" is treated as an :id.
app.get("/api/cases/preview", requireAuth, async (req, res) => {
  try {
    const { employeeId, violationId } = req.query;

    if (!employeeId || !violationId) {
      return res
        .status(400)
        .json({ error: "employeeId and violationId are required" });
    }

    const countRows = await query(
      "SELECT COUNT(*) FROM cases WHERE employee_id = $1 AND violation_id = $2",
      [employeeId, violationId],
    );
    const offenseNumber = Number(countRows[0].count) + 1;

    const ruleRows = await query(
      "SELECT action FROM rules WHERE violation_id = $1 AND offense_number = $2",
      [violationId, offenseNumber],
    );
    const action = ruleRows[0]?.action ?? "DISMISSAL";

    res.json({ offenseNumber, action });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/cases/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  const caseRows = await query(
    `SELECT cases.id, employees.name AS employee_name, employees.designation,
            violations.name AS violation_name, cases.offense_number, cases.action,
            cases.status, cases.description
     FROM cases
     JOIN employees  ON cases.employee_id  = employees.id
     JOIN violations ON cases.violation_id = violations.id
     WHERE cases.id = $1`,
    [id],
  );
  const foundCase = caseRows[0];

  if (!foundCase) {
    return res.status(404).json({ error: "Case not found" });
  }

  const events = await query(
    "SELECT actor, message, created_at FROM case_events WHERE case_id = $1 ORDER BY created_at",
    [id],
  );

  res.json({ case: foundCase, events });
});

app.get("/api/cases", requireAuth, async (req, res) => {
  const cases = await query(
    `SELECT cases.id, employees.name AS employee_name, violations.name AS violation_name,
                        cases.offense_number, cases.action, cases.status, cases.description, cases.created_at
     FROM cases
     JOIN employees   ON cases.employee_id  = employees.id
     JOIN violations  ON cases.violation_id = violations.id
     WHERE employees.manager_id = $1
     ORDER BY cases.id DESC`,
    [req.user.id],
  );
  res.json(cases);
});

app.post("/api/cases", requireAuth, async (req, res) => {
  try {
    const { employeeId, violationId, incidentDate, description, status } =
      req.body;

    if (!employeeId || !violationId) {
      return res
        .status(400)
        .json({ error: "employeeId and violationId are required" });
    }

    const countRows = await query(
      "SELECT COUNT(*) FROM cases WHERE employee_id = $1 AND violation_id = $2",
      [employeeId, violationId],
    );
    const offenseNumber = Number(countRows[0].count) + 1;

    const ruleRows = await query(
      "SELECT action FROM rules WHERE violation_id = $1 AND offense_number = $2",
      [violationId, offenseNumber],
    );
    const action = ruleRows[0]?.action ?? "DISMISSAL";

    const rows = await query(
      `INSERT INTO cases (employee_id, violation_id, offense_number, action, status, incident_date, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        employeeId,
        violationId,
        offenseNumber,
        action,
        status || "SUBMITTED",
        incidentDate || null,
        description || null,
      ],
    );
    const caseId = rows[0].id;

    await query(
      "INSERT INTO case_events (case_id, actor, message) VALUES ($1, $2, $3)",
      [
        caseId,
        req.user.name,
        status === "DRAFT" ? "Draft saved" : "Submitted for HR review",
      ],
    );

    res.status(201).json({ id: caseId, offenseNumber, action });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.patch("/api/cases/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    // Only the manager who owns this case (via their employee) can touch it.
    const rows = await query(
      `SELECT cases.id, cases.status
       FROM cases
       JOIN employees ON cases.employee_id = employees.id
       WHERE cases.id = $1 AND employees.manager_id = $2`,
      [id, req.user.id],
    );
    const found = rows[0];
    if (!found) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Editing the facts (description) is only allowed before HR review.
    if (description !== undefined) {
      if (found.status !== "DRAFT" && found.status !== "SUBMITTED") {
        return res.status(409).json({
          error: "This case has been reviewed and can no longer be edited.",
        });
      }
      await query("UPDATE cases SET description = $1 WHERE id = $2", [
        description,
        id,
      ]);
    }

    // Status change (HR workflow) — logged to the audit trail.
    if (status) {
      await query("UPDATE cases SET status = $1 WHERE id = $2", [status, id]);
      await query(
        "INSERT INTO case_events (case_id, actor, message) VALUES ($1, $2, $3)",
        [id, req.user.name, `Status changed to ${status}`],
      );
    }

    res.json({ id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/cases/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only the manager who owns this case (via their employee) can delete it.
    const rows = await query(
      `SELECT cases.id, cases.status
       FROM cases
       JOIN employees ON cases.employee_id = employees.id
       WHERE cases.id = $1 AND employees.manager_id = $2`,
      [id, req.user.id],
    );
    const found = rows[0];
    if (!found) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Reviewed records are permanent — cannot be deleted.
    if (found.status !== "DRAFT" && found.status !== "SUBMITTED") {
      return res.status(409).json({
        error: "This case has been reviewed and can no longer be deleted.",
      });
    }

    // Remove the audit events first (foreign key), then the case itself.
    await query("DELETE FROM case_events WHERE case_id = $1", [id]);
    await query("DELETE FROM cases WHERE id = $1", [id]);

    res.json({ id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/rules", requireAuth, async (req, res) => {
  const rules = await query(
    `SELECT rules.id, rules.violation_id, violations.name AS violation_name,
            rules.offense_number, rules.action
     FROM rules
     JOIN violations ON rules.violation_id = violations.id
     ORDER BY rules.violation_id, rules.offense_number`,
  );
  res.json(rules);
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const rows = await query("SELECT id FROM users WHERE email=$1", [email]);
    const user = rows[0];
    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3",
      [token, expires, user.id],
    );

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset your password",
      html: `<p>We received a request to reset your password.</p>
             <p><a href="${resetLink}">Click here to reset it</a>. This link expires in 1 hour.</p>
             <p>If you didn't request this, you can ignore this email.</p>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Could not send reset email" });
    }

    res.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }
    const rows = await query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token],
    );
    const user = rows[0];

    if (!user) {
      return res
        .status(400)
        .json({ error: "This reset link is invalid or has expired" });
    }
    const password_hash = await bcrypt.hash(password, 10);

    await query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [password_hash, user.id],
    );
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.delete("/api/employees/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await query(
      "DELETE FROM employees WHERE id = $1 AND manager_id = $2 RETURNING id",
      [id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ id: Number(id) });
  } catch (err) {
    if (err.code === "23503") {
      return res
        .status(409)
        .json({ error: "This employee has cases and can't be deleted" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.patch("/api/employees/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation } = req.body;

    if (!name || !designation) {
      return res
        .status(400)
        .json({ error: "Name and designation are required" });
    }

    const rows = await query(
      "UPDATE employees SET name = $1, designation = $2 WHERE id = $3 AND manager_id = $4 RETURNING id, name, designation",
      [name, designation, id, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// (preview route moved above /api/cases/:id — see there)

app.get("/api/violations", requireAuth, async (req, res) => {
  try {
    const violations = await query("SELECT id, name FROM violations ORDER BY id");
    res.json(violations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
