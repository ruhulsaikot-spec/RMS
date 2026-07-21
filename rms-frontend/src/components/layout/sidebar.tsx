"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { canAccess } from "@/hooks/use-permission";

import {
  LayoutDashboard,
  Receipt,
  CheckCircle2,
  BarChart3,
  Building2,
  Building,
  Users,
  MapPin,
  FolderKanban,
  Wallet,
  BadgeCheck,
  GitBranch,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type SidebarProps = {
  active?:
    | "dashboard"
    | "claims"
    | "roles"
    | "users"
    | "role-permissions"
    | "companies"
    | "cost-centers"
    | "departments"
    | "designations"
    | "expense-types"
    | "projects"
    | "workflows"
    | "approval-groups"
    | "locations"
    | "employees"
    | "approvals"
    | "reports";
};

export default function Sidebar({
  active = "dashboard",
}: SidebarProps) {
  const pathname = usePathname();
  const { permissions } = useAuth();

  console.log(
  "SIDEBAR PERMISSIONS =>",
  permissions
);
  

  const [collapsed, setCollapsed] =
    useState(false);
  const [reportsOpen, setReportsOpen] =
    useState(pathname.includes("/admin/reports"));

  const [organizationOpen, setOrganizationOpen] =
  useState(
    pathname.includes("/admin/organization/companies") ||
    pathname.includes("/admin/organization/departments") ||
    pathname.includes("/admin/organization/designations") ||
    pathname.includes("/admin/organization/locations") ||
    pathname.includes("/admin/organization/employees")
  );

const [configurationOpen, setConfigurationOpen] =
  useState(
    pathname.includes("/admin/administration/roles") ||
    pathname.includes("/admin/administration/role-permissions") ||
    pathname.includes("/admin/administration/users") ||
    pathname.includes("/admin/organization/cost-centers") ||
    pathname.includes("/admin/organization/expense-types") ||
    pathname.includes("/admin/organization/projects")
  );

  const canViewCompanies =
  canAccess(
    permissions,
    "company:read"
  );

const canViewDepartments =
  canAccess(
    permissions,
    "department:read"
  );

const canViewDesignations =
  canAccess(
    permissions,
    "designation:read"
  );

const canViewLocations =
  canAccess(
    permissions,
    "location:read"
  );

const canViewEmployees =
  canAccess(
    permissions,
    "employee:read"
  );

const canViewRoles =
  canAccess(
    permissions,
    "role:read"
  );

const canViewRolePermissions =
  canAccess(
    permissions,
    "permission:read"
  );

const canViewUsers =
  canAccess(
    permissions,
    "user:list"
  );

const canViewOrganization =
  canViewCompanies ||
  canViewDepartments ||
  canViewDesignations ||
  canViewLocations ||
  canViewEmployees;

const canViewConfiguration =
  canAccess(
    permissions,
    "cost_center:read"
  ) ||
  canAccess(
    permissions,
    "expense_type:read"
  ) ||
  canAccess(
    permissions,
    "project:read"
  ) ||
  canAccess(
    permissions,
    "workflow:read"
  ) ||
  canAccess(
    permissions,
    "approval_group:read"
  ) ||
  canViewRoles ||
  canViewUsers ||
  canViewRolePermissions;

  const hasPermission = (
  permissionCode: string
) =>
  canAccess(
    permissions,
    permissionCode
  );

  useEffect(() => {
  setOrganizationOpen(
    pathname.includes("/admin/organization/companies") ||
    pathname.includes("/admin/organization/departments") ||
    pathname.includes("/admin/organization/designations") ||
    pathname.includes("/admin/organization/locations") ||
    pathname.includes("/admin/organization/employees")
  );

  setConfigurationOpen(
    pathname.includes("/admin/administration/roles") ||
    pathname.includes("/admin/administration/role-permissions") ||
    pathname.includes("/admin/administration/users") ||
    pathname.includes("/admin/organization/cost-centers") ||
    pathname.includes("/admin/organization/expense-types") ||
    pathname.includes("/admin/organization/projects") ||
    pathname.includes("/admin/administration/workflows") ||
    pathname.includes("/admin/administration/approval-groups")
  );
}, [pathname]);

  return (
    <aside
      className={`
      ${collapsed ? "w-20" : "w-64"}
      overflow-y-auto
      border-r
      border-white/10
      bg-white/[0.04]
      backdrop-blur-3xl
      transition-all
      duration-300
      `}
    >
      <div className="min-w-0">

      <div className="ml-4 mt-4">
        <h1 className="text-2xl font-bold leading-none tracking-tight">
          RMS
        </h1>

        {!collapsed && (
          <p className="mt-1.5 text-[10px] leading-4 text-blue-100/55">
            Reimbursement Management System
          </p>
        )}
      </div>

      <button
        onClick={() =>
          setCollapsed(!collapsed)
        }
        className="
        rounded-xl
        p-2
        text-white/60
        hover:bg-white/5
        "
      >
        {collapsed ? (
          <PanelLeftOpen size={18} />
        ) : (
          <PanelLeftClose size={18} />
        )}
      </button>

    </div>

      <nav className="p-4">

        {hasPermission("reimbursement:read") && (

        <Link
          href="/dashboard"
          className={`
          mb-1
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          px-3
          py-2.5
          text-left
          text-sm
          ${
            active === "dashboard"
              ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        )}

        {hasPermission("reimbursement:read") && (

        <Link
          href="/claims"
          className={`
          mb-1
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          px-3
          py-2.5
          text-left
          text-sm
          ${
            active === "claims"
            ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300"
            : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <Receipt size={18} />
          Claims
        </Link>

        )}
            

        {hasPermission("reimbursement:approve") && (

        <Link
          href="/approvals"
          className={`
          mb-1
          flex
          w-full
          items-center
          gap-2.5
          rounded-xl
          px-3
          py-2.5
          text-left
          text-sm
          ${
            active === "approvals"
              ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300"
              : "text-white/70 hover:bg-white/5"
          }
          `}
        >
          <CheckCircle2 size={18} />
          Approvals & Payment
        </Link>

        )}

        {/* Reports */}
        {(hasPermission("report:read") || hasPermission("report:claim_summary") || hasPermission("report:executive") || hasPermission("report:status_summary") || hasPermission("report:monthly_trend") || hasPermission("report:department_wise")) && (
        <div className="mb-1">
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              active === "reports"
                ? "text-cyan-300"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={14} />
              Reports
            </span>
            <ChevronDown size={12} className={`transition-transform ${reportsOpen ? "rotate-180" : ""}`} />
          </button>
          {reportsOpen && (
            <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
              {hasPermission("report:claim_summary") && (
              <Link
                href="/admin/reports/claims"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  pathname.includes("/reports/claims") ? "bg-cyan-500/10 text-cyan-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                Claim Summary
              </Link>
              )}
              {hasPermission("report:executive") && (
              <Link
                href="/admin/reports/executive"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  pathname.includes("/reports/executive") ? "bg-cyan-500/10 text-cyan-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                Executive Report
              </Link>
              )}
              {hasPermission("report:status_summary") && (
              <Link
                href="/admin/reports/status-summary"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  pathname.includes("/reports/status-summary") ? "bg-cyan-500/10 text-cyan-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                Status Summary
              </Link>
              )}
              {hasPermission("report:monthly_trend") && (
              <Link
                href="/admin/reports/monthly-trend"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  pathname.includes("/reports/monthly-trend") ? "bg-cyan-500/10 text-cyan-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                Monthly Trend
              </Link>
              )}
              {hasPermission("report:department_wise") && (
              <Link
                href="/admin/reports/department-wise"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
                  pathname.includes("/reports/department-wise") ? "bg-cyan-500/10 text-cyan-300" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                Department Wise
              </Link>
              )}
            </div>
          )}
        </div>
        )}
        <div className="my-5 border-t border-white/10" />
        {canViewOrganization && (
          <>
          {/* Organization */}

          <div className="mb-3">

          <button
            onClick={() =>
              setOrganizationOpen(
                !organizationOpen
              )
            }
            className={`
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            px-3
            py-2
            text-xs
            font-semibold
            uppercase
            tracking-[0.12em]
            ${
              [
                "companies",
                "departments",
                "designations",
                "locations",
                "employees",
              ].includes(active || "")
                ? "bg-cyan-500/10 text-cyan-300"
                : "text-white/35 hover:bg-white/5"
            }
            `}
          >
            <span>Organization</span>

            {organizationOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

        </div>

        {organizationOpen && (

        <div className="mb-4">

          {hasPermission("company:read") && (
          <Link
            href="/admin/organization/companies"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "companies"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Building size={14} />
            Companies
          </Link>
          )}

          {hasPermission("department:read") && (
          <Link
            href="/admin/organization/departments"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "departments"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Building2 size={14} />
            Departments
          </Link>
          )}

          {hasPermission("designation:read") && (
          <Link
            href="/admin/organization/designations"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "designations"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <BadgeCheck size={14} />
            Designations
          </Link>
          )}

          {hasPermission("location:read") && (
          <Link
            href="/admin/organization/locations"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "locations"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <MapPin size={14} />
            Locations
          </Link>
          )}

          {hasPermission("employee:read") && (
          <Link
            href="/admin/organization/employees"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "employees"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Users size={14} />
            Employees
          </Link>
          )}

        </div>

        )}
        </>

        )}

        {canViewConfiguration && (
          <>
            {/* Configuration */}

            <div className="mb-3">

          <button
            onClick={() =>
              setConfigurationOpen(
                !configurationOpen
              )
            }
            className={`
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            px-3
            py-2
            text-xs
            font-semibold
            uppercase
            tracking-[0.12em]
            ${
              [
                "cost-centers",
                "expense-types",
                "projects",
                "workflows",
                "approval-groups",
                "roles",
                "users",
                "role-permissions",
              ].includes(active || "")
                ? "bg-cyan-500/10 text-cyan-300"
                : "text-white/35 hover:bg-white/5"
            }
            `}
          >
            <span>Configuration</span>

            {configurationOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>

        </div>

        {configurationOpen && (

        <div className="mb-4">

          
          {hasPermission("expense_type:read") && (
          <Link
            href="/admin/organization/expense-types"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "expense-types"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Receipt size={14} />
            Expense Types
          </Link>
          )}

          {hasPermission("project:read") && (
          <Link
            href="/admin/organization/projects"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "projects"
                ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <FolderKanban size={14} />
            Projects
          </Link>
          )}

          {hasPermission("approval_group:read") && (
            <Link
              href="/admin/administration/approval-groups"
              className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
                active === "approval-groups"
                  ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <Users size={14} />
              Approval Groups
            </Link>
          )}

          {hasPermission("workflow:read") && (
            <Link
              href="/admin/administration/workflows"
              className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
                active === "workflows"
                  ? "border-l-4 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <GitBranch size={14} />
              Workflow Configuration
            </Link>
          )}

          {canViewRoles && (

          <Link
            href="/admin/administration/roles"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "roles"
                ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <BadgeCheck size={14} />
            Roles
          </Link>
          )}

          {hasPermission("user:list") && (
          <Link
            href="/admin/administration/users"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "users"
                ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <Users size={14} />
            Users
          </Link>
          )}

          {hasPermission("permission:read") && (
          <Link
            href="/admin/administration/role-permissions"
            className={`mb-1 ml-6 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${
              active === "role-permissions"
                ? "border-l-4 border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            <BadgeCheck size={14} />
            Role Permissions
          </Link>
          )}

        </div>
        )}
      </>

        )}

      </nav>
    </aside>
  );
}