"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { reimbursementService } from "@/services/reimbursement.service";
import { expenseTypeService } from "@/services/expense-type.service";
import { projectService } from "@/services/project.service";

function getStatusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "APPROVED": return "bg-green-500/15 text-green-300 border border-green-400/30";
    case "REJECTED": return "bg-red-500/15 text-red-300 border border-red-400/30";
    case "IN_APPROVAL": return "bg-purple-500/20 text-purple-200 border border-purple-400/30";
    case "SUBMITTED": return "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30";
    case "PAID": return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30";
    case "PENDING": return "bg-orange-500/20 text-orange-200 border border-orange-400/30";
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

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState("");
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadClaim();
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [et, pr] = await Promise.all([
        expenseTypeService.getExpenseTypes(),
        projectService.getProjects(),
      ]);
      setExpenseTypes(et || []);
      setProjects(pr || []);
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

  const handleAction = async () => {
    if (!selectedAction) return;
    try {
      setProcessing(true);
      if (selectedAction === "APPROVE") {
        await reimbursementService.approveApplication(claim.id, remarks);
      } else if (selectedAction === "REJECT") {
        await reimbursementService.rejectApplication(claim.id, remarks);
      }
      toast.success("Action completed successfully.");
      loadClaim();
      setSelectedAction("");
      setRemarks("");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = claim?.expense_items?.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0), 0
  ) || 0;

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
    <PermissionGuard permission="reimbursement:approve">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

      <div className="relative z-10 flex min-h-screen w-full">

        <Sidebar active="approvals" />

        <section className="flex-1 flex flex-col">

          <Topbar title="Claim Review" subtitle="Review and process reimbursement application" />

          <div className="flex-1 p-5 space-y-4">

            {/* Header Card */}
            <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 backdrop-blur-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <button
                    onClick={() => router.push("/approvals")}
                    className="mb-2 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    ← Back to Approvals
                  </button>
                  <h1 className="text-xl font-bold text-white">{claim.application_no}</h1>
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
                    <p className="mt-1 text-lg font-bold text-cyan-300">৳ {Number(claim.requested_amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-white/60">Verified</p>
                    <p className="mt-1 text-lg font-bold text-green-300">৳ {Number(claim.verified_amount || 0).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-white/60">Paid</p>
                    <p className="mt-1 text-lg font-bold text-yellow-300">৳ {Number(claim.paid_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Info + Timeline + Action */}
            <div className="grid grid-cols-12 gap-4">

              {/* Employee Info */}
              <div className="col-span-4 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
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
                      <span className="text-xs font-medium text-white">{row.value || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval Timeline */}
              <div className="col-span-5 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
                <h2 className="mb-4 text-base font-bold text-white">Approval Timeline</h2>
                {claim.approval_history?.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
                    <div className="space-y-4">
                      {claim.approval_history.map((stage: any, idx: number) => (
                        <div key={idx} className="relative flex items-start gap-4 pl-10">
                          <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${
                            stage.action === "APPROVED" ? "border-green-400 bg-green-400" :
                            stage.action === "REJECTED" ? "border-red-400 bg-red-400" :
                            stage.action === "PENDING" ? "border-cyan-400 bg-cyan-400/30" :
                            "border-white/30 bg-white/10"
                          }`} />
                          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white">{stage.stage_name}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(stage.action)}`}>
                                {formatStatus(stage.action)}
                              </span>
                            </div>
                            <div className="mt-1.5 text-xs text-white/50">
                              {stage.user_name && <span>{stage.user_name}</span>}
                              {stage.action_date && <span className="ml-2">{formatDate(stage.action_date)}</span>}
                            </div>
                            {stage.comments && (
                              <div className="mt-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/60">
                                💬 {stage.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-sm text-white/40">No history</div>
                )}
              </div>

              {/* Workflow Action */}
              <div className="col-span-3 rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
                <h2 className="mb-4 text-base font-bold text-white">Workflow Action</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60">Select Action</label>
                    <select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white"
                    >
                      <option value="" className="bg-[#17386E]">Select Action</option>
                      {claim.workflow_actions
                        ?.filter((action: any) => ["APPROVE", "REJECT", "BACK", "RETURN"].includes(action.action_code))
                        .map((action: any) => (
                          <option key={action.action_code} value={action.action_code} className="bg-[#17386E]">
                            {action.action_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/60">Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={5}
                      placeholder="Add comments..."
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/30 resize-none"
                    />
                  </div>

                  <button
                    disabled={processing || !selectedAction}
                    onClick={handleAction}
                    className={`w-full rounded-xl py-2.5 text-xs font-semibold transition-all ${
                      !selectedAction
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : selectedAction === "REJECT"
                        ? "bg-red-500 text-white hover:bg-red-400"
                        : "bg-cyan-500 text-black hover:bg-cyan-400"
                    }`}
                  >
                    {processing ? "Processing..." : selectedAction ? `Confirm ${formatStatus(selectedAction)}` : "Select an Action"}
                  </button>
                </div>
              </div>

            </div>

            {/* Expense Items */}
            <div className="rounded-3xl border border-white/20 bg-[#102E67]/80 p-4">
              <h2 className="mb-4 text-base font-bold text-white">Expense Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Expense Date", "Claim Type", "Purpose", "Mode", "Project", "From", "To", "Amount"].map((h, i) => (
                        <th key={h} className={`py-3 text-xs text-white/60 ${i === 7 ? "text-right" : "text-left"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {claim.expense_items?.length > 0 ? (
                      <>
                        {claim.expense_items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5">
                            <td className="py-3 text-xs">{item.expense_date ? formatDate(item.expense_date) : "-"}</td>
                            <td className="py-3 text-xs">{getExpenseTypeName(item.claim_type)}</td>
                            <td className="py-3 text-xs">{item.purpose || "-"}</td>
                            <td className="py-3 text-xs">{item.mode || "-"}</td>
                            <td className="py-3 text-xs">{getProjectName(item.project)}</td>
                            <td className="py-3 text-xs">{item.from_location || "-"}</td>
                            <td className="py-3 text-xs">{item.to_location || "-"}</td>
                            <td className="py-3 text-right text-xs font-semibold text-cyan-300">৳ {Number(item.amount || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/10">
                          <td colSpan={7} className="py-3 text-right text-xs font-semibold text-white">Total</td>
                          <td className="py-3 text-right text-sm font-bold text-cyan-300">৳ {totalAmount.toLocaleString()}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-white/40">No expense items</td>
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
                    <div key={file.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <span className="text-xs text-white truncate max-w-[150px]">{file.file_name}</span>
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
                <div className="flex h-16 items-center justify-center text-sm text-white/40">No attachments</div>
              )}
            </div>

          </div>

        </section>

      </div>

    </main>
    </PermissionGuard>
  );
}