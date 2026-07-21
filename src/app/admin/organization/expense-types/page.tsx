"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Tag, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors";
const selectClass = "w-full rounded-xl border border-white/10 bg-[#0d1f40] px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

const emptyForm = { code: "", name: "", status: "Active" };

export default function ExpenseTypesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [expenseTypeForm, setExpenseTypeForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => { loadExpenseTypes(); }, []);

  const loadExpenseTypes = async () => {
    try {
      const response = await apiClient.get("/expense-types/");
      setExpenseTypes(response.data.map((item: any) => ({
        id: item.id, code: item.code, name: item.name,
        status: item.is_active ? "Active" : "Inactive",
      })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load expense types.");
    }
  };

  const filteredExpenseTypes = expenseTypes.filter((e) => {
    const matchSearch = e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredExpenseTypes.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedExpenseTypes = filteredExpenseTypes.slice(startIndex, startIndex + recordsPerPage);

  const openEdit = (e: any) => {
    setEditingId(e.id);
    setExpenseTypeForm({ code: e.code, name: e.name, status: e.status });
    setShowModal(true);
  };

  const openNew = () => { setEditingId(null); setExpenseTypeForm(emptyForm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingId(null); setExpenseTypeForm(emptyForm); };

  const handleSave = async () => {
    if (!expenseTypeForm.code || !expenseTypeForm.name) {
      toast.error("Code and Name are required.");
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await apiClient.put(`/expense-types/${editingId}`, {
          code: expenseTypeForm.code, name: expenseTypeForm.name,
          is_active: expenseTypeForm.status === "Active",
        });
        toast.success("Expense type updated successfully.");
      } else {
        await apiClient.post("/expense-types/", {
          code: expenseTypeForm.code, name: expenseTypeForm.name,
        });
        toast.success("Expense type created successfully.");
      }
      await loadExpenseTypes();
      closeModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Operation failed.");
      } else {
        toast.error("Operation failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/expense-types/${deleteId}`);
      await loadExpenseTypes();
      toast.success("Expense type deleted successfully.");
      setDeleteId(null);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.detail ||
                  error?.response?.data?.message ||
                  "Failed to delete expense type.";
      toast.error(msg);
    }
  };

  return (
    <PermissionGuard permission="expense_type:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="expense-types" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Expense Types" subtitle="Manage expense categories" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Expense Types</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{expenseTypes.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{expenseTypes.filter((e) => e.status === "Active").length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-white/60">Inactive</p>
                  <p className="mt-2 text-2xl font-bold text-red-300">{expenseTypes.filter((e) => e.status === "Inactive").length}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search expense type..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white" />
                </div>

                <select value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  {["All", "Active", "Inactive"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">{s}</option>
                  ))}
                </select>

                <div className="ml-auto">
                  <ActionGuard permission="expense_type:create">
                    <button onClick={openNew}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                      <Plus size={13} /> New Expense Type
                    </button>
                  </ActionGuard>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Code", "Expense Type Name", "Status", "Action"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 3 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenseTypes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-xs text-white/40">No expense types found</td>
                      </tr>
                    ) : paginatedExpenseTypes.map((e) => (
                      <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-cyan-300">{e.code}</td>
                        <td className="px-4 py-3 text-xs font-medium text-white">{e.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            e.status === "Active"
                              ? "bg-green-500/15 text-green-300 border border-green-400/30"
                              : "bg-red-500/15 text-red-300 border border-red-400/30"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <ActionGuard permission="expense_type:update">
                              <button onClick={() => openEdit(e)}
                                className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                Edit
                              </button>
                            </ActionGuard>
                            <ActionGuard permission="expense_type:delete">
                              <button onClick={() => setDeleteId(e.id)}
                                className="rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition-colors">
                                Delete
                              </button>
                            </ActionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                  <p className="text-xs text-white/40">
                    Showing {Math.min(startIndex + 1, filteredExpenseTypes.length)}–{Math.min(startIndex + recordsPerPage, filteredExpenseTypes.length)} of {filteredExpenseTypes.length}
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
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Update Expense Type" : "New Expense Type"}</h2>
                  <p className="text-xs text-white/40">{editingId ? "Update expense type information" : "Fill in expense type details"}</p>
                </div>
                <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Expense Type Code <span className="text-red-400">*</span></label>
                  <input value={expenseTypeForm.code}
                    onChange={(e) => setExpenseTypeForm({ ...expenseTypeForm, code: e.target.value })}
                    placeholder="e.g. EXP-001" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Expense Type Name <span className="text-red-400">*</span></label>
                  <input value={expenseTypeForm.name}
                    onChange={(e) => setExpenseTypeForm({ ...expenseTypeForm, name: e.target.value })}
                    placeholder="e.g. Travel & Transport" className={inputClass} />
                </div>
                {editingId && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">Status</label>
                    <select value={expenseTypeForm.status}
                      onChange={(e) => setExpenseTypeForm({ ...expenseTypeForm, status: e.target.value })}
                      className={selectClass}>
                      <option value="Active" className="bg-[#0d1f40]">Active</option>
                      <option value="Inactive" className="bg-[#0d1f40]">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update" : "Save"}
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
              <h2 className="text-base font-bold text-white">Delete Expense Type</h2>
              <p className="mt-2 text-sm text-white/60">Are you sure you want to delete this expense type?</p>
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