"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { apiClient } from "@/lib/api-client";
import { Download, Search, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "IN_APPROVAL", label: "Manager Review" },
  { value: "VERIFIED", label: "Finance Review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "RETURNED", label: "Returned" },
  { value: "PAID", label: "Paid" },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-white/60",
  SUBMITTED: "text-cyan-300",
  IN_APPROVAL: "text-purple-300",
  VERIFIED: "text-blue-300",
  APPROVED: "text-green-300",
  REJECTED: "text-red-300",
  RETURNED: "text-yellow-300",
  PAID: "text-emerald-300",
};

const STATUS_BG: Record<string, string> = {
  DRAFT: "bg-white/5 border-white/10",
  SUBMITTED: "bg-cyan-500/10 border-cyan-500/20",
  IN_APPROVAL: "bg-purple-500/10 border-purple-500/20",
  VERIFIED: "bg-blue-500/10 border-blue-500/20",
  APPROVED: "bg-green-500/10 border-green-500/20",
  REJECTED: "bg-red-500/10 border-red-500/20",
  RETURNED: "bg-yellow-500/10 border-yellow-500/20",
  PAID: "bg-emerald-500/10 border-emerald-500/20",
};

export default function StatusSummaryReportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (f = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.status) params.append("status", f.status);
      if (f.date_from) params.append("date_from", f.date_from);
      if (f.date_to) params.append("date_to", f.date_to);
      const res = await apiClient.get(`/reports/status-summary?${params.toString()}`);
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchReport(filters);

  const handleReset = () => {
    const reset = { status: "", date_from: "", date_to: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  const exportCSV = () => {
    const headers = ["Status", "Count", "Total Amount (৳)"];
    const csvRows = [
      headers.join(","),
      ...rows.map(r => [r.label, r.count, r.total_amount].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `status_summary_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const totalClaims = rows.reduce((s, r) => s + r.count, 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.total_amount), 0);

  return (
    <PermissionGuard permission="report:status_summary">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar active="reports" />
        <section className="flex-1 flex flex-col">
          <Topbar title="Reports" subtitle="Claim Status Summary" />
          <div className="p-6">
            <div className="mx-auto max-w-7xl space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">Claim Status Summary</h1>
                  <p className="mt-1 text-xs text-white/60">Status wise claim breakdown</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-semibold text-white">Filters</h3>
                <div className="flex gap-3">
                  <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value} className="bg-[#0d1628]">{s.label}</option>)}
                  </select>
                  <input type="date" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors" />
                  <input type="date" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors" />
                  <button onClick={handleFilter} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                    <Search size={13} /> Apply
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                    <X size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                {rows.map((r) => (
                  <div key={r.status} className={`rounded-2xl border ${STATUS_BG[r.status] || "bg-white/5 border-white/10"} p-4`}>
                    <p className={`text-xs font-semibold ${STATUS_COLORS[r.status] || "text-white/60"}`}>{r.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{r.count}</p>
                    <p className={`mt-1 text-xs ${STATUS_COLORS[r.status] || "text-white/60"}`}>৳ {Number(r.total_amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04]">
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Status</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Total Claims</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Total Amount (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={4} className="py-12 text-center text-white/40">Loading...</td></tr>
                      ) : rows.filter(r => r.count > 0).length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-white/40">No records found</td></tr>
                      ) : rows.filter(r => r.count > 0).map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border ${STATUS_BG[r.status]}`}>
                              <span className={STATUS_COLORS[r.status]}>{r.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-white">{r.count}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${STATUS_COLORS[r.status]}`}>৳ {Number(r.total_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-white/60">
                            {totalClaims > 0 ? ((r.count / totalClaims) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {rows.filter(r => r.count > 0).length > 0 && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-white/[0.04]">
                          <td className="px-4 py-3 text-xs font-bold text-white/60">Total</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-white">{totalClaims}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-cyan-300">৳ {totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-white/60">100%</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
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