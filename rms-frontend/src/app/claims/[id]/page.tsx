"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { reimbursementService } from "@/services/reimbursement.service";
import { expenseTypeService } from "@/services/expense-type.service";
import { projectService } from "@/services/project.service";

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "bg-green-500/15 text-green-300 border border-green-400/30";
    case "REJECTED":
      return "bg-red-500/15 text-red-300 border border-red-400/30";
    case "IN_APPROVAL":
      return "bg-purple-500/20 text-purple-200 border border-purple-400/30";
    case "SUBMITTED":
      return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30";
    case "PAID":
      return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30";
    case "DRAFT":
      return "bg-white/10 text-white/70 border border-white/20";
    case "VERIFIED":
      return "bg-blue-500/20 text-blue-200 border border-blue-400/30";
    case "PENDING":
      return "bg-orange-500/20 text-orange-200 border border-orange-400/30";
    default:
      return "bg-white/10 text-white border border-white/20";
  }
}

function formatStatus(status: string) {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, " ");
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClaimDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadClaim();
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [expenseTypeData, projectData] = await Promise.all([
        expenseTypeService.getExpenseTypes(),
        projectService.getProjects(),
      ]);
      setExpenseTypes(expenseTypeData || []);
      setProjects(projectData || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadClaim = async () => {
    try {
      const data = await reimbursementService.getApplicationById(params.id as string);
      setClaim(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getExpenseTypeName = (id: string) =>
    expenseTypes.find((e: any) => e.id === id)?.name || id || "-";

  const getProjectName = (id: string) =>
    projects.find((p: any) => p.id === id)?.name || id || "-";

  const totalAmount = claim?.expense_items?.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0), 0
  ) || 0;

  // Workflow stages from approval history
  const workflowStages = claim?.approval_history || [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="text-sm text-white/60">Loading...</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="text-sm text-white/60">Claim Not Found</div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="reimbursement:read">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_50%)]" />

      <div className="absolute left-1/2 top-1/2 h-[1800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[260px]" />

      <div className="relative z-10 flex min-h-screen w-full">

        <Sidebar active="claims" />

        <section className="flex-1 flex flex-col">

          <Topbar
            title="Claim Details"
            subtitle="View reimbursement application details"
          />

          <div className="flex-1 p-5 space-y-4">

            {/* Header Card */}
            <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 backdrop-blur-2xl p-4">
              <div className="flex items-start justify-between">

                <div>
                  <button
                    onClick={() => router.push("/claims")}
                    className="mb-2 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    ← Back to Claims
                  </button>

                  <h1 className="text-xl font-bold text-white">
                    {claim.application_no}
                  </h1>

                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(claim.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {formatStatus(claim.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-white/60">Requested</p>
                    <p className="mt-1 text-lg font-bold text-cyan-300">
                      ৳ {Number(claim.requested_amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-white/60">Verified</p>
                    <p className="mt-1 text-lg font-bold text-green-300">
                      ৳ {Number(claim.verified_amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-white/60">Paid</p>
                    <p className="mt-1 text-lg font-bold text-yellow-300">
                      ৳ {Number(claim.paid_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Employee Info + Approval Workflow */}
            <div className="grid grid-cols-12 gap-4">

              {/* Employee Info */}
              <div className="col-span-5 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
                <h2 className="mb-4 text-base font-bold text-white">Employee Information</h2>
                <div className="space-y-3">
                  {[
                    { label: "Employee Name", value: claim.employee_name || claim.data?.full_name },
                    { label: "Department", value: claim.department_name || claim.data?.department },
                    { label: "Designation", value: claim.designation_name || claim.data?.designation },
                    { label: "Email", value: claim.employee_email || claim.data?.email },
                    { label: "Application Date", value: formatDate(claim.created_at) },
                    { label: "Status", value: formatStatus(claim.status) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-xs text-white/50">{row.label}</span>
                      <span className="text-xs text-white font-medium">{row.value || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Workflow Timeline */}
              <div className="col-span-7 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
                <h2 className="mb-4 text-base font-bold text-white">Approval Workflow</h2>

                {workflowStages.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

                    <div className="space-y-4">
                      {workflowStages.map((stage: any, index: number) => {
                        const isApproved = stage.action === "APPROVED";
                        const isRejected = stage.action === "REJECTED";
                        const isPending = stage.action === "PENDING";
                        const isReturned = stage.action === "RETURNED";

                        return (
                          <div key={index} className="relative flex items-start gap-4 pl-10">
                            {/* Circle */}
                            <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${
                              isApproved ? "border-green-400 bg-green-400" :
                              isRejected ? "border-red-400 bg-red-400" :
                              isPending ? "border-cyan-400 bg-cyan-400/30" :
                              isReturned ? "border-yellow-400 bg-yellow-400" :
                              "border-white/30 bg-white/10"
                            }`} />

                            <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">
                                  {stage.stage_name}
                                </span>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(stage.action)}`}>
                                  {formatStatus(stage.action)}
                                </span>
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-white/50">Approver: </span>
                                  <span className="text-white">{stage.user_name || "-"}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Date: </span>
                                  <span className="text-white">{stage.action_date ? formatDate(stage.action_date) : "-"}</span>
                                </div>
                              </div>

                              {stage.comments && (
                                <div className="mt-2 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70">
                                  💬 {stage.comments}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-white/40">
                    No workflow history available
                  </div>
                )}
              </div>

            </div>

            {/* Expense Items */}
            <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
              <h2 className="mb-4 text-base font-bold text-white">Expense Details</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-3 text-left text-xs text-white/60">Expense Date</th>
                      <th className="py-3 text-left text-xs text-white/60">Claim Type</th>
                      <th className="py-3 text-left text-xs text-white/60">Purpose</th>
                      <th className="py-3 text-left text-xs text-white/60">Mode</th>
                      <th className="py-3 text-left text-xs text-white/60">Project</th>
                      <th className="py-3 text-left text-xs text-white/60">From</th>
                      <th className="py-3 text-left text-xs text-white/60">To</th>
                      <th className="py-3 text-right text-xs text-white/60">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {claim.expense_items?.length > 0 ? (
                      claim.expense_items.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-white/5">
                          <td className="py-3 text-xs">{item.expense_date ? formatDate(item.expense_date) : "-"}</td>
                          <td className="py-3 text-xs">{getExpenseTypeName(item.claim_type)}</td>
                          <td className="py-3 text-xs">{item.purpose || "-"}</td>
                          <td className="py-3 text-xs">{item.mode || "-"}</td>
                          <td className="py-3 text-xs">{getProjectName(item.project)}</td>
                          <td className="py-3 text-xs">{item.from_location || "-"}</td>
                          <td className="py-3 text-xs">{item.to_location || "-"}</td>
                          <td className="py-3 text-right text-xs font-semibold text-cyan-300">
                            ৳ {Number(item.amount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-white/40">
                          No expense items found
                        </td>
                      </tr>
                    )}

                    {claim.expense_items?.length > 0 && (
                      <tr className="border-t border-white/10">
                        <td colSpan={7} className="py-3 text-right text-xs font-semibold text-white">
                          Total
                        </td>
                        <td className="py-3 text-right text-sm font-bold text-cyan-300">
                          ৳ {totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
              <h2 className="mb-4 text-base font-bold text-white">Attachments</h2>

              {claim.attachments?.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-3">
                  {claim.attachments.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <span className="text-xs text-white truncate max-w-[150px]">
                          {file.file_name}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "");
                          window.open(`${base}/${file.file_url}`, "_blank");
                        }}
                        className="rounded-lg bg-cyan-500/15 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/25"
                      >
                        Preview
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center text-sm text-white/40">
                  No attachments found
                </div>
              )}
            </div>

          </div>

        </section>

      </div>

    </main>
    </PermissionGuard>
  );
}