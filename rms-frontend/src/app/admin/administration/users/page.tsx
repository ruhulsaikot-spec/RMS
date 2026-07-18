"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Plus, Users, X, KeyRound } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { employeeService } from "@/services/employee.service";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors";
const readonlyClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/40 cursor-not-allowed";
const selectClass = "w-full rounded-xl border border-white/10 bg-[#0d1f40] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

const emptyForm = { employeeId: "", employeeName: "", email: "", roles: [] as string[], password: "", confirmPassword: "", status: "Active" };

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [userForm, setUserForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const recordsPerPage = 10;

  const roleOptions = roles.map((role) => ({ value: role.id, label: role.display_name }));
  const selectedEmployee = employees.find((emp) => emp.employee_id === userForm.employeeId);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersResponse, rolesResponse, employeesResponse] = await Promise.all([
        userService.getUsers(), roleService.getRoles(), employeeService.getEmployees(),
      ]);
      setUsers(usersResponse.data || []);
      setRoles(rolesResponse || []);
      setEmployees(employeesResponse || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = (user.employee_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || (user.is_active ? "Active" : "Inactive") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + recordsPerPage);

  const closeModal = () => { setEditingId(null); setUserForm(emptyForm); setShowModal(false); };

  const handleSave = async () => {
    if (!userForm.employeeId || !userForm.employeeName || !userForm.email || userForm.roles.length === 0) {
      toast.error("Employee ID, Name, Email and Role are required."); return;
    }
    if (!editingId && (!userForm.password || !userForm.confirmPassword)) {
      toast.error("Password is required."); return;
    }
    if (userForm.password && userForm.password !== userForm.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (userForm.password && userForm.password.length < 8) {
      toast.error("Password must be at least 8 characters."); return;
    }
    const dupEmp = users.find((d) => (d.employee_id || "").toLowerCase() === userForm.employeeId.toLowerCase() && d.id !== editingId);
    if (dupEmp) { toast.error("Employee ID already exists."); return; }
    const dupEmail = users.find((d) => (d.email || "").toLowerCase() === userForm.email.toLowerCase() && d.id !== editingId);
    if (dupEmail) { toast.error("Email already exists."); return; }
    if (!selectedEmployee) { toast.error("Please select an employee"); return; }

    try {
      setSaving(true);
      const payload = {
        full_name: userForm.employeeName, employee_id: userForm.employeeId,
        email: userForm.email, password: userForm.password,
        phone: selectedEmployee.mobile, department_id: selectedEmployee.department_id,
        designation_id: selectedEmployee.designation_id, manager_id: null,
        is_active: userForm.status === "Active",
      };
      if (editingId) {
        await userService.updateUser(editingId, payload);
        await userService.assignRoles(editingId, userForm.roles);
        await loadData();
        toast.success("User updated successfully.");
      } else {
        const createdUser = await userService.createUser(payload);
        await userService.assignRoles(createdUser.id, userForm.roles);
        await loadData();
        toast.success("User created successfully.");
      }
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!deleteId) return;
      await userService.deleteUser(deleteId);
      await loadData();
      toast.success("User deleted successfully.");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to delete user");
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordForm.password || !resetPasswordForm.confirmPassword) {
      toast.error("Password fields are required."); return;
    }
    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      toast.error("Passwords do not match."); return;
    }
    if (resetPasswordForm.password.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    try {
      await userService.resetPassword(resetPasswordId!, resetPasswordForm.password);
      toast.success("Password reset successfully.");
      setResetPasswordId(null);
      setResetPasswordForm({ password: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Password reset failed");
    }
  };

  return (
    <PermissionGuard permission="user:list">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="users" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Users" subtitle="Manage system users and role assignments" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Users</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{users.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{users.filter((u) => u.is_active).length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-white/60">Inactive</p>
                  <p className="mt-2 text-2xl font-bold text-red-300">{users.filter((u) => !u.is_active).length}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-xs text-white/60">Total Roles</p>
                  <p className="mt-2 text-2xl font-bold text-purple-300">{roles.length}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search user..." value={search}
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
                  <button onClick={() => { setEditingId(null); setUserForm(emptyForm); setShowModal(true); }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                    <Plus size={13} /> New User
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Emp ID", "Name", "Email", "Roles", "Status", "Action"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 5 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-xs text-white/40">No users found</td></tr>
                    ) : paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-cyan-300">{user.employee_id}</td>
                        <td className="px-4 py-3 text-xs font-medium text-white">{user.full_name}</td>
                        <td className="px-4 py-3 text-xs text-white/60">{user.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((r: any) => (
                              <span key={r.id} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
                                {r.display_name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            user.is_active
                              ? "bg-green-500/15 text-green-300 border border-green-400/30"
                              : "bg-red-500/15 text-red-300 border border-red-400/30"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingId(user.id);
                                setUserForm({
                                  employeeId: user.employee_id, employeeName: user.full_name,
                                  email: user.email, roles: user.roles?.map((r: any) => r.id) || [],
                                  password: "", confirmPassword: "",
                                  status: user.is_active ? "Active" : "Inactive",
                                });
                                setShowModal(true);
                              }}
                              className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => { setResetPasswordId(user.id); setResetPasswordForm({ password: "", confirmPassword: "" }); }}
                              className="rounded-lg border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-300 hover:bg-yellow-500/20 transition-colors">
                              Reset PW
                            </button>
                            <button
                              onClick={() => {
                                if (user.employee_id === "EMP001") { toast.error("System Administrator cannot be deleted."); return; }
                                setDeleteId(user.id);
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
                    Showing {Math.min(startIndex + 1, filteredUsers.length)}–{Math.min(startIndex + recordsPerPage, filteredUsers.length)} of {filteredUsers.length}
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
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Update User" : "New User"}</h2>
                  <p className="text-xs text-white/40">{editingId ? "Update user information" : "Fill in user details"}</p>
                </div>
                <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Employee ID <span className="text-red-400">*</span></label>
                  <select value={userForm.employeeId}
                    onChange={(e) => {
                      if (editingId) return;
                      const emp = employees.find((employee) => employee.employee_id === e.target.value);
                      if (!emp) return;
                      setUserForm({ ...userForm, employeeId: emp.employee_id, employeeName: emp.name, email: emp.email });
                    }}
                    disabled={!!editingId}
                    className={`${selectClass} ${editingId ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <option value="" className="bg-[#0d1f40]">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.employee_id} className="bg-[#0d1f40]">
                        {emp.employee_id} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Employee Name</label>
                  <input value={userForm.employeeName} readOnly className={readonlyClass} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
                  <input value={userForm.email} readOnly className={readonlyClass} />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Status</label>
                  <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })} className={selectClass}>
                    <option value="Active" className="bg-[#0d1f40]">Active</option>
                    <option value="Inactive" className="bg-[#0d1f40]">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Roles <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    {roleOptions.map((role) => (
                      <label key={role.value} className="flex cursor-pointer items-center gap-2 text-xs text-white/70 hover:text-white transition-colors">
                        <input type="checkbox" checked={userForm.roles.includes(role.value)}
                          onChange={(e) => {
                            if (e.target.checked) setUserForm({ ...userForm, roles: [...userForm.roles, role.value] });
                            else setUserForm({ ...userForm, roles: userForm.roles.filter((id) => id !== role.value) });
                          }}
                          className="h-3.5 w-3.5 accent-cyan-500" />
                        {role.label}
                      </label>
                    ))}
                  </div>
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">Password <span className="text-red-400">*</span></label>
                      <input type="password" value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        placeholder="Min. 8 characters" className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">Confirm Password <span className="text-red-400">*</span></label>
                      <input type="password" value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                        placeholder="Repeat password" className={inputClass} />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update User" : "Save User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetPasswordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-yellow-500/15">
                    <KeyRound size={16} className="text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Reset Password</h2>
                    <p className="text-xs text-white/40">Set a new password for this user</p>
                  </div>
                </div>
                <button onClick={() => { setResetPasswordId(null); setResetPasswordForm({ password: "", confirmPassword: "" }); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">New Password <span className="text-red-400">*</span></label>
                  <input type="password" value={resetPasswordForm.password}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, password: e.target.value })}
                    placeholder="Min. 6 characters" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Confirm Password <span className="text-red-400">*</span></label>
                  <input type="password" value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password" className={inputClass} />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => { setResetPasswordId(null); setResetPasswordForm({ password: "", confirmPassword: "" }); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleResetPassword}
                  className="rounded-xl bg-yellow-500 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-400 transition-colors">
                  Reset Password
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
              <h2 className="text-base font-bold text-white">Delete User</h2>
              <p className="mt-2 text-sm text-white/60">Are you sure you want to delete this user?</p>
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