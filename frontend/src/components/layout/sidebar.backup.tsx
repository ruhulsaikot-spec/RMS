"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  BarChart3,
  Building2,
  Building,
  MapPin,
  Users,
  BadgeCheck,
  Briefcase,
  FolderKanban,
  Wallet,
} from "lucide-react";

type SidebarProps = {
  active?:
    | "dashboard"
    | "claims"
    | "companies"
    | "cost-centers"
    | "departments"
    | "designations"
    | "expense-types"
    | "projects"
    | "locations"
    | "employees"
    | "approvals"
    | "reports";
};

export default function Sidebar({
  active = "dashboard",
}: SidebarProps) {
  return (
    <aside
      className="
      w-72
      overflow-y-auto
      border-r
      border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      "
    >
      <div className="border-b border-white/10 px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight">
          RMS
        </h1>

        <p className="mt-1 text-[11px] text-blue-100/60">
          Reimbursement Management System
        </p>
      </div>

      <nav className="p-4">

        <Link
          href="/dashboard"
          className={`
          mb-2
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-left
          ${
            active === "dashboard"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          href="/claims"
          className={`
          mb-2
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-left
          ${
            active === "claims"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <Receipt size={18} />
          Claims
        </Link>

        <div className="mb-3">

        <div
          className="
          mb-2
          px-4
          text-xs
          font-semibold
          tracking-[0.12em]
          text-white/40
          uppercase
          font-semibold
          uppercase
          tracking-wider
          text-white/40
          "
        >
          Organization
        </div>

        <Link
          href="/admin/organization/companies"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "companies"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Building size={16} />
          Companies
        </Link>

        <Link
          href="/admin/organization/cost-centers"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "cost-centers"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Wallet size={16} />
          Cost Centers
        </Link>

        <Link
          href="/admin/organization/departments"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "departments"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Building2 size={16} />
          Departments
        </Link>

        <Link
          href="/admin/organization/designations"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "designations"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <BadgeCheck size={16} />
          Designations
        </Link>

        <Link
          href="/admin/organization/expense-types"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "expense-types"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Receipt size={16} />
          Expense Types
        </Link>

        <Link
          href="/admin/organization/projects"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "projects"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <FolderKanban size={16} />
          Projects
        </Link>

        <Link
          href="/admin/organization/locations"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "locations"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <MapPin size={16} />
          Locations
        </Link>

        <Link
          href="/admin/organization/employees"
          className={`mb-1 ml-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
            active === "employees"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }`}
        >
          <Users size={16} />
          Employees
        </Link>

      </div>

        <button
          className={`
          mb-2
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-left
          ${
            active === "approvals"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <CheckCircle2 size={18} />
          Approvals
        </button>

        <button
          className={`
          mb-2
          flex
          w-full
          items-center
          gap-3
          rounded-2xl
          px-4
          py-3
          text-left
          ${
            active === "reports"
              ? "bg-blue-500/20 text-blue-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <BarChart3 size={18} />
          Reports
        </button>

      </nav>
    </aside>
  );
}