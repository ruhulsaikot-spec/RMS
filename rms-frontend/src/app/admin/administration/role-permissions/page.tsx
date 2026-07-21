"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, Check, Save } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { useAuth } from "@/contexts/auth-context";
import { roleService } from "@/services/role.service";
import { permissionService } from "@/services/permission.service";
import { Role } from "@/types/role";
import { Permission } from "@/types/permission";

const RESOURCE_GROUPS: Record<string, string> = {
  department: "Organization", designation: "Organization", employee: "Organization",
  company: "Organization", location: "Organization", project: "Organization",
  expense_type: "Organization",
  user: "Administration", role: "Administration", permission: "Administration",
  workflow: "Administration", approval_group: "Administration",
  reimbursement: "Claims",
  report: "Reports",
};

const GROUP_COLORS: Record<string, string> = {
  Organization: "text-blue-300 border-blue-500/30 bg-blue-500/10",
  Administration: "text-purple-300 border-purple-500/30 bg-purple-500/10",
  Claims: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  Others: "text-white/60 border-white/20 bg-white/5",
};

const ACTIONS = ["read", "create", "update", "delete", "approve", "submit", "pay", "claim_summary", "executive", "status_summary", "monthly_trend", "department_wise"];
const ACTION_LABELS: Record<string, string> = {
  read: "View", create: "Add", update: "Edit", delete: "Delete",
  approve: "Approve", submit: "Submit", pay: "Pay",
  claim_summary: "Claim Summary", executive: "Executive", status_summary: "Status Summary",
  monthly_trend: "Monthly Trend", department_wise: "Department Wise",
};
const RESOURCE_ALLOWED_ACTIONS: Record<string, string[]> = {
  report: ["claim_summary", "executive", "status_summary", "monthly_trend", "department_wise"],
};
const getActionsForResource = (resource: string) =>
  RESOURCE_ALLOWED_ACTIONS[resource] || ["read", "create", "update", "delete", "approve", "submit", "pay"];

const formatResourceName = (resource: string) =>
  resource.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function RolePermissionsPage() {
  const { permissions: userPermissions } = useAuth();
  const canEdit = userPermissions.includes("role:manage_permissions");

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(),
        permissionService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      if (rolesData.length > 0) {
        setSelectedRoleId(rolesData[0].id);
        setSelectedPermissions(rolesData[0].permissions?.map((p: any) => p.id) || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load role permissions.");
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = Object.entries(
    permissions.reduce((acc, permission) => {
      const groupName = RESOURCE_GROUPS[permission.resource] || "Others";
      if (!acc[groupName]) acc[groupName] = {};
      if (!acc[groupName][permission.resource]) acc[groupName][permission.resource] = [];
      acc[groupName][permission.resource].push(permission);
      return acc;
    }, {} as Record<string, Record<string, Permission[]>>)
  ).map(([groupName, resources]) => ({ groupName, resources }));

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, permissionId] : prev.filter((id) => id !== permissionId)
    );
  };

  const toggleResource = (resourcePerms: Permission[], checked: boolean) => {
    const ids = resourcePerms.map((p) => p.id);
    setSelectedPermissions((prev) =>
      checked
        ? [...new Set([...prev, ...ids])]
        : prev.filter((id) => !ids.includes(id))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await roleService.assignPermissions(selectedRoleId, selectedPermissions);
      toast.success("Role permissions updated successfully.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <PermissionGuard permission="permission:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="role-permissions" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Role Permissions" subtitle="Manage role-based access control" />

            <div className="flex-1 p-5">

              {/* Header Row */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-white/60">Select Role</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => {
                      const roleId = e.target.value;
                      setSelectedRoleId(roleId);
                      const role = roles.find((r) => r.id === roleId);
                      setSelectedPermissions(role?.permissions?.map((p) => p.id) || []);
                    }}
                    className="h-9 min-w-[200px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id} className="bg-[#17386E]">
                        {role.display_name}
                      </option>
                    ))}
                  </select>

                  {selectedRole && (
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
                      <Shield size={12} className="text-cyan-300" />
                      <span className="text-xs text-white/60">
                        <span className="font-semibold text-cyan-300">{selectedPermissions.length}</span> permissions selected
                      </span>
                    </div>
                  )}
                </div>

                {canEdit && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50"
                  >
                    <Save size={13} />
                    {saving ? "Saving..." : "Save Permissions"}
                  </button>
                )}
              </div>

              {/* Permission Matrix */}
              {loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-white/40">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {groupedPermissions.map(({ groupName, resources }) => {
                    const colorClass = GROUP_COLORS[groupName] || GROUP_COLORS["Others"];
                    return (
                      <div key={groupName} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                        {/* Group Header */}
                        <div className={`flex items-center gap-2 border-b border-white/10 px-4 py-2.5 ${colorClass}`}>
                          <span className="text-xs font-bold uppercase tracking-wider">{groupName}</span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                            {Object.keys(resources).length} resources
                          </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/40 uppercase tracking-wide w-[160px]">Resource</th>
                                {getActionsForResource(Object.keys(resources)[0] || "").map((action) => (
                                  <th key={action} className="px-3 py-2.5 text-center text-[10px] font-semibold text-white/40 uppercase tracking-wide">
                                    {ACTION_LABELS[action]}
                                  </th>
                                ))}
                                {canEdit && (
                                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-white/40 uppercase tracking-wide">All</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(resources).map(([resource, perms]) => {
                                const getPermission = (action: string) =>
                                  perms.find((p) => p.action === action);
                                const allSelected = perms.every((p) => selectedPermissions.includes(p.id));

                                return (
                                  <tr key={resource} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3">
                                      <span className="text-xs font-medium text-white">{formatResourceName(resource)}</span>
                                    </td>
                                    {getActionsForResource(resource).map((action) => {
                                      const permission = getPermission(action);
                                      const isChecked = permission ? selectedPermissions.includes(permission.id) : false;
                                      return (
                                        <td key={action} className="px-3 py-3 text-center">
                                          {permission ? (
                                            <button
                                              disabled={!canEdit}
                                              onClick={() => canEdit && togglePermission(permission.id, !isChecked)}
                                              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                                isChecked
                                                  ? "border-cyan-500 bg-cyan-500 text-black"
                                                  : "border-white/20 bg-white/5 text-transparent hover:border-white/40"
                                              } ${!canEdit ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                                            >
                                              <Check size={10} strokeWidth={3} />
                                            </button>
                                          ) : (
                                            <span className="text-white/15 text-sm">—</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                    {canEdit && (
                                      <td className="px-3 py-3 text-center">
                                        <button
                                          onClick={() => toggleResource(perms, !allSelected)}
                                          className={`mx-auto flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                                            allSelected
                                              ? "border-purple-500 bg-purple-500 text-white"
                                              : "border-white/20 bg-white/5 text-transparent hover:border-white/40"
                                          }`}
                                        >
                                          <Check size={10} strokeWidth={3} />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}