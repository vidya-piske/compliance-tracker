"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRecommendation(employeeId: string, violationId: string) {
  const countRows = await query(
    "SELECT COUNT(*) FROM cases WHERE employee_id = $1 AND violation_id = $2",
    [employeeId, violationId],
  );
  const pastCount = Number(countRows[0].count);
  const offenseNumber = pastCount + 1;

  const ruleRows = await query(
    "SELECT action FROM rules WHERE violation_id = $1 AND offense_number = $2",
    [violationId, offenseNumber],
  );
  const action = ruleRows[0]?.action ?? "DISMISSAL";

  return { offenseNumber, action };
}

export async function createCase(
  data: { employeeId: string; violationId: string; offenseNumber: number; action: string; incidentDate: string;
    description: string; },
  status: string,
) {
  await query(
    `INSERT INTO cases (employee_id, violation_id, offense_number, action, status, incident_date, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.employeeId, data.violationId, data.offenseNumber, data.action, status, data.incidentDate || null,
      data.description,],
  );
  revalidatePath("/manager");
}