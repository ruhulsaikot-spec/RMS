"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock3,
  CheckCircle,
  XCircle,
  DollarSign,
  ArrowRight,
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

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED": return "bg-green-500/15 text-green-300 border border-green-400/30";
    case "REJECTED": return "bg-red-500/15 text-red-300 border border-red-400/30";
    case "IN_APPROVAL": return "bg-purple-500/20 text-purple-200 border border-purple-400/30";
    case "SUBMITTED": return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30";
    case "PAID": return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30";
    case "DRAFT": return "bg-white/10 text-white/70 border border-white/20";
    default: return "bg-white/10 text-white border border-white/20";
  }
}

function formatStatus(status: string) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useUser();

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [approvals, claims] = await Promise.all([
        reimbursementService.getPendingApprovals(),
        reimbursementService.getApplications(),
      ]);
      setPendingApprovals(approvals || []);
      setMyClaims(claims || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", emoji: "🌅" };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", emoji: "☀️" };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", emoji: "🌇" };
    return { text: "Good Night", emoji: "🌙" };
  };

  const greeting = getGreeting();

  // Stats from my claims
  const totalClaims = myClaims.length;
  const pendingCount = myClaims.filter((c: any) => ["SUBMITTED", "IN_APPROVAL"].includes(c.status?.toUpperCase())).length;
  const approvedCount = myClaims.filter((c: any) => c.status?.toUpperCase() === "APPROVED").length;
  const rejectedCount = myClaims.filter((c: any) => c.status?.toUpperCase() === "REJECTED").length;
  const totalAmount = myClaims.reduce((sum: number, c: any) => sum + Number(c.requested_amount || 0), 0);

  const recentClaims = [...myClaims]
    .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""))
    .slice(0, 5);

  // Monthly chart data from claims
  const monthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = months[d.getMonth()];
      const amount = myClaims
        .filter((c: any) => {
          if (!c.created_at) return false;
          const cd = new Date(c.created_at);
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        })
        .reduce((sum: number, c: any) => sum + Number(c.requested_amount || 0), 0);
      return { month: label, amount };
    });
  };

  const statCards = [
    {
      label: "Total Claims",
      value: totalClaims,
      icon: FileText,
      color: "cyan",
      border: "border-cyan-500/20",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-300",
      hover: "hover:border-cyan-400/50 hover:shadow-[0_25px_60px_rgba(34,211,238,0.15)]",
      sub: "All your claims",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock3,
      color: "yellow",
      border: "border-yellow-500/20",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-300",
      hover: "hover:border-yellow-400/50 hover:shadow-[0_25px_60px_rgba(234,179,8,0.15)]",
      sub: "Awaiting approval",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      color: "green",
      border: "border-green-500/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-300",
      hover: "hover:border-green-400/50 hover:shadow-[0_25px_60px_rgba(34,197,94,0.15)]",
      sub: "Successfully processed",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      color: "red",
      border: "border-red-500/20",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-300",
      hover: "hover:border-red-400/50 hover:shadow-[0_25px_60px_rgba(239,68,68,0.15)]",
      sub: "Declined requests",
    },
    {
      label: "Total Amount",
      value: `৳ ${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: "purple",
      border: "border-purple-500/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-300",
      hover: "hover:border-purple-400/50 hover:shadow-[0_25px_60px_rgba(168,85,247,0.15)]",
      sub: "Total requested",
      wide: true,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />
      <div className="absolute left-1/2 top-1/2 h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[260px]" />

      <div className="relative z-10 flex min-h-screen">

        <Sidebar active="dashboard" />

        <section className="flex-1 flex flex-col">

          <Topbar title="Dashboard" subtitle="Reimbursement Management Overview" />

          <div className="flex-1 p-5 space-y-5">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold">
                {greeting.text}, {currentUser.employeeName} {greeting.emoji}
              </h1>
              <p className="mt-1 text-xs text-white/50">
                {pendingApprovals.length > 0
                  ? `You have ${pendingApprovals.length} pending approval${pendingApprovals.length > 1 ? "s" : ""} awaiting your action.`
                  : "No pending approvals today."}
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-5 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`group rounded-3xl border ${card.border} bg-white/[0.06] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${card.hover} ${card.wide ? "col-span-1" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-2xl ${card.iconBg} p-3`}>
                      <card.icon size={20} className={card.iconColor} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-medium text-white/60">{card.label}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">{card.value}</h3>
                  <p className="mt-1 text-xs text-white/30">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-4">

              {/* Recent Claims */}
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl h-[420px] flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Recent Claims</h3>
                  <button
                    onClick={() => router.push("/claims")}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    View All <ArrowRight size={12} />
                  </button>
                </div>

                {loading ? (
                  <div className="flex h-48 items-center justify-center text-sm text-white/40">Loading...</div>
                ) : recentClaims.length === 0 ? (
                  <div className="flex h-48 items-center justify-center text-sm text-white/40">No claims yet</div>
                ) : (
                  <div className="overflow-y-auto flex-1 mt-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="pb-3 text-left text-xs text-white/50">Application No</th>
                        <th className="pb-3 text-left text-xs text-white/50">Date</th>
                        <th className="pb-3 text-left text-xs text-white/50">Amount</th>
                        <th className="pb-3 text-left text-xs text-white/50">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentClaims.map((claim: any) => (
                        <tr
                          key={claim.id}
                          onClick={() => router.push(`/claims/${claim.id}`)}
                          className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 text-xs font-semibold text-cyan-300">{claim.application_no}</td>
                          <td className="py-3 text-xs text-white/60">{formatDate(claim.created_at)}</td>
                          <td className="py-3 text-xs font-semibold">৳ {Number(claim.requested_amount || 0).toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(claim.status)}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {formatStatus(claim.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>

              {/* Pending Approvals */}
              <div className="col-span-1 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl h-[420px] flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Pending Approvals</h3>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                    {pendingApprovals.length}
                  </span>
                </div>

                {loading ? (
                  <div className="flex h-48 items-center justify-center text-sm text-white/40">Loading...</div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center gap-2">
                    <CheckCircle size={32} className="text-green-400/50" />
                    <p className="text-xs text-white/40">All clear!</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                    {pendingApprovals.map((item: any) => (
                      <div
                        key={item.application_id}
                        onClick={() => router.push(`/approvals/${item.application_id}`)}
                        className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-cyan-300">{item.application_no}</span>
                          <ArrowRight size={12} className="text-white/30" />
                        </div>
                        <p className="mt-1 text-xs text-white/70">{item.employee_name || item.employee_id}</p>
                        <p className="mt-1 text-xs font-semibold text-white">৳ {Number(item.requested_amount || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Chart */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <h3 className="mb-4 text-base font-semibold">Claims Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData()} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#0d2147", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                    formatter={(v: any) => [`৳ ${Number(v).toLocaleString()}`, "Amount"]}
                  />
                  <Bar dataKey="amount" fill="rgba(34,211,238,0.7)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
