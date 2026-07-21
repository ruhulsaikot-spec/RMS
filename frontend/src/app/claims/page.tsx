"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reimbursementService } from "@/services/reimbursement.service";
import { expenseTypeService } from "@/services/expense-type.service";
import PermissionGuard from "@/components/auth/permission-guard";
import { toast } from "sonner";
import { Search, Plus, Filter, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED": return "bg-green-500/15 text-green-300 border border-green-400/30";
    case "REJECTED": return "bg-red-500/15 text-red-300 border border-red-400/30";
    case "IN_APPROVAL": return "bg-purple-500/20 text-purple-200 border border-purple-400/30";
    case "SUBMITTED": return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30";
    case "PAID": return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30";
    case "VERIFIED": return "bg-blue-500/20 text-blue-200 border border-blue-400/30";
    case "DRAFT": return "bg-white/10 text-white/70 border border-white/20";
    default: return "bg-white/10 text-white border border-white/20";
  }
}

function formatStatus(status: string) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
}

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    loadClaims();
    loadExpenseTypes();
  }, []);

  const loadExpenseTypes = async () => {
    try {
      const data = await expenseTypeService.getExpenseTypes();
      setExpenseTypes(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadClaims = async () => {
    try {
      const allData = await reimbursementService.getApplications();
      const userStr = localStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userId = userObj?.id || null;
      const data = userId
        ? allData.filter((item: any) => item.employee_id === userId)
        : allData;
      const mappedClaims = data.map((item: any) => ({
        id: item.id,
        applicationNo: item.application_no,
        type: item.claim_types || [],
        employee: item.employee_name,
        department: item.department_name,
        amount: item.requested_amount,
        status: item.status,
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "-",
        createdAt: item.created_at || "",
      }));
      setClaims(mappedClaims);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const hasFilters = search || statusFilter !== "All" || fromDate || toDate || amountFrom || amountTo;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
    setAmountFrom("");
    setAmountTo("");
    setCurrentPage(1);
  };

  const sortedClaims = [...claims].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const filteredClaims = sortedClaims.filter((c: any) => {
    const matchSearch = (c.applicationNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.employee || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status?.toUpperCase() === statusFilter.toUpperCase();
    const matchFrom = fromDate ? c.createdAt >= fromDate : true;
    const matchTo = toDate ? c.createdAt <= toDate + "T23:59:59" : true;
    const matchAmountFrom = amountFrom ? Number(c.amount) >= Number(amountFrom) : true;
    const matchAmountTo = amountTo ? Number(c.amount) <= Number(amountTo) : true;
    return matchSearch && matchStatus && matchFrom && matchTo && matchAmountFrom && matchAmountTo;
  });

  const totalPages = Math.ceil(filteredClaims.length / recordsPerPage);
  const paginatedClaims = filteredClaims.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <PermissionGuard permission="reimbursement:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="claims" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Claims" subtitle="Manage your reimbursement applications" />

            <div className="flex-1 p-5 space-y-4">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl px-3 py-2">
                  <Search size={15} className="text-white/50" />
                  <input
                    placeholder="Search applications..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white"
                  />
                </div>

                {/* Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-9 min-w-[130px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none"
                >
                  {["All", "DRAFT", "SUBMITTED", "IN_APPROVAL", "APPROVED", "REJECTED", "VERIFIED", "PAID"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">
                      {s === "All" ? "All Status" : formatStatus(s)}
                    </option>
                  ))}
                </select>

                {/* Amount Range */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">৳</span>
                  <input type="number" placeholder="Min" value={amountFrom}
                    onChange={(e) => { setAmountFrom(e.target.value); setCurrentPage(1); }}
                    className="h-9 w-[80px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white placeholder:text-white/30" />
                  <span className="text-xs text-white/30">—</span>
                  <input type="number" placeholder="Max" value={amountTo}
                    onChange={(e) => { setAmountTo(e.target.value); setCurrentPage(1); }}
                    className="h-9 w-[80px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white placeholder:text-white/30" />
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-1.5">
                  <input type="date" value={fromDate}
                    onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                    className="h-9 w-[130px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white" />
                  <span className="text-xs text-white/30">—</span>
                  <input type="date" value={toDate}
                    onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                    className="h-9 w-[130px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white" />
                </div>

                {/* Reset */}
                {hasFilters && (
                  <button onClick={resetFilters}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                    <X size={12} /> Reset
                  </button>
                )}

                {/* Right side */}
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5">
                    <span className="text-xs font-bold text-cyan-300">{filteredClaims.length}</span>
                    <span className="text-xs text-white/40">Results</span>
                  </div>
                  <Link href="/claims/new">
                    <button className="flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                      <Plus size={14} /> New Claim
                    </button>
                  </Link>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                {loading ? (
                  <div className="flex h-64 items-center justify-center text-sm text-white/40">Loading...</div>
                ) : filteredClaims.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-3">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm text-white/50">No claims found</p>
                    <Link href="/claims/new">
                      <button className="flex items-center gap-1.5 rounded-xl bg-cyan-500/20 px-4 py-2 text-xs text-cyan-300 hover:bg-cyan-500/30">
                        <Plus size={12} /> Create New Claim
                      </button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Application No</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Employee</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Date</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-white/60 uppercase tracking-wide">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedClaims.map((c) => (
                          <tr
                            key={c.id}
                            className="border-b border-white/5 transition-all hover:bg-cyan-500/[0.05] hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]"
                          >
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-cyan-300">{c.applicationNo}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/80">
                                {Array.isArray(c.type)
                                  ? c.type.map((id: string) => expenseTypes.find((e: any) => e.id === id)?.name || id).join(", ")
                                  : "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-medium text-white">{c.employee || "-"}</div>
                              <div className="text-[10px] text-white/40">{c.department || ""}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-cyan-300">৳ {Number(c.amount || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClass(c.status)}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {formatStatus(c.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/60">{c.date}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Link href={`/claims/${c.id}`}>
                                  <button className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                    View
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    if (c.status !== "DRAFT") {
                                      toast.error("Only DRAFT applications can be edited.");
                                      return;
                                    }
                                    router.push(`/claims/${c.id}/edit`);
                                  }}
                                  className="rounded-lg border border-yellow-400/20 bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-300 hover:bg-yellow-500/20 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (c.status !== "DRAFT") {
                                      toast.error("Only DRAFT applications can be deleted.");
                                      return;
                                    }
                                    toast("Delete this application?", {
                                      style: { background: "#7f1d1d", border: "1px solid rgba(239,68,68,0.6)", color: "white" },
                                      actionButtonStyle: { background: "#ef4444", color: "white" },
                                      cancelButtonStyle: { background: "rgba(255,255,255,0.15)", color: "white" },
                                      action: {
                                        label: "Confirm Delete",
                                        onClick: async () => {
                                          try {
                                            await reimbursementService.deleteApplication(c.id);
                                            toast.success("Application deleted.");
                                            loadClaims();
                                          } catch (error: any) {
                                            toast.error(error?.response?.data?.detail || "Failed to delete.");
                                          }
                                        },
                                      },
                                      cancel: { label: "Cancel", onClick: () => {} },
                                    });
                                  }}
                                  className="rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition-colors"
                                >
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
                        Showing {Math.min((currentPage - 1) * recordsPerPage + 1, filteredClaims.length)}–{Math.min(currentPage * recordsPerPage, filteredClaims.length)} of {filteredClaims.length}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                          className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-30"
                        >
                          ← Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                          Math.max(0, currentPage - 3),
                          Math.min(totalPages, currentPage + 2)
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-7 w-7 rounded-lg text-xs font-medium ${
                              currentPage === page
                                ? "bg-cyan-500 text-black"
                                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:bg-white/10 disabled:opacity-30"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </section>
        </div>
      </main>
    </PermissionGuard>
  );
}