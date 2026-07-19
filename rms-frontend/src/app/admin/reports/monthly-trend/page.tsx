"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { apiClient } from "@/lib/api-client";
import { Download, Search, X } from "lucide-react";

const MONTHS = [
  { value: "", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function MonthlyTrendReportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    year: String(currentYear),
    month: "",
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (f = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.year) params.append("year", f.year);
      if (f.month) params.append("month", f.month);
      const res = await apiClient.get(`/reports/monthly-trend?${params.toString()}`);
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchReport(filters);

  const handleReset = () => {
    const reset = { year: String(currentYear), month: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  const exportCSV = () => {
    const headers = ["Year", "Month", "Total Claims", "Requested Amount", "Rejected Amount", "Verified Amount", "Paid Amount"];
    const csvRows = [
      headers.join(","),
      ...rows.map(r => [
        r.year, r.month_name,
        r.total_claims, r.requested_amount,
        r.rejected_amount, r.verified_amount, r.paid_amount
      ].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly_trend_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const totals = rows.reduce((acc, r) => ({
    total_claims: acc.total_claims + r.total_claims,
    requested_amount: acc.requested_amount + Number(r.requested_amount),
    rejected_amount: acc.rejected_amount + Number(r.rejected_amount),
    verified_amount: acc.verified_amount + Number(r.verified_amount),
    paid_amount: acc.paid_amount + Number(r.paid_amount),
  }), { total_claims: 0, requested_amount: 0, rejected_amount: 0, verified_amount: 0, paid_amount: 0 });

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar active="reports" />
        <section className="flex-1 flex flex-col">
          <Topbar title="Reports" subtitle="Monthly Claim Trend" />
          <div className="p-6">
            <div className="mx-auto max-w-7xl space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">Monthly Claim Trend Report</h1>
                  <p className="mt-1 text-xs text-white/60">{rows.length} months found</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-semibold text-white">Filters</h3>
                <div className="flex gap-3">
                  <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Years</option>
                    {YEARS.map(y => <option key={y} value={String(y)} className="bg-[#0d1628]">{y}</option>)}
                  </select>
                  <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    {MONTHS.map(m => <option key={m.value} value={m.value} className="bg-[#0d1628]">{m.label}</option>)}
                  </select>
                  <button onClick={handleFilter} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                    <Search size={13} /> Apply
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                    <X size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-5 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/60">Total Claims</p>
                  <p className="mt-1 text-2xl font-bold text-white">{totals.total_claims}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-xs text-cyan-300">Requested</p>
                  <p className="mt-1 text-xl font-bold text-cyan-300">৳ {totals.requested_amount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-red-300">Rejected</p>
                  <p className="mt-1 text-xl font-bold text-red-300">৳ {totals.rejected_amount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-xs text-blue-300">Verified</p>
                  <p className="mt-1 text-xl font-bold text-blue-300">৳ {totals.verified_amount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-green-300">Paid</p>
                  <p className="mt-1 text-xl font-bold text-green-300">৳ {totals.paid_amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04]">
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Year</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Month</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Total Claims</th>
                        <th className="px-4 py-3 text-right font-semibold text-cyan-300">Requested (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-red-300">Rejected (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-blue-300">Verified (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-green-300">Paid (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="py-12 text-center text-white/40">Loading...</td></tr>
                      ) : rows.length === 0 ? (
                        <tr><td colSpan={7} className="py-12 text-center text-white/40">No records found</td></tr>
                      ) : rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{r.year}</td>
                          <td className="px-4 py-3 text-white">{r.month_name}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">{r.total_claims}</td>
                          <td className="px-4 py-3 text-right text-cyan-300">৳ {Number(r.requested_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-red-300">৳ {Number(r.rejected_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-blue-300">৳ {Number(r.verified_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-green-300">৳ {Number(r.paid_amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    {rows.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-white/[0.04]">
                          <td colSpan={2} className="px-4 py-3 text-xs font-bold text-white/60">Total</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-white">{totals.total_claims}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-cyan-300">৳ {totals.requested_amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-red-300">৳ {totals.rejected_amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-blue-300">৳ {totals.verified_amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-green-300">৳ {totals.paid_amount.toLocaleString()}</td>
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
  );
}