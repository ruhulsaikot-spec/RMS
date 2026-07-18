"use client";

import { useEffect, useState } from "react";
import { approvalGroupService } from "@/services/approval-group.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, Users, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

type ApprovalGroup = {
  id: string;
  group_code: string;
  group_name: string;
  approval_method: "ANY_ONE" | "ALL";
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  members: {
    id: string;
    employee_name: string;
    department_name: string;
    designation_name: string;
  }[];
};

export default function ApprovalGroupsPage() {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadApprovalGroups = async () => {
    try {
      setLoading(true);
      const response = await approvalGroupService.getApprovalGroups();
      setApprovalGroups(Array.isArray(response) ? response : response.data ?? response.items ?? []);
    } catch (error) {
      console.error("Failed to load approval groups", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApprovalGroups(); }, []);

  const handleDelete = async () => {
    if (!deleteGroupId) return;
    try {
      setDeleteLoading(true);
      await approvalGroupService.deleteApprovalGroup(deleteGroupId);
      setApprovalGroups((prev) => prev.filter((x) => x.id !== deleteGroupId));
      toast.success("Approval group deleted successfully.");
      setDeleteGroupId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete approval group.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredGroups = (approvalGroups ?? []).filter((group) => {
    const matchesSearch = group.group_code.toLowerCase().includes(search.toLowerCase()) ||
      group.group_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" ||
      (group.is_active ? "Active" : "Inactive") === statusFilter;
    const matchesMethod = methodFilter === "All" ||
      (methodFilter === "ANY_ONE" ? group.approval_method === "ANY_ONE" : group.approval_method === "ALL");
    return matchesSearch && matchesStatus && matchesMethod;
  });

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / ITEMS_PER_PAGE));
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  return (
    <PermissionGuard permission="approval_group:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="approval-groups" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Approval Groups" subtitle="Manage workflow approval teams" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Groups</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{approvalGroups.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{approvalGroups.filter((g) => g.is_active).length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-white/60">Inactive</p>
                  <p className="mt-2 text-2xl font-bold text-red-300">{approvalGroups.filter((g) => !g.is_active).length}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-xs text-white/60">Any One Approves</p>
                  <p className="mt-2 text-2xl font-bold text-purple-300">{approvalGroups.filter((g) => g.approval_method === "ANY_ONE").length}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search group..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white" />
                </div>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  {["All", "Active", "Inactive"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">{s === "All" ? "All Status" : s}</option>
                  ))}
                </select>

                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  <option value="All" className="bg-[#17386E]">All Methods</option>
                  <option value="ANY_ONE" className="bg-[#17386E]">Any One Approves</option>
                  <option value="ALL" className="bg-[#17386E]">All Must Approve</option>
                </select>

                <div className="ml-auto">
                  <button
                    onClick={() => router.push("/admin/administration/approval-groups/new")}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                    <Plus size={13} /> New Group
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                {loading ? (
                  <div className="flex h-48 items-center justify-center text-sm text-white/40">Loading...</div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          {["Code", "Group Name", "Method", "Members", "Status", "Updated", "Action"].map((h, i) => (
                            <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 6 ? "text-right" : ""}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedGroups.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-xs text-white/40">No approval groups found</td>
                          </tr>
                        ) : paginatedGroups.map((group) => (
                          <tr key={group.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-3 text-xs font-semibold text-cyan-300">{group.group_code}</td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-medium text-white">{group.group_name}</div>
                              {group.description && (
                                <div className="text-[10px] text-white/40 mt-0.5 truncate max-w-[180px]">{group.description}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                group.approval_method === "ANY_ONE"
                                  ? "bg-blue-500/15 text-blue-300 border border-blue-400/30"
                                  : "bg-purple-500/15 text-purple-300 border border-purple-400/30"
                              }`}>
                                {group.approval_method === "ANY_ONE" ? "Any One" : "All Must"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                                  {group.member_count ?? group.members?.length ?? 0}
                                </span>
                                <span className="text-xs text-white/50">members</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                group.is_active
                                  ? "bg-green-500/15 text-green-300 border border-green-400/30"
                                  : "bg-red-500/15 text-red-300 border border-red-400/30"
                              }`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {group.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/50">
                              {group.updated_at ? new Date(group.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => router.push(`/admin/administration/approval-groups/edit/${group.id}`)}
                                  className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteGroupId(group.id)}
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
                        Showing {Math.min(startIndex + 1, filteredGroups.length)}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredGroups.length)} of {filteredGroups.length}
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
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                          className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 disabled:opacity-30">Next →</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </section>
        </div>

        {/* Delete Modal */}
        {deleteGroupId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-1 text-2xl">🗑️</div>
              <h2 className="text-base font-bold text-white">Delete Approval Group</h2>
              <p className="mt-2 text-sm text-white/60">Are you sure you want to delete this approval group?</p>
              <p className="mt-1 text-xs text-red-300">This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setDeleteGroupId(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 transition-colors disabled:opacity-50">
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}