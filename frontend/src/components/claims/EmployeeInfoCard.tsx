"use client";

import { User, Mail, Briefcase, Building2, Hash } from "lucide-react";

type EmployeeInfoCardProps = {
  employee?: {
    employee_id?: string;
    full_name?: string;
    designation?: string;
    department?: string;
    email?: string;
  };
};

export default function EmployeeInfoCard({ employee }: EmployeeInfoCardProps) {
  const fields = [
    { icon: Hash, label: "Employee ID", value: employee?.employee_id },
    { icon: User, label: "Full Name", value: employee?.full_name },
    { icon: Briefcase, label: "Designation", value: employee?.designation },
    { icon: Building2, label: "Department", value: employee?.department },
    { icon: Mail, label: "Email", value: employee?.email },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15">
          <User size={16} className="text-cyan-300" />
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-white">Employee Information</h3>
          <p className="text-xs text-white/40">Auto populated from your profile</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {fields.map((field) => (
          <div key={field.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <field.icon size={11} className="text-white/30" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">{field.label}</span>
            </div>
            <p className="text-xs font-medium text-white truncate">{field.value || "-"}</p>
          </div>
        ))}
      </div>

    </div>

  );
}
