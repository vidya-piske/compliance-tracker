"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function acknowledgeCase(formData: FormData) {
  const caseId = formData.get("caseId");
  await query("UPDATE cases SET status = 'CLOSED' WHERE id = $1", [caseId]);
  revalidatePath("/employee");
}

export async function approveCase(formData: FormData) {
  const caseId = formData.get("caseId");
  await query("UPDATE cases SET status = 'APPROVED' WHERE id = $1", [caseId]);
  await query(
    "INSERT INTO case_events (case_id, actor, message) VALUES ($1, $2, $3)",
    [caseId, "HR", "Approved — notice issued to employee"],
  );
  revalidatePath("/hr");
  revalidatePath("/hr/review");
}

export async function rejectCase(formData: FormData) {
  const caseId = formData.get("caseId");
  await query("UPDATE cases SET status = 'REJECTED' WHERE id = $1", [caseId]);
  await query(
    "INSERT INTO case_events (case_id, actor, message) VALUES ($1, $2, $3)",
    [caseId, "HR", "Rejected and returned to manager"],
  );
  revalidatePath("/hr");
  revalidatePath("/hr/review");
}