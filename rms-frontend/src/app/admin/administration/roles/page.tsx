"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Shield, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors";
const selectClass = "w-full rounded-xl border border-white/10 bg-[#0d1f40] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

export default function RolesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleForm, setRoleForm] = useState({ code: "", name: "", description: "", status: "Active" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load roles");
      const data = await response.json();
      setRoles(data.map((role: any) => ({
        id: role.id, code: role.name, name: role.display_name,
        description: role.description || "",
        users: role.users?.length || 0,
        permissions: role.permissions?.length || 0,
        status: "Active",
      })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.code.toLowerCase().includes(search.toLowerCase()) ||
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoles.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + recordsPerPage);

  const openNew = () => {
    setEditingId(null);
    setRoleForm({ code: "", name: "", description: "", status: "Active" });
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setRoleForm({ code: "", name: "", description: "", status: "Active" });
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!roleForm.code || !roleForm.name) {
      toast.error("Role Code and Name are required.");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      if (editingId) {
        const response = await fetch(`http://localhost:8000/api/roles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ display_name: roleForm.name, description: roleForm.description }),
        });
        if (!response.ok) throw new Error();
        toast.success("Role updated successfully.");
      } else {
        const response = await fetch("http://localhost:8000/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: roleForm.code, display_name: roleForm.name, description: roleForm.description }),
        });
        if (!response.ok) throw new Error();
        toast.success("Role created successfully.");
      }
      await loadRoles();
      closeModal();
    } catch {
      toast.error(editingId ? "Failed to update role." : "Failed to create role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/roles/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      await loadRoles();
      toast.success("Role deleted successfully.");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete role.");
    }
  };

  return (
    <PermissionGuard permission="permission:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="roles" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Roles" subtitle="Manage system roles and permissions" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Roles</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{roles.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{roles.filter((r) => r.status === "Active").length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-white/60">Inactive</p>
                  <p className="mt-2 text-2xl font-bold text-red-300">{roles.filter((r) => r.status === "Inactive").length}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-xs text-white/60">Assigned Users</p>
                  <p className="mt-2 text-2xl font-bold text-purple-300">{roles.reduce((total, role) => total + role.users, 0)}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search role..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white" />
                </div>

                <select value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  {["All", "Active", "Inactive"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">{s === "All" ? "All Status" : s}</option>
                  ))}
                </select>

                <div className="ml-auto">
                  <button onClick={openNew}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                    <Plus size={13} /> New Role
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Role Name", "Code", "Description", "Users", "Permissions", "Status", "Action"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 6 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="py-12 text-center text-xs text-white/40">Loading roles...</td></tr>
                    ) : paginatedRoles.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center text-xs text-white/40">No roles found</td></tr>
                    ) : paginatedRoles.map((role) => (
                      <tr key={role.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-white">{role.name}</td>
                        <td className="px-4 py-3 text-xs text-cyan-300 font-mono">{role.code}</td>
                        <td className="px-4 py-3 text-xs text-white/60 max-w-[220px] truncate">{role.description || "-"}</td>
                        <td className="px-4 py-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">{role.users}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-semibold text-cyan-300">{role.permissions}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            role.status === "Active"
                              ? "bg-green-500/15 text-green-300 border border-green-400/30"
                              : "bg-red-500/15 text-red-300 border border-red-400/30"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {role.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingId(role.id);
                                setRoleForm({ code: role.code, name: role.name, description: role.description, status: role.status });
                                setShowModal(true);
                              }}
                              className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (role.users > 0) { toast.error("Role cannot be deleted because users are assigned."); return; }
                                setDeleteId(role.id);
                              }}
                              className="rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition-colors">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                  <p className="text-xs text-white/40">
                    Showing {Math.min(startIndex + 1, filteredRoles.length)}–{Math.min(startIndex + recordsPerPage, filteredRoles.length)} of {filteredRoles.length}
                  </p>
                  <div className="flex gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 disabled:opacity-30">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 rounded-lg text-xs font-medium ${currentPage === page ? "bg-cyan-500 text-black" : "border border-white/10 bg-white/5 text-white/60"}`}>
                        {page}
                      </button>
                    ))}
                    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 disabled:opacity-30">Next →</button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Update Role" : "New Role"}</h2>
                  <p className="text-xs text-white/40">{editingId ? "Update role information" : "Fill in role details"}</p>
                </div>
                <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Role Code <span className="text-red-400">*</span></label>
                  <input value={roleForm.code} onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                    placeholder="e.g. finance" className={inputClass} disabled={!!editingId} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Role Name <span className="text-red-400">*</span></label>
                  <input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. Finance Manager" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Description</label>
                  <textarea rows={3} value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="Brief description of this role..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors resize-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Status</label>
                  <select value={roleForm.status} onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })} className={selectClass}>
                    <option value="Active" className="bg-[#0d1f40]">Active</option>
                    <option value="Inactive" className="bg-[#0d1f40]">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update Role" : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-1 text-2xl">🗑️</div>
              <h2 className="text-base font-bold text-white">Delete Role</h2>
              <p className="mt-2 text-sm text-white/60">Are you sure you want to delete this role?</p>
              <p className="mt-1 text-xs text-red-300">This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setDeleteId(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}