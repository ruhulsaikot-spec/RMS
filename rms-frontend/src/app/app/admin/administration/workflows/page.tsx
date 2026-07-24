"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workflowService } from "@/services/workflow.service";
import { toast } from "sonner";
import { Search, Plus, GitBranch } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

export default function WorkflowPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const recordsPerPage = 10;

  useEffect(() => { loadWorkflows(); }, []);

  const loadWorkflows = async () => {
    try {
      const response = await workflowService.getWorkflows();
      const data = Array.isArray(response) ? response : response?.value ?? [];
      setWorkflows(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load workflows.");
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const matchSearch = w.workflowName?.toLowerCase().includes(search.toLowerCase()) ||
      w.workflowCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredWorkflows.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedWorkflows = filteredWorkflows.slice(startIndex, startIndex + recordsPerPage);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/15 text-green-300 border border-green-400/30";
      case "Draft": return "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30";
      case "Inactive": return "bg-red-500/15 text-red-300 border border-red-400/30";
      default: return "bg-white/10 text-white/60 border border-white/20";
    }
  };

  return (
    <PermissionGuard permission="workflow:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="workflows" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Workflow Configuration" subtitle="Manage reimbursement approval workflows" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Workflows</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{workflows.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{workflows.filter((w) => w.status === "Active").length}</p>
                </div>
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <p className="text-xs text-white/60">Draft</p>
                  <p className="mt-2 text-2xl font-bold text-yellow-300">{workflows.filter((w) => w.status === "Draft").length}</p>
                </div>
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
                  <p className="text-xs text-white/60">Conditional</p>
                  <p className="mt-2 text-2xl font-bold text-purple-300">{workflows.filter((w) => w.workflowType === "Conditional").length}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search workflow..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white" />
                </div>

                <select value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  {["All", "Active", "Draft", "Inactive"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">{s === "All" ? "All Status" : s}</option>
                  ))}
                </select>

                <div className="ml-auto">
                  <button
                    onClick={() => router.push("/admin/administration/workflows/new")}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                    <Plus size={13} /> New Workflow
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Workflow Name", "Claim Types", "Stages", "Type", "Status", "Action"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 5 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWorkflows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-2xl">🌊</div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">No Workflows Configured</h3>
                              <p className="mt-1 text-xs text-white/50">Create your first workflow to define approval stages</p>
                            </div>
                            <button onClick={() => router.push("/admin/administration/workflows/new")}
                              className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-500/25 transition-colors">
                              <Plus size={12} /> Create Workflow
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedWorkflows.map((workflow) => (
                      <tr key={workflow.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-white">{workflow.workflowName}</div>
                          {workflow.workflowCode && (
                            <div className="text-[10px] text-white/40 mt-0.5">{workflow.workflowCode}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {Array.isArray(workflow.claimTypes) && workflow.claimTypes.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {workflow.claimTypes.slice(0, 2).map((type: string) => (
                                <span key={type} className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-300">{type}</span>
                              ))}
                              {workflow.claimTypes.length > 2 && (
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">+{workflow.claimTypes.length - 2}</span>
                              )}
                            </div>
                          ) : <span className="text-xs text-white/40">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                              {workflow.stages?.length ?? 0}
                            </span>
                            <span className="text-[10px] text-white/40">stages</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            workflow.workflowType === "Default"
                              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30"
                              : "bg-purple-500/15 text-purple-300 border border-purple-400/30"
                          }`}>
                            {workflow.workflowType || "Default"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusClass(workflow.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {workflow.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => router.push(`/admin/administration/workflows/view/${workflow.id}`)}
                              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10 transition-colors">
                              View
                            </button>
                            <button onClick={() => router.push(`/admin/administration/workflows/edit/${workflow.id}`)}
                              className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                toast("Delete this workflow?", {
                                  style: { background: "#7f1d1d", border: "1px solid rgba(239,68,68,0.6)", color: "white" },
                                  actionButtonStyle: { background: "#ef4444", color: "white" },
                                  cancelButtonStyle: { background: "rgba(255,255,255,0.15)", color: "white" },
                                  action: {
                                    label: "Confirm Delete",
                                    onClick: async () => {
                                      try {
                                        await workflowService.deleteWorkflow(workflow.id);
                                        toast.success("Workflow deleted.");
                                        loadWorkflows();
                                      } catch (error: any) {
                                        toast.error(error?.response?.data?.detail || "Failed to delete.");
                                      }
                                    },
                                  },
                                  cancel: { label: "Cancel", onClick: () => {} },
                                });
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
                    Showing {Math.min(startIndex + 1, filteredWorkflows.length)}–{Math.min(startIndex + recordsPerPage, filteredWorkflows.length)} of {filteredWorkflows.length}
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
      </main>
    </PermissionGuard>
  );
}