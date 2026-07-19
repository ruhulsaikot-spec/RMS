"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { apiClient } from "@/lib/api-client";
import { expenseTypeService } from "@/services/expense-type.service";
import { Download, Search, X } from "lucide-react";

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "IN_APPROVAL", "APPROVED", "REJECTED", "RETURNED", "VERIFIED", "PAID"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: "bg-white/10 text-white/60",
    SUBMITTED: "bg-cyan-500/20 text-cyan-300",
    IN_APPROVAL: "bg-purple-500/20 text-purple-300",
    APPROVED: "bg-green-500/20 text-green-300",
    REJECTED: "bg-red-500/20 text-red-300",
    RETURNED: "bg-yellow-500/20 text-yellow-300",
    VERIFIED: "bg-blue-500/20 text-blue-300",
    PAID: "bg-emerald-500/20 text-emerald-300",
  };
  return map[status] || "bg-white/10 text-white/60";
}

export default function ClaimsReportPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    department_id: "",
    designation_id: "",
    expense_type_id: "",
    employee_id: "",
    status: "",
    date_from: "",
    date_to: "",
  });
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/departments/").then(r => setDepartments(r.data)).catch(() => {});
    apiClient.get("/designations/").then(r => setDesignations(r.data)).catch(() => {});
    apiClient.get("/reports/employees").then(r => setEmployees(r.data)).catch(() => {});
    expenseTypeService.getExpenseTypes().then(setExpenseTypes).catch(() => {});
    fetchReport();
  }, []);

  const fetchReport = async (f = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.department_id) params.append("department_id", f.department_id);
      if (f.designation_id) params.append("designation_id", f.designation_id);
      if (f.expense_type_id) params.append("expense_type_id", f.expense_type_id);
      if (f.employee_id) params.append("employee_id", f.employee_id);
      if (f.status) params.append("status", f.status);
      if (f.date_from) params.append("date_from", f.date_from);
      if (f.date_to) params.append("date_to", f.date_to);
      const res = await apiClient.get(`/reports/claims?${params.toString()}`);
      setRows(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => fetchReport(filters);

  const handleReset = () => {
    const reset = { department_id: "", designation_id: "", expense_type_id: "", employee_id: "", status: "", date_from: "", date_to: "" };
    setFilters(reset);
    fetchReport(reset);
  };

  const exportCSV = () => {
    const headers = ["Claim No", "Submission Date", "Employee", "Department", "Designation", "Expense Type", "Requested Amount", "Paid Amount", "Status"];
    const csvRows = [
      headers.join(","),
      ...rows.map(r => [
        r.application_no,
        r.submitted_at,
        r.employee_name,
        r.department,
        r.designation,
        `"${(r.expense_type || "").replace(/"/g, '""')}"`,
        r.requested_amount,
        r.paid_amount,
        r.status
      ].join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claims_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const totalRequested = rows.reduce((s, r) => s + Number(r.requested_amount || 0), 0);
  const totalPaid = rows.reduce((s, r) => s + Number(r.paid_amount || 0), 0);

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar active="reports" />
        <section className="flex-1 flex flex-col">
          <Topbar title="Reports" subtitle="Claims Summary Report" />
          <div className="p-6">
            <div className="mx-auto max-w-7xl space-y-5">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-white">Claim Summary Report</h1>
                  <p className="mt-1 text-xs text-white/60">{rows.length} records found</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                  <Download size={14} /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <h3 className="mb-4 text-sm font-semibold text-white">Filters</h3>
                <div className="grid grid-cols-7 gap-3">
                  <select value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Departments</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0d1628]">{d.name}</option>)}
                  </select>
                  <select value={filters.designation_id} onChange={e => setFilters({...filters, designation_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Designations</option>
                    {designations.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0d1628]">{d.name}</option>)}
                  </select>
                  <select value={filters.expense_type_id} onChange={e => setFilters({...filters, expense_type_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Expense Types</option>
                    {expenseTypes.map((d: any) => <option key={d.id} value={d.id} className="bg-[#0d1628]">{d.name}</option>)}
                  </select>
                  <select value={filters.employee_id} onChange={e => setFilters({...filters, employee_id: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Employees</option>
                    {employees.map((d: any) => <option key={d.id} value={d.id} style={{backgroundColor: "#0d1628", color: "white"}}>{d.name || d.full_name}</option>)}
                  </select>
                  <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors">
                    <option value="" className="bg-[#0d1628]">All Status</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#0d1628]">{s}</option>)}
                  </select>
                  <input type="date" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors" />
                  <input type="date" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={handleFilter} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                    <Search size={13} /> Apply Filter
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                    <X size={13} /> Reset
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/60">Total Records</p>
                  <p className="mt-1 text-2xl font-bold text-white">{rows.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/60">Total Requested</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-300">৳ {totalRequested.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs text-white/60">Total Paid</p>
                  <p className="mt-1 text-2xl font-bold text-green-300">৳ {totalPaid.toLocaleString()}</p>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.04]">
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Claim No</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Submission Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Employee</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Department</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Designation</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Expense Type</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Requested</th>
                        <th className="px-4 py-3 text-right font-semibold text-white/60">Paid</th>
                        <th className="px-4 py-3 text-left font-semibold text-white/60">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={9} className="py-12 text-center text-white/40">Loading...</td></tr>
                      ) : rows.length === 0 ? (
                        <tr><td colSpan={9} className="py-12 text-center text-white/40">No records found</td></tr>
                      ) : rows.map((r, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-semibold text-cyan-300">{r.application_no}</td>
                          <td className="px-4 py-3 text-white/70">{r.submitted_at}</td>
                          <td className="px-4 py-3 text-white">{r.employee_name}</td>
                          <td className="px-4 py-3 text-white/70">{r.department}</td>
                          <td className="px-4 py-3 text-white/70">{r.designation}</td>
                          <td className="px-4 py-3 text-white/70">{r.expense_type}</td>
                          <td className="px-4 py-3 text-right font-semibold text-white">৳ {Number(r.requested_amount).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-green-300">৳ {Number(r.paid_amount).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {rows.length > 0 && (
                      <tfoot>
                        <tr className="border-t border-white/10 bg-white/[0.04]">
                          <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-white/60">Total</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-cyan-300">৳ {totalRequested.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-xs font-bold text-green-300">৳ {totalPaid.toLocaleString()}</td>
                          <td></td>
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