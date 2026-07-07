"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Clock3,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useUser } from "@/contexts/user-context";
import { reimbursementService } from "@/services/reimbursement.service";


export default function DashboardPage() {

  const router = useRouter();

  const {
    currentUser,
  } = useUser();

  const [pendingApprovals, setPendingApprovals] =
    useState<any[]>([]);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    try {

      const data =
        await reimbursementService.getPendingApprovals();

      setPendingApprovals(
        data
      );

    } catch (error) {

      console.error(
        "Pending approval load failed",
        error
      );

    }
  };

  const [selectedClaim, setSelectedClaim] = useState<{

    claimNo: string;
    type: string;
    amount: string;
    status: string;
  } | null>(null);

  const getGreeting = () => {

    const hour =
      new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good Evening";
    }

    return "Good Night";
  };

  const claimsTrendData = [
    { month: "Jan", amount: 180000 },
    { month: "Feb", amount: 240000 },
    { month: "Mar", amount: 210000 },
    { month: "Apr", amount: 320000 },
    { month: "May", amount: 450000 },
    { month: "Jun", amount: 380000 },
  ];
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

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

      <div className="relative z-10 flex min-h-screen">

        {/* Sidebar */}
        <Sidebar active="dashboard" />

        {/* Content */}
        <section className="flex-1">

          <Topbar
            title="Dashboard"
            subtitle="Reimbursement Overview"
          />

          {/* Dashboard Body */}
          <div className="p-4">

            <div className="mb-5">

              <h1 className="text-3xl font-bold">
                {getGreeting()}, {currentUser.employeeName}
                {" "}
                {new Date().getHours() < 12
                  ? "🌅"
                  : new Date().getHours() < 17
                    ? "☀️"
                    : new Date().getHours() < 21
                      ? "🌇"
                      : "🌙"}
              </h1>

              <p className="mt-1 text-xs text-white/60">
                You have 18 claims awaiting action today.
              </p>

            </div>

            {/* Placeholder */}
            <div
              className="
              grid
              gap-6
              grid-cols-4
              "
            >

              {/* Total Claims */}
              <div
                className="                
                group
                rounded-3xl
                border
                border-blue-500/20
                bg-white/[0.06]
                p-4
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-blue-400/50
                hover:shadow-[0_25px_60px_rgba(234,179,8,0.2)]
                "
              >
                <div className="flex items-center justify-between">

                  <div
                    className="
                    rounded-2xl
                    bg-cyan-500/10
                    p-3
                    "
                  >
                    <FileText
                      size={22}
                      className="text-cyan-300"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp size={16} />
                    <span className="text-sm">
                      12%
                    </span>
                  </div>

                </div>

                <p className="mt-4 text-sm font-medium text-blue-100/70">
                  Total Claims
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  245
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  All submitted claims
                </p>

              </div>

              {/* Pending */}
              <div
                className="
                group
                rounded-3xl
                border
                border-yellow-500/20
                bg-white/[0.06]
                p-4
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-yellow-400/50
                hover:shadow-[0_25px_60px_rgba(234,179,8,0.2)]
                "
              >
                <div className="flex items-center justify-between">

                  <div className="rounded-2xl bg-yellow-500/10 p-3">
                    <Clock3
                      size={22}
                      className="text-yellow-300"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-yellow-300">
                    <TrendingUp size={16} />
                    <span className="text-sm">
                      4%
                    </span>
                  </div>

                </div>

                <p className="mt-4 text-sm font-medium text-blue-100/70">
                  Pending
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  18
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  Needs your attention
                </p>

              </div>

              {/* Approved */}
              <div
                className="
                group
                rounded-3xl
                border
                border-green-500/20
                bg-white/[0.04]
                p-4
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-green-400/40
                hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)]
                "
              >
                <div className="flex items-center justify-between">

                  <div className="rounded-2xl bg-green-500/10 p-3">
                    <CheckCircle
                      size={22}
                      className="text-green-300"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp size={16} />
                    <span className="text-sm">
                      15%
                    </span>
                  </div>

                </div>

                <p className="mt-4 text-sm font-medium text-blue-100/70">
                  Approved
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  210
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  successfully processed
                </p>

              </div>

              {/* Rejected */}
              <div
                className="
                group
                rounded-3xl
                border
                border-red-500/20
                bg-white/[0.04]
                p-4
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-red-400/40
                hover:shadow-[0_20px_50px_rgba(239,68,68,0.15)]
                "
              >
                <div className="flex items-center justify-between">

                  <div className="rounded-2xl bg-red-500/10 p-3">
                    <XCircle
                      size={22}
                      className="text-red-300"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-red-400">
                    <TrendingDown size={16} />
                    <span className="text-sm">
                      2%
                    </span>
                  </div>

                </div>

                <p className="mt-4 text-sm font-medium text-blue-100/70">
                  Rejected
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  17
                </h3>

                <p className="mt-2 text-xs text-white/40">
                  declined requests
                </p>

              </div>

            </div>

            {/* Dashboard Content Grid */}
            <div
              className="
              mt-8
              grid
              gap-6
              lg:grid-cols-3
              items-start
              "
            >

              {/* Recent Claims */}
              <div
                className="
                lg:col-span-2
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-4
                backdrop-blur-xl
                h-[420px]
                flex
                flex-col
                "
              >
                <div className="mb-5 flex items-center justify-between">

                  <h3 className="text-lg font-semibold">
                    Recent Claims
                  </h3>

                  <button
                    className="
                    text-sm
                    text-cyan-300
                    hover:text-cyan-200
                    "
                  >
                    View All
                  </button>

                </div>

                <div
                  className="
                  h-[330px]
                  overflow-y-auto
                  "
                >
                  <div className="pr-2">

                    <table className="w-full">

                      <thead>
                        <tr className="border-b border-white/10">

                          <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Claim No
                          </th>

                          <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Submitted Date
                          </th>

                          <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Type
                          </th>

                          <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Amount
                          </th>

                          <th className="pb-4 text-left text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Status
                          </th>

                          <th className="pb-4 text-center text-xs font-semibold uppercase tracking-wider text-cyan-200/70">
                            Action
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        <tr
                          className="
                      border-b
                      border-white/5
                      transition-all
                      duration-300
                      hover:bg-cyan-500/[0.04]
                      hover:backdrop-blur-xl
                      "
                        >
                          <td className="py-3 font-semibold text-white">
                            CLM-1001
                          </td>
                          <td>03 Jun 2026</td>
                          <td>Travel Expense</td>
                          <td className="font-semibold text-cyan-300">
                            ৳ 12,500
                          </td>
                          <td>
                            <span
                              className="
                          inline-flex
                          items-center
                          rounded-full
                          border
                          border-yellow-400/20
                          bg-yellow-500/10
                          px-2.5
                          py-0.5
                          text-xs
                          font-medium
                          text-yellow-300
                          "
                            >
                              Pending
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              onClick={() =>
                                setSelectedClaim({
                                  claimNo: "CLM-1001",
                                  type: "Travel Expense",
                                  amount: "৳ 12,500",
                                  status: "Pending",
                                })
                              }
                              className="
                          rounded-lg
                          border
                          border-cyan-400/20
                          bg-cyan-500/10
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          text-cyan-300
                          transition-all
                          duration-300
                          hover:border-cyan-400/40
                          hover:bg-cyan-500/20
                          hover:text-cyan-200
                          "
                            >
                              Details
                            </button>
                          </td>
                        </tr>

                        <tr
                          className="
                      border-b
                      border-white/5
                      transition-all
                      duration-300
                      hover:bg-cyan-500/[0.04]
                      "
                        >
                          <td className="py-3 font-semibold text-white">
                            CLM-1002
                          </td>
                          <td>05 Jun 2026</td>
                          <td>Food Allowance</td>
                          <td className="font-semibold text-cyan-300">
                            ৳ 2,800
                          </td>
                          <td>
                            <span
                              className="
                          inline-flex
                          items-center
                          rounded-full
                          border
                          border-green-400/20
                          bg-green-500/10
                          px-2.5
                          py-0.5
                          text-xs
                          font-medium
                          text-green-300
                          "
                            >
                              Approved
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              onClick={() =>
                                setSelectedClaim({
                                  claimNo: "CLM-1002",
                                  type: "Food Allowance",
                                  amount: "৳ 2,800",
                                  status: "Approved",
                                })
                              }
                              className="
                          rounded-lg
                          border
                          border-cyan-400/20
                          bg-cyan-500/10
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          text-cyan-300
                          transition-all
                          duration-300
                          hover:border-cyan-400/40
                          hover:bg-cyan-500/20
                          hover:text-cyan-200
                          "
                            >
                              Details
                            </button>
                          </td>
                        </tr>

                        <tr
                          className="
                      transition-all
                      duration-300
                      hover:bg-cyan-500/[0.04]
                      "
                        >
                          <td className="py-3 font-semibold text-white">
                            CLM-1003
                          </td>
                          <td>10 Jun 2026</td>
                          <td>Medical</td>
                          <td className="font-semibold text-cyan-300">
                            ৳ 5,400
                          </td>
                          <td>
                            <span
                              className="
                          inline-flex
                          items-center
                          rounded-full
                          border
                          border-red-400/20
                          bg-red-500/10
                          px-2.5
                          py-0.5
                          text-xs
                          font-medium
                          text-red-300
                          "
                            >
                              Rejected
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              onClick={() =>
                                setSelectedClaim({
                                  claimNo: "CLM-1003",
                                  type: "Medical",
                                  amount: "৳ 5,400",
                                  status: "Rejected",
                                })
                              }
                              className="
                          rounded-lg
                          border
                          border-cyan-400/20
                          bg-cyan-500/10
                          px-3
                          py-1.5
                          text-xs
                          font-medium
                          text-cyan-300
                          transition-all
                          duration-300
                          hover:border-cyan-400/40
                          hover:bg-cyan-500/20
                          hover:text-cyan-200
                          "
                            >
                              Details
                            </button>
                          </td>
                        </tr>

                      </tbody>

                    </table>
                    {/* <div className="mt-6 border-t border-white/10 pt-4">

                    <div className="grid grid-cols-3 gap-4">

                      <div>
                        <p className="text-xs text-white/50">
                          Total Claims
                        </p>

                        <p className="mt-1 text-lg font-semibold text-cyan-300">
                          245
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/50">
                          Total Amount
                        </p>

                        <p className="mt-1 text-lg font-semibold text-cyan-300">
                          ৳ 452,000
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-white/50">
                          Pending Claims
                        </p>

                        <p className="mt-1 text-lg font-semibold text-yellow-300">
                          18
                        </p>
                      </div>

                    </div>

                  </div>*/}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-6">



                {/* Pending Approvals */}
                <div
                  className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-5
                  backdrop-blur-xl
                  h-[420px]
                  flex
                  flex-col
                  "
                >
                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="text-lg font-semibold">
                      Pending Approvals
                      {" "}
                      ({pendingApprovals.length})
                    </h3>

                    <button
                      className="
                      text-sm
                      text-cyan-300
                      hover:text-cyan-200
                      "
                    >
                      View All
                    </button>

                  </div>

                  <div
                    className="
                    flex-1
                    space-y-3
                    overflow-y-auto
                    pr-2
                    max-h-[320px]
                    "
                  >

                    <div className="space-y-3">

                      {pendingApprovals.length === 0 && (

                        <div
                          className="
                            text-center
                            text-white/50
                            py-10
                            "
                        >
                          No pending approvals found
                        </div>

                      )}

                      {pendingApprovals.map(
                        (item: any) => (

                          <div
                              key={item.application_id}
                              onClick={() =>
                                router.push(
                                  `/claims/${item.application_id}`
                                )
                              }
                              className="
                              rounded-2xl
                              border
                              border-yellow-500/20
                              bg-white/5
                              p-4
                              transition-all
                              duration-200
                              hover:border-yellow-400/40
                              hover:bg-white/10
                              cursor-pointer
                              "
                          >

                            <div className="flex items-start justify-between">

                              <div>

                                <p className="text-sm font-semibold">
                                  {item.application_no}
                                </p>

                                <p className="mt-1 text-xs text-white/40">
                                  Employee ID: {item.employee_id}
                                </p>

                              </div>

                              <span
                                className="
                                  rounded-full
                                  bg-yellow-500/10
                                  px-2
                                  py-1
                                  text-xs
                                  text-yellow-300
                                  "
                              >
                                {item.status}
                              </span>

                            </div>

                            <div className="mt-3 flex items-center justify-between">

                              <span
                                className="
                                  text-sm
                                  font-semibold
                                  text-cyan-300
                                  "
                              >
                                ৳ {item.requested_amount}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* Analytics Row */}
              <div
                className="
              mt-6
              grid
              gap-6
              lg:grid-cols-3
              "
              >

                {/* Claims Trend */}
                <div
                  className="
                lg:col-span-2
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-5
                backdrop-blur-xl
                h-[400px]
                flex
                flex-col
                "
                >

                  <div className="mb-6 flex items-center justify-between">

                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      Claims Trend
                    </h3>

                    <span className="text-sm font-medium text-cyan-300">
                      Last 6 Months
                    </span>

                  </div>

                  <div
                    className="
                  h-[300px]
                  rounded-2xl
                  border
                  border-cyan-500/10
                  bg-gradient-to-b
                  from-cyan-500/[0.03]
                  to-transparent
                  p-4
                  "
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={claimsTrendData}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 0,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="4 4"
                          stroke="rgba(255,255,255,0.06)"
                        />

                        <XAxis
                          dataKey="month"
                          tick={{
                            fill: "#94A3B8",
                            fontSize: 12,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fill: "#94A3B8",
                            fontSize: 12,
                          }}
                          tickFormatter={(value) => `${value / 1000}K`}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            background: "#0B1E42",
                            border: "1px solid rgba(34,211,238,0.25)",
                            borderRadius: "20px",
                            color: "#fff",
                          }}
                          formatter={(value) => {
                            const amount = Number(value ?? 0);

                            return [
                              `৳${amount.toLocaleString()}`,
                              "Amount",
                            ];
                          }}
                        />

                        <Bar
                          dataKey="amount"
                          radius={[18, 18, 0, 0]}
                          fill="#38BDF8"
                          barSize={42}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                </div>


                {/* Activity Feed */}
                <div
                  className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-5
                backdrop-blur-xl
                h-[400px]
                flex
                flex-col
                "
                >
                  <h3 className="mb-6 text-lg font-semibold tracking-tight">
                    Recent Activity
                  </h3>

                  <div
                    className="
                  flex-1
                  overflow-y-auto
                  pr-2
                  min-h-0
                  "
                  >
                    <div className="space-y-4">

                      {/* Rejected */}
                      <div
                        className="
                    flex
                    gap-4
                    rounded-2xl
                    border
                    border-red-500/10
                    bg-red-500/[0.03]
                    p-4
                    "
                      >

                        <div className="mt-1 h-3 w-3 rounded-full bg-red-400" />

                        <div>
                          <p className="text-sm font-semibold text-red-300">
                            Claim CLM-1003 Rejected
                          </p>

                          <p className="text-xs text-white/40">
                            Reimbursement request declined
                          </p>

                          <span className="mt-1 block text-xs text-white/30">
                            10 min ago
                          </span>
                        </div>

                      </div>

                      {/* Approved */}
                      <div
                        className="
                    flex
                    gap-4
                    rounded-2xl
                    border
                    border-green-500/10
                    bg-green-500/[0.03]
                    p-4
                    "
                      >

                        <div className="mt-1 h-3 w-3 rounded-full bg-green-400" />

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-300">
                            Food Allowance Approved
                          </p>

                          <p className="text-xs text-white/40">
                            Claim successfully approved
                          </p>

                          <span className="mt-1 block text-xs text-white/30">
                            1 hour ago
                          </span>
                        </div>

                      </div>

                      {/* Submitted */}
                      <div
                        className="
                    flex
                    gap-4
                    rounded-2xl
                    border
                    border-cyan-500/10
                    bg-cyan-500/[0.03]
                    p-4
                    "
                      >

                        <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400" />

                        <div>
                          <p className="text-sm font-semibold text-cyan-300">
                            New Claim Submitted
                          </p>

                          <p className="text-xs text-white/40">
                            Awaiting approval workflow
                          </p>

                          <span className="mt-1 block text-xs text-white/30">
                            Today
                          </span>
                        </div>
                      </div>


                    </div>

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