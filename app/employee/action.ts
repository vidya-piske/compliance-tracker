"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function acknowledgeCase(formData: FormData) {
  const caseId = formData.get("caseId");
  await query("UPDATE cases SET status = 'CLOSED' WHERE id = $1", [caseId]);
  revalidatePath("/employee");
}