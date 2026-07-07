"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { reimbursementService } from "@/services/reimbursement.service";
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
  switch (status) {
    case "Approved":
      return "bg-green-500/15 text-green-300 border border-green-400/30 shadow-lg shadow-green-500/10";

    case "Rejected":
      return "bg-red-500/15 text-red-300 border border-red-400/30 shadow-lg shadow-red-500/10";

    case "Finance Review":
      return "bg-purple-500/20 text-purple-200 border border-purple-400/30 shadow-lg shadow-purple-500/10";

    case "Submitted":
      return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-lg shadow-cyan-500/10";

    case "Paid":
      return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 shadow-lg shadow-yellow-500/10";

    default:
      return "bg-white/10 text-white border border-white/20";
  }
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadClaims();
}, []);

const loadClaims = async () => {
  try {
    const data =
      await reimbursementService.getApplications();

    const mappedClaims =
      data.map((item: any) => ({
        id: item.id,

        applicationNo:
          item.application_no,

        type:
          item.claim_type_name ||
          item.reimbursement_type_id ||
          "-",

        employee:
          item.employee_name,

        department:
          item.department_name,

        designation:
          item.designation_name,

        amount:
          item.requested_amount,

        status:
          item.status,

        date: "-",
    }));

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

  const filteredClaims = claims.filter((c: any) => {
    const matchesSearch =
  (c.applicationNo || "")
    .toLowerCase()
    .includes(search.toLowerCase()) ||

  (c.employee || "")
    .toLowerCase()
    .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesFrom = fromDate ? c.date >= fromDate : true;
    const matchesTo = toDate ? c.date <= toDate : true;
    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  return (
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
                bg-[#35538F]
                px-3
                text-xs
                text-white
                appearance-none
                "
              >
                {["All", "Submitted", "Finance Review", "Approved", "Rejected", "Paid"].map((s) => (
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
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Application No</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Type</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Employee</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Amount</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Status</th>
                  <th className="px-3 py-2 text-[11px] text-white font-semibold uppercase">Submitted Date</th>
                  <th className="px-6 py-3 text-xs text-white font-semibold tracking-wide uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c) => (
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
                      {c.type}
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
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-white/80">
                      -
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

                      <Link href={`/claims/${c.id}?mode=edit`}>
                        <button
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
                      </Link>

                      <button
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
              <p className="text-xs text-blue-100/60">Showing 1–3 of {filteredClaims.length} claims</p>
              <div className="flex gap-1">
                <button className="
                  h-8
                  px-3
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-xs
                  text-blue-100/70
                  hover:bg-white/10">
                  Previous
                </button>

                <button className="
                  h-8
                  px-3
                  rounded-lg
                  bg-cyan-500
                  text-xs
                  font-medium
                  text-black">
                  1
                </button>

                <button className="
                  h-8
                  px-3
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-xs
                  text-blue-100/70
                  hover:bg-white/10
                  ">
                  2
                </button>

                <button className="
                  h-8
                  px-3
                  rounded-lg
                  border
                  border-white/10
                  bg-white/5
                  text-xs
                  text-blue-100/70
                  hover:bg-white/10">
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
);
}