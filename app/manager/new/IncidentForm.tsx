"use client";

import { useState, useEffect } from "react";
import { getRecommendation, createCase } from "@/app/manager/new/action";
import { useRouter } from "next/navigation";

export default function IncidentForm({
  employees,
  violations,
  draft,
}: {
  employees: any[];
  violations: any[];
   draft: any;
}) {
 const [employeeId, setEmployeeId] = useState(draft?.employee_id?.toString() ?? "");
  const [violationId, setViolationId] = useState(draft?.violation_id?.toString() ?? "");
  const [incidentDate, setIncidentDate] = useState(draft?.incident_date ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [recommendation, setRecommendation] = useState<{ offenseNumber: number; action: string;
  } | null>(null);

  // Run the rules engine whenever both selections are set
  useEffect(() => {
    if (employeeId && violationId) {
      getRecommendation(employeeId, violationId).then((result) =>
        setRecommendation(result),
      );
    } else {
      setRecommendation(null);
    }
  }, [employeeId, violationId]);

  const router = useRouter();

  async function handleSave(status: string) {
    if (!employeeId || !violationId || !recommendation) {
      alert("Please pick an employee and a violation first.");
      return;
    }
    await createCase(
      {
        employeeId,
        violationId,
        offenseNumber: recommendation.offenseNumber,
        action: recommendation.action,
        incidentDate, 
        description, 
      },
      status,
    );
    router.push("/manager"); // go back to the dashboard to see the new case
  }

  return (
    <div className="grid grid-cols-2 gap-6 max-w-5xl">
      {/* LEFT — the form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <form>
          <label className="block text-sm font-medium mb-1">Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.department}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium mb-1">Violation</label>
          <select
            value={violationId}
            onChange={(e) => setViolationId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          >
            <option value="">Select a violation</option>
            {violations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium mb-1">
            Date of incident
          </label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          />

          <label className="block text-sm font-medium mb-1">
            What happened
          </label>
          <textarea
            rows={4}
            placeholder="Describe the incident..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mb-2"
          ></textarea>
          <p className="text-xs text-gray-400 mb-4">
            Factual account only. This text is shown to the employee.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSave("SUBMITTED")}
              disabled={!recommendation}
              className="bg-[#2D5BD6] text-white px-4 py-2 rounded-lg font-medium cursor-pointer"
            >
              Submit for HR review
            </button>
            <button
              type="button"
              onClick={() => handleSave("DRAFT")}
              disabled={!recommendation}
              className="border border-gray-300 px-4 py-2 rounded-lg font-medium cursor-pointer"
            >
              Save draft
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT — LIVE recommended action */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit">
        <h3 className="font-semibold mb-4">Recommended action</h3>
        {recommendation ? (
          <div>
            <p className="text-sm text-gray-500">
              Offense number: {recommendation.offenseNumber}
            </p>
            <p className="font-bold text-2xl mt-1">
              {recommendation.action.replaceAll("_", " ")}
            </p>
            <p className="text-gray-600 text-sm mt-4 bg-gray-50 rounded-lg p-3">
              This is offense #{recommendation.offenseNumber}, so the rulebook
              sets: {recommendation.action.replaceAll("_", " ")}.
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Pick an employee and a violation to see the recommended action.
          </p>
        )}
      </div>
    </div>
  );
}
