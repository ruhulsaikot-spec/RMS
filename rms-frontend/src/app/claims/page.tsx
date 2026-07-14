"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { reimbursementService } from "@/services/reimbursement.service";
import { expenseTypeService } from "@/services/expense-type.service";
import PermissionGuard from "@/components/auth/permission-guard";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  ArrowRight,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

const claims = [
  {
    id: 1,
    applicationNo: "Claim-2026-001",
    type: "Travel Reimbursement",
    employee: "John Doe",
    department: "Finance Department",
    amount: 15000,
    status: "Submitted",
    date: "2026-06-01",
  },
  {
    id: 2,
    applicationNo: "Claim-2026-002",
    type: "Medical Reimbursement",
    employee: "Sarah Ahmed",
    department: "HR Department",
    amount: 8000,
    status: "Approved",
    date: "2026-06-03",
  },
  {
    id: 3,
    applicationNo: "Claim-2026-003",
    type: "Mobile Bill Reimbursement",
    employee: "Michael Smith",
    department: "Operations Department",
    amount: 2500,
    status: "Finance Review",
    date: "2026-06-04",
  },
];

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "bg-green-500/15 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/10";

    case "REJECTED":
      return "bg-red-500/15 text-red-300 border border-red-400/30 shadow-lg shadow-red-500/10";

    case "IN_APPROVAL":
      return "bg-purple-500/20 text-purple-200 border border-purple-400/30 shadow-lg shadow-purple-500/10";

    case "SUBMITTED":
      return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-lg shadow-cyan-500/10";

    case "PAID":
      return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 shadow-lg shadow-yellow-500/10";

    case "DRAFT":
      return "bg-white/10 text-white/70 border border-white/20";

    case "VERIFIED":
      return "bg-blue-500/20 text-blue-200 border border-blue-400/30 shadow-lg shadow-blue-500/10";

    default:
      return "bg-white/10 text-white border border-white/20";
  }
}

export default function ClaimsPage() {
const [claims, setClaims] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [expenseTypes, setExpenseTypes] = useState<any[]>([]);

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
    const data =
      await reimbursementService.getApplications();

    const mappedClaims =
      data.map((item: any) => ({
        id: item.id,

        applicationNo:
          item.application_no,

        type: item.claim_types || [],

        employee:
          item.employee_name,

        department:
          item.department_name,

        designation:
          item.designation_name,

        amount:
          item.requested_amount,

        status: item.status,
        statusLabel: item.status
          ? item.status.charAt(0).toUpperCase() +
            item.status.slice(1).toLowerCase().replace(/_/g, " ")
          : "-",

        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",

        createdAt: item.created_at || "",
    }));

    console.log("MAPPED CLAIMS =>", mappedClaims);
    setClaims(
      mappedClaims
    );

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const sortedClaims = [...claims].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  const filteredClaims = sortedClaims.filter((c: any) => {
    const matchesSearch =
  (c.applicationNo || "")
    .toLowerCase()
    .includes(search.toLowerCase()) ||

  (c.employee || "")
    .toLowerCase()
    .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status?.toUpperCase() === statusFilter;
    const matchesFrom = fromDate ? c.date >= fromDate : true;
    const matchesTo = toDate ? c.date <= toDate : true;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  return (
    <PermissionGuard permission="reimbursement:read">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
      {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_50%)]" />

        {/* Atmosphere */}
        <div
          className="
          absolute
          left-1/2
          top-1/2
          h-[1800px]
          w-[1800px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-500/10
          blur-[260px]
          "
        />
      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar active="claims" />
      <section className="flex-1 flex flex-col">
        <Topbar title="Claims Management" subtitle="Track and manage employee reimbursement requests" />

        {/* Body with gradient background */}
        <div
          className="
          flex-1
          p-4
          "
        >
          {/* Toolbar */}
          <div className="
          flex
          items-center
          justify-between
          mb-4
          ">
            <div className="flex items-center gap-3">
              <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl px-3 py-2 shadow-lg">
                <Search size={18} className="text-white/60" />
                <input
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs outline-none placeholder:text-white/50 text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  h-9
                  min-w-[140px]
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  px-3
                  text-xs
                  text-white
                  appearance-none
                  "
              >
                {["All", "Draft", "Submitted", "In_Approval", "Approved", "Rejected", "Verified", "Paid"].map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="bg-[#35538F] text-white"
                  >
                    {s}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-100/70 whitespace-nowrap">
                  From
                </span>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="
                  h-9
                  w-[140px]
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  px-3
                  text-xs
                  text-white
                  "
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-100/70 whitespace-nowrap">
                  To
                </span>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="
                  h-9
                  w-[140px]
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  px-3
                  text-xs
                  text-white
                  "
                />
              </div>






            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link href="/claims/new">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:from-blue-500 hover:to-cyan-400 flex items-center gap-2">
                <Plus size={16} /> New Claim
              </Button>
            </Link>
              <Button
                variant="outline"
                className="
                h-9
                rounded-xl
                border
                border-white/10
                bg-white/5
                px-4
                text-xs
                text-white
                hover:bg-white/10
                "
              >
                <Download size={16} /> Export <ChevronDown size={14} />
              </Button>
            </div>
          </div>

          {/* Applications Table */}
          <div
          className="
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          "
          >

            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div>
                <h3 className="text-lg font-semibold">
                  Applications
                </h3>

                <p className="text-sm text-white/60">
                  Manage reimbursement applications
                </p>
              </div>

              <div
              className="
              flex
              items-center
              gap-4
              rounded-3xl
              border
              border-white/15
              bg-white/5
              backdrop-blur-xl
              px-4
              py-2
              min-w-[120px]
              "
              >
                <span className="text-xs font-bold text-cyan-300">
                  {filteredClaims.length}
                </span>

                <span className="text-xs text-blue-100/60 uppercase tracking-wide">
                  Applications
                </span>
              </div>
            </div>

            <div className="p-3">
            <div className="h-full overflow-y-auto">
             <table className="w-full text-left">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Application No</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Type</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Employee</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Amount</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Status</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold">Submitted Date</th>
                  <th className="px-6 py-3 text-xs text-white font-semibold tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage).map((c) => (
                  <tr
                    key={c.id}
                    className="
                    border-b
                    border-white/10
                    transition-all
                    duration-300
                    hover:bg-cyan-500/[0.08]
                    hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)]
                    "
                  >
                    <td className="px-3 py-2 text-xs font-semibold text-cyan-300">
                    {c.applicationNo}
                  </td>
                    <td className="px-3 py-2 text-xs">
                      {Array.isArray(c.type)
                        ? c.type.map((id: string) =>
                            expenseTypes.find((e: any) => e.id === id)?.name || id
                          ).join(", ")
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="text-xs font-medium text-white">
                        {c.employee || "-"}
                      </div>

                      <div className="text-[10px] text-blue-100/60">
                        {c.department || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-cyan-300">
                      ৳ {Number(c.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1
                          px-2
                          py-1
                          text-[11px]
                          font-medium
                          rounded-full
                          ${getStatusClass(c.status)}
                        `}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                        {c.statusLabel || c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-white/80">
                      {c.date}
                    </td>
                    <td className="px-3 py-2 text-right">

                    <div className="flex justify-end gap-2">

                      <Link href={`/claims/${c.id}`}>
                        <button
                          className="
                          rounded-xl
                          border
                          border-cyan-400/20
                          bg-cyan-500/10
                          px-3
                          py-1.5
                          text-xs
                          "
                        >
                          View
                        </button>
                      </Link>

                      <button
                        onClick={() => {
                          if (c.status !== "DRAFT") {
                            toast.error("Only DRAFT applications can be edited.");
                            return;
                          }
                          window.location.href = `/claims/${c.id}/edit`;
                        }}
                        className="
                        rounded-xl
                        border
                        border-yellow-400/20
                        bg-yellow-500/10
                        px-3
                        py-1.5
                        text-xs
                        "
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
                            cancel: {
                              label: "Cancel",
                              onClick: () => {},
                            },
                          });
                        }}
                        className="
                        rounded-xl
                        border
                        border-red-400/20
                        bg-red-500/10
                        px-3
                        py-1.5
                        text-xs
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-blue-100/60">
                Showing {Math.min((currentPage - 1) * recordsPerPage + 1, filteredClaims.length)}–{Math.min(currentPage * recordsPerPage, filteredClaims.length)} of {filteredClaims.length} claims
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-blue-100/70 hover:bg-white/10 disabled:opacity-30"
                >
                  Previous
                </button>

                {Array.from({ length: Math.ceil(filteredClaims.length / recordsPerPage) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium ${
                      currentPage === page
                        ? "bg-cyan-500 text-black"
                        : "border border-white/10 bg-white/5 text-blue-100/70 hover:bg-white/10"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filteredClaims.length / recordsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredClaims.length / recordsPerPage)}
                  className="h-8 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-blue-100/70 hover:bg-white/10 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
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