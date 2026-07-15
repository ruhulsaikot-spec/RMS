"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

import { reimbursementService } from "@/services/reimbursement.service";

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "SUBMITTED": return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30";
    case "IN_APPROVAL": return "bg-purple-500/20 text-purple-200 border border-purple-400/30";
    case "APPROVED": return "bg-green-500/15 text-green-300 border border-green-400/30";
    case "REJECTED": return "bg-red-500/15 text-red-300 border border-red-400/30";
    default: return "bg-white/10 text-white border border-white/20";
  }
}

function formatStatus(status: string) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
}

export default function ApprovalsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [myActions, setMyActions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "my-actions">("pending");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadApprovals();
    loadMyActions();
  }, []);

  const loadApprovals = async () => {
    try {
      const data = await reimbursementService.getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyActions = async () => {
    try {
      const data = await reimbursementService.getMyActions();
      setMyActions(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredData = approvals.filter((item: any) => {
    const matchSearch =
      item.application_no?.toLowerCase().includes(search.toLowerCase()) ||
      item.employee_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || item.status?.toUpperCase() === statusFilter;
    const matchAmountFrom = amountFrom ? Number(item.requested_amount) >= Number(amountFrom) : true;
    const matchAmountTo = amountTo ? Number(item.requested_amount) <= Number(amountTo) : true;
    const itemDate = item.created_at ? item.created_at.split("T")[0] : "";
    const matchDateFrom = dateFrom ? itemDate >= dateFrom : true;
    const matchDateTo = dateTo ? itemDate <= dateTo : true;
    return matchSearch && matchStatus && matchAmountFrom && matchAmountTo && matchDateFrom && matchDateTo;
  });

  return (
    <PermissionGuard permission="reimbursement:approve">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

      <div className="relative z-10 flex min-h-screen w-full">

        <Sidebar active="approvals" />

        <section className="flex-1 flex flex-col">

          <Topbar
            title="Approvals & Payment"
            subtitle="Review and process pending approval requests"
          />

          <div className="flex-1 p-5">

            {/* Tabs */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setActiveTab("pending")}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "pending"
                    ? "bg-cyan-500 text-black"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Pending Approvals
                {approvals.length > 0 && (
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === "pending" ? "bg-black/20" : "bg-cyan-500/20 text-cyan-300"}`}>
                    {approvals.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("my-actions")}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "my-actions"
                    ? "bg-cyan-500 text-black"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                My Actions
                {myActions.length > 0 && (
                  <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === "my-actions" ? "bg-black/20" : "bg-white/10 text-white/50"}`}>
                    {myActions.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "pending" && <>
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2">

              <div className="flex w-[180px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl px-3 py-2 shadow-lg">
                <Search size={16} className="text-white/50" />
                <input
                  type="text"
                  placeholder="Search application or employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 min-w-[140px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none"
              >
                {["All", "SUBMITTED", "IN_APPROVAL", "APPROVED", "REJECTED"].map((s) => (
                  <option key={s} value={s} className="bg-[#17386E] text-white">{s === "All" ? "All Status" : s.replace("_", " ")}</option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-[130px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white"
                />
                <span className="text-xs text-white/30">—</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-[130px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/50">৳</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={amountFrom}
                  onChange={(e) => setAmountFrom(e.target.value)}
                  className="h-9 w-[80px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white placeholder:text-white/30"
                />
                <span className="text-xs text-white/30">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={amountTo}
                  onChange={(e) => setAmountTo(e.target.value)}
                  className="h-9 w-[80px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white placeholder:text-white/30"
                />
              </div>

              {(search || statusFilter !== "All" || amountFrom || amountTo || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setAmountFrom("");
                    setAmountTo("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              )}

              <div className="ml-auto flex items-center gap-3 rounded-3xl border border-white/15 bg-white/5 px-4 py-2">
                <span className="text-xs font-bold text-cyan-300">{filteredData.length}</span>
                <span className="text-xs text-white/50 uppercase tracking-wide">Pending</span>
              </div>

            </div>

            {/* Cards */}
            {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-white/40">
                Loading...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="text-4xl">✅</div>
                <p className="text-sm text-white/50">No pending approvals</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 tracking-wide">Application No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 tracking-wide">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 tracking-wide">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 tracking-wide">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 tracking-wide">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-white/60 tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item: any) => (
                      <tr
                        key={item.application_id}
                        className="border-b border-white/5 transition-all duration-200 hover:bg-cyan-500/[0.06] hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.10)]"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-cyan-300">{item.application_no}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-white/70">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-white">{item.employee_name || item.employee_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-cyan-300">
                            ৳ {Number(item.requested_amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClass(item.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {formatStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => router.push(`/approvals/${item.application_id}`)}
                            className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </>}
            {/* My Actions Table */}
            {activeTab === "my-actions" && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex w-[240px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                    <Search size={16} className="text-white/50" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Application No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">My Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myActions
                        .filter((item: any) =>
                          item.application_no?.toLowerCase().includes(search.toLowerCase()) ||
                          item.employee_name?.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((item: any) => (
                          <tr
                            key={`${item.application_id}-${item.action_date}`}
                            onClick={() => router.push(`/approvals/${item.application_id}`)}
                            className="cursor-pointer border-b border-white/5 transition-all hover:bg-cyan-500/[0.06]"
                          >
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-cyan-300">{item.application_no}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white">{item.employee_name || "-"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-cyan-300">৳ {Number(item.requested_amount || 0).toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClass(item.action)}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {formatStatus(item.action)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClass(item.status)}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/60">
                                {item.action_date ? new Date(item.action_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-white/60">{item.remarks || "-"}</span>
                            </td>
                          </tr>
                        ))}
                      {myActions.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs text-white/40">
                            No actions taken yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </section>

      </div>

    </main>
    </PermissionGuard>
  );
}