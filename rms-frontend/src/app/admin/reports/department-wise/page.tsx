"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { apiClient } from "@/lib/api-client";
import { expenseTypeService } from "@/services/expense-type.service";
import { Download, Search, X } from "lucide-react";

export default function DepartmentWiseReportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    department_id: "",
    expense_type_id: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    apiClient.get("/departments/").then(r => setDepartments(r.data)).catch(() => {});
    expenseTypeService.getExpenseTypes().then(setExpenseTypes).catch(() => {});
    fetchReport();
  }, []);

  const fetchReport = async (f = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.department_id) params.append("department_id", f.department_id);
      if (f.expense_type_id) params.append("expense_type_id", f.expense_type_id);
      if (f.date_from) params.append("date_from", f.date_from);
      if (f.date_to) params.append("date_to", f.date_to);
      const res = await apiClient.get(`/reports/department-expense?${params.toString()}`);
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchReport(filters);

  const handleReset = () => {
    const reset = { department_id: "", expense_type_id: "", date_from: "", date_to: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  const exportCSV = () => {
    const headers = ["Department", "Expense Type", "Total Claims", "Requested (৳)", "Verified (৳)", "Paid (৳)"];
    const csvRows = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.department}"`,
        `"${r.expense_type}"`,
        r.total_claims,
        r.total_requested,
        r.total_verified,
        r.total_paid,
      ].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `department_wise_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const totals = rows.reduce((acc, r) => ({
    total_claims: acc.total_claims + r.total_claims,
    total_requested: acc.total_requested + Number(r.total_requested),
    total_verified: acc.total_verified + Number(r.total_verified),
    total_paid: acc.total_paid + Number(r.total_paid),
  }), { total_claims: 0, total_requested: 0, total_verified: 0, total_paid: 0 });

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar active="reports" />
        <section className="flex-1 flex flex-col">
          <Topbar title="Reports" subtitle="Department Wise Expense Report" />
          <div className="p-6">
            <div className="mx-auto max-w-7xl space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">Department Wise Expense Report</h1>
                  <p className="mt-1 text-xs text-white/60">{rows.length} records found</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-semibold text-white">Filters</h3>
                <div className="flex gap-3">
                  <select value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Departments</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0d1628]">{d.name}</option>)}
                  </select>
                  <select value={filters.expense_type_id} onChange={e => setFilters({...filters, expense_type_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Expense Types</option>
                    {expenseTypes.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0d1628]">{d.name}</option>)}
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

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/60">Total Claims</p>
                  <p className="mt-1 text-2xl font-bold text-white">{totals.total_claims}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-xs text-cyan-300">Total Requested</p>
                  <p className="mt-1 text-xl font-bold text-cyan-300">৳ {totals.total_requested.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-xs text-blue-300">Total Verified</p>
                  <p className="mt-1 text-xl font-bold text-blue-300">৳ {totals.total_verified.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-green-300">Total Paid</p>
                  <p className="mt-1 text-xl font-bold text-green-300">৳ {totals.total_paid.toLocaleString()}</p>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04]">
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Department</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Expense Type</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Total Claims</th>
                        <th className="px-4 py-3 text-right font-semibold text-cyan-300">Requested (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-blue-300">Verified (৳)</th>
                        <th className="px-4 py-3 text-right font-semibold text-green-300">Paid (৳)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="py-12 text-center text-white/40">Loading...</td></tr>
                      ) : rows.length === 0 ? (
                        <tr><td colSpan={6} className="py-12 text-center text-white/40">No records found</td></tr>
                      ) : rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">{r.department}</td>
                          <td className="px-4 py-3 text-white/70">{r.expense_type}</td>
                          <td className="px-4 py-3 text-right font-bold text-white">{r.total_claims}</td>
                          <td className="px-4 py-3 text-right text-cyan-300">৳ {Number(r.total_requested).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-blue-300">৳ {Number(r.total_verified).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-green-300">৳ {Number(r.total_paid).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    {rows.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-white/[0.04]">
                          <td colSpan={2} className="px-4 py-3 text-xs font-bold text-white/60">Total</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-white">{totals.total_claims}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-cyan-300">৳ {totals.total_requested.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-blue-300">৳ {totals.total_verified.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-green-300">৳ {totals.total_paid.toLocaleString()}</td>
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