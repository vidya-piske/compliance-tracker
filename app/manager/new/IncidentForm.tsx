"use client";

import { useState } from "react";

export default function IncidentForm({ employees, violations }: { employees: any[]; violations: any[] }) {
  const [employeeId, setEmployeeId] = useState("");
  const [violationId, setViolationId] = useState("");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <form>
        <label className="block text-sm font-medium mb-1">Employee</label>
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 mb-4">
          <option value="">Select an employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Violation</label>
        <select value={violationId} onChange={(e) => setViolationId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 mb-4">
          <option value="">Select a violation</option>
          {violations.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Date of incident</label>
        <input type="date" className="w-full border border-gray-300 rounded-lg p-2 mb-4" />

        <label className="block text-sm font-medium mb-1">What happened</label>
        <textarea rows={4} placeholder="Describe the incident..." className="w-full border border-gray-300 rounded-lg p-2 mb-2"></textarea>
        <p className="text-xs text-gray-400 mb-4">Factual account only. This text is shown to the employee.</p>

        <div className="flex gap-3">
          <button type="submit" className="bg-[#2D5BD6] text-white px-4 py-2 rounded-lg font-medium">Submit for HR review</button>
          <button type="button" className="border border-gray-300 px-4 py-2 rounded-lg font-medium">Save draft</button>
        </div>

        <p className="text-sm text-gray-600 mt-4">You picked employee <b>{employeeId || "none"}</b>, violation <b>{violationId || "none"}</b>.</p>
      </form>
    </div>
  );
}