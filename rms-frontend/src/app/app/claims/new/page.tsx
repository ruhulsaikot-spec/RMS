"use client";

import {
  useState,
  useEffect,
} from "react";

import { useUser }
  from "@/contexts/user-context";

import { userService }
  from "@/services/user.service";

import { employeeService }
  from "@/services/employee.service";

import { expenseTypeService }
  from "@/services/expense-type.service";

import { workflowService } from "@/services/workflow.service";

import { projectService }
  from "@/services/project.service";

import { reimbursementService }
  from "@/services/reimbursement.service";

import {
  fileService
}
from "@/services/file.service";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

import EmployeeInfoCard from "@/components/claims/EmployeeInfoCard";
import ClaimDetailsStep, { validateClaimDetails } from "@/components/claims/ClaimDetailsStep";
import PermissionGuard from "@/components/auth/permission-guard";
import { toast } from "sonner";

export default function NewClaimPage() {
  const {
    currentUser,
    isLoaded,
  } = useUser();
  console.log(
    "RENDER CURRENT USER =>",
    currentUser
  );
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [submitted, setSubmitted] = useState(false);

  const [employeeInfo, setEmployeeInfo] =
    useState<any>(null);

  const [saving, setSaving] =
    useState(false);

  const [expenseTypes, setExpenseTypes] =
    useState<any[]>([]);

  const [projects, setProjects] =
    useState<any[]>([]);

  const [matchedWorkflow, setMatchedWorkflow] = useState<any>(null);

  const [applicationNo, setApplicationNo] =
    useState("");

  const [claimNumber] = useState(
    `CLM-${new Date().getFullYear()}-0000001`
  );

  useEffect(() => {
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
    loadMasterData();
  }, []);

  useEffect(() => {

    if (!isLoaded) return;

    const loadEmployee = async () => {
      try {
        const employees = await employeeService.getEmployees();
        const matched = (employees?.data || employees || []).find(
          (e: any) => e.employee_id === currentUser.employeeId
        );
        setEmployeeInfo({
          employee_id: currentUser.employeeId,
          full_name: currentUser.employeeName,
          email: currentUser.email,
          department: matched?.department?.name || matched?.department || "-",
          designation: matched?.designation?.name || matched?.designation || "-",
        });
      } catch {
        setEmployeeInfo({
          employee_id: currentUser.employeeId,
          full_name: currentUser.employeeName,
          email: currentUser.email,
          department: "-",
          designation: "-",
        });
      }
    };

    loadEmployee();

  }, [isLoaded, currentUser]);

  console.log(
    "EMPLOYEE INFO STATE =>",
    employeeInfo
  );

  const [
    uploadedFileIds,
    setUploadedFileIds,
  ] = useState<string[]>([]);

  const [
    uploadedFileMeta,
    setUploadedFileMeta,
  ] = useState<{id: string; original_name: string; storage_path: string}[]>([]);


  const [formData, setFormData] = useState({
    purpose: "",

    remarks: "",

    claimDate: "",

    attachments: [] as File[],

    expenseItems: [
      {
        id: Date.now(),

        expenseDate: "",

        claimType: "",

        purpose: "",

        mode: "",

        project: "",

        from: "",

        to: "",

        amount: "",
      },
    ],
  });

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

        <div
          className="
        w-full
        max-w-sm
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        p-5
        text-center
        backdrop-blur-xl
        "
        >

          <div className="text-4xl">
            ✅
          </div>

          <h1 className="mt-4 text-lg font-semibold">
            Claim Submitted Successfully
          </h1>

          <p className="mt-3 text-white/60">
            Your claim request has been submitted.
          </p>

          <div
            className="
          mt-6
          rounded-2xl
          border
          border-cyan-500/20
          bg-cyan-500/5
          p-4
          "
          >
            <p className="text-xs text-white/50">
              Claim Number
            </p>

            <p className="mt-1 text-base font-semibold text-cyan-300">
              {applicationNo || claimNumber}
            </p>
          </div>

          <div className="mt-5">

            <button
              type="button"
              onClick={() => {
                window.location.href = "/claims";
              }}
              className="
          rounded-xl
          border
          border-white/10
          px-5
          py-2.5
          text-sm
          "
            >
              Back To Claims List
            </button>

          </div>

        </div>

      </main>
    );
  }

  return (
    <PermissionGuard permission="reimbursement:create">
    <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_50%)]" />

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

        <section className="flex-1">

          <Topbar
            title="Create Claim"
            subtitle="Submit reimbursement request"
          />

          <div className="p-6">

            <div className="mx-auto max-w-7xl">

              {/* Header */}
              <div className="mb-5">
                <h1 className="text-xl font-semibold">
                  Create New Claim
                </h1>

                <p className="mt-1 text-xs text-white/60">
                  Submit reimbursement request
                </p>
              </div>

              {/* Stepper */}
              <div className="mb-5 flex items-center gap-2">
                {[
                  { num: 1, label: "Claim Information" },
                  { num: 2, label: "Attachments" },
                  { num: 3, label: "Review & Submit" },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step > s.num
                        ? "bg-green-500 text-white"
                        : step === s.num
                        ? "bg-cyan-500 text-black"
                        : "bg-white/10 text-white/40"
                    }`}>
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span className={`text-xs font-medium ${
                      step === s.num ? "text-cyan-300" :
                      step > s.num ? "text-white/60" :
                      "text-white/30"
                    }`}>
                      {s.label}
                    </span>
                    {idx < 2 && (
                      <div className={`mx-2 h-px w-10 ${step > s.num ? "bg-green-500/40" : "bg-white/10"}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-5">

                {step === 1 && (
                  <>
                    <EmployeeInfoCard
                      employee={employeeInfo}
                    />

                    <ClaimDetailsStep
                      claimType=""
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </>
                )}

                {step === 2 && (
                  <div
                    className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-5
                backdrop-blur-xl
                "
                  >
                    <div className="mb-5">

                      <h3 className="text-base font-semibold">
                        Supporting Documents
                      </h3>

                      <p className="mt-1 text-xs text-white/50">
                        Upload bill, invoice or supporting documents
                      </p>

                    </div>

                    <div
                      className="
                  rounded-2xl
                  border-2
                  border-dashed
                  border-cyan-500/30
                  bg-cyan-500/[0.03]
                  p-5
                  text-center
                  "
                    >
                      <div className="mb-3 text-4xl">
                        📎
                      </div>

                      <p className="text-sm font-medium">
                        Upload Supporting Documents
                      </p>

                      <p className="mt-2 text-xs text-white/50">
                        PDF, JPG, PNG (Maximum 3 MB)
                      </p>

                      <p className="mt-2 text-xs text-cyan-300">
                        You can upload one or multiple files.
                        Uploaded files will appear below.
                      </p>

                      <input
                        id="claimAttachment"
                        type="file"
                        multiple
                        onChange={async (e) => {

                          const files = Array.from(
                            e.target.files || []
                          );

                          const allowedExtensions = [
                            "pdf",
                            "jpg",
                            "jpeg",
                            "png",
                            "doc",
                            "docx",
                            "xls",
                            "xlsx",
                          ];

                          const validFiles = files.filter((file) => {

                            const extension =
                              file.name.split(".").pop()?.toLowerCase();

                            return (
                              file.size <= 3 * 1024 * 1024 &&
                              allowedExtensions.includes(
                                extension || ""
                              )
                            );

                          });

                          const invalidFiles = files.filter((file) => {

                            const extension =
                              file.name.split(".").pop()?.toLowerCase();

                            return (
                              file.size > 3 * 1024 * 1024 ||
                              !allowedExtensions.includes(
                                extension || ""
                              )
                            );

                          });

                          if (invalidFiles.length > 0) {

                            toast.error(
                            `File size must be under 3 MB. Rejected: ${invalidFiles.map((f) => f.name).join(", ")}`
                          );
                          }

                          if (validFiles.length === 0) {
                            return;
                          }

                          try {

                            const uploadedIds: string[] = [];

                            for (const file of validFiles) {

                              const uploaded =
                                await fileService.uploadFile(
                                  file
                                );

                              uploadedIds.push(
                                uploaded.id
                              );
                              setUploadedFileMeta((prev) => [
                                ...prev,
                                {
                                  id: uploaded.id,
                                  original_name: uploaded.original_name,
                                  storage_path: uploaded.storage_path,
                                },
                              ]);
                            }

                            setUploadedFileIds(
                              [
                                ...uploadedFileIds,
                                ...uploadedIds,
                              ]
                            );

                            setFormData({
                              ...formData,
                              attachments: [
                                ...(formData.attachments || []),
                                ...validFiles,
                              ],
                            });

                          } catch (error) {

                            console.error(
                              "FILE UPLOAD ERROR",
                              error
                            );

                            alert(
                              "File upload failed."
                            );

                          }

                        }}
                        className="hidden"
                      />

                      <label
                        htmlFor="claimAttachment"
                        className="
                    mt-4
                    inline-flex
                    cursor-pointer
                    items-center
                    rounded-xl
                    bg-cyan-500
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-black
                    "
                      >
                        Choose Files
                      </label>


                    </div>

                    <div className="mt-5">

                      {formData.attachments?.length > 0 && (

                        <div className="mb-3">

                          <h4 className="text-xs font-semibold text-cyan-300">
                            Uploaded Files ({formData.attachments.length})
                          </h4>

                        </div>

                      )}

                      <div
                        className="
                    grid
                    gap-3
                    md:grid-cols-3
                    "
                      >

                        {formData.attachments?.length > 0 ? (

                          formData.attachments.map(
                            (file: any, index: number) => (

                              <div
                                key={index}
                                className="
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          border
                          border-white/10
                          bg-white/5
                          p-4
                          "
                              >

                                <div>

                                  <p className="text-sm">
                                    {file.name}
                                  </p>

                                  <p className="text-xs text-white/50">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>

                                </div>

                                <button
                                  type="button"
                                  onClick={() => {

                                    const updatedFiles =
                                      formData.attachments.filter(
                                        (_: any, i: number) =>
                                          i !== index
                                      );

                                    const updatedIds =
                                      uploadedFileIds.filter(
                                        (_: any, i: number) =>
                                          i !== index
                                      );

                                    setUploadedFileIds(
                                      updatedIds
                                    );

                                    setFormData({
                                      ...formData,
                                      attachments: updatedFiles,
                                    });

                                  }}
                                  className="
                            text-xs
                            text-red-400
                            "
                                >
                                  Remove
                                </button>

                              </div>

                            )
                          )

                        ) : (

                          <div
                            className="
                    rounded-xl
                    border
                    border-dashed
                    border-white/10
                    p-4
                    text-center
                    text-xs
                    text-white/40
                    "
                          >
                            No files uploaded yet
                          </div>

                        )}

                      </div>

                    </div>

                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">

                    {/* Claim Summary Cards */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Total Items</p>
                        <p className="mt-1 text-2xl font-bold text-cyan-300">{formData.expenseItems?.length || 0}</p>
                      </div>
                      <div className="col-span-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Total Amount</p>
                        <p className="mt-1 text-2xl font-bold text-blue-300">
                          ৳ {formData.expenseItems?.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0).toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Status</p>
                        <p className="mt-1 text-sm font-semibold text-yellow-300">Draft</p>
                        <p className="text-[10px] text-white/40">{formData.claimDate}</p>
                      </div>
                    </div>

                    {/* Employee Info */}
                    <EmployeeInfoCard employee={employeeInfo} />

                    {/* Expense Details */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <h3 className="mb-4 text-sm font-semibold text-white">Expense Details</h3>
                      <div className="overflow-x-auto rounded-2xl border border-white/10">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03]">
                              {["#", "Date", "Type", "Purpose", "Mode", "Project", "From", "To", "Amount"].map((h, i) => (
                                <th key={h} className={`px-3 py-2.5 text-[10px] font-semibold text-white/50 uppercase tracking-wide ${i === 8 ? "text-right" : "text-left"}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {formData.expenseItems?.map((item: any, idx: number) => (
                              <tr key={item.id} className="border-b border-white/5">
                                <td className="px-3 py-2.5 text-white/40">{idx + 1}</td>
                                <td className="px-3 py-2.5">{item.expenseDate || "-"}</td>
                                <td className="px-3 py-2.5 text-cyan-300">{expenseTypes.find((e: any) => e.id === item.claimType)?.name || "-"}</td>
                                <td className="px-3 py-2.5">{item.purpose || "-"}</td>
                                <td className="px-3 py-2.5 text-white/70">{item.mode || "-"}</td>
                                <td className="px-3 py-2.5 text-white/70">{projects.find((p: any) => p.id === item.project)?.name || "-"}</td>
                                <td className="px-3 py-2.5 text-white/70">{item.from || "-"}</td>
                                <td className="px-3 py-2.5 text-white/70">{item.to || "-"}</td>
                                <td className="px-3 py-2.5 text-right font-semibold text-cyan-300">৳ {Number(item.amount || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Attachments */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <h3 className="mb-4 text-sm font-semibold text-white">
                        Attachments
                        {formData.attachments?.length > 0 && (
                          <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">{formData.attachments.length}</span>
                        )}
                      </h3>
                      {formData.attachments?.length > 0 ? (
                        <div className="grid gap-2 md:grid-cols-3">
                          {formData.attachments.map((file: any, index: number) => (
                            <div key={index} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">📄</span>
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium text-white">{file.name}</p>
                                  <p className="text-[10px] text-white/40">{file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const meta = uploadedFileMeta[index];
                                  if (meta?.storage_path) {
                                    window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "")}/${meta.storage_path}`, "_blank");
                                  }
                                }}
                                className="ml-2 shrink-0 rounded-lg bg-cyan-500/15 px-2 py-1 text-[10px] text-cyan-300 hover:bg-cyan-500/25 transition-colors"
                              >
                                Preview
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/40">
                          No attachments uploaded
                        </div>
                      )}
                    </div>


                    {/* Workflow */}
                    <div
                      className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-4
                  backdrop-blur-xl
                  "
                    >
                      <h3 className="text-base font-semibold">
                        Approval Workflow
                      </h3>

                      {matchedWorkflow ? (
                        <div>
                          <p className="mt-1 text-xs text-white/50 mb-3">{matchedWorkflow.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <div className="rounded-xl bg-cyan-500/10 px-3 py-2 text-xs">
                              Applicant
                            </div>
                            {matchedWorkflow.stages?.map((stage: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-white/40">→</span>
                                <div className={`rounded-xl px-3 py-2 text-xs ${
                                  stage.action_type === "Payment Processing"
                                    ? "bg-green-500/10 text-green-300"
                                    : stage.action_type === "Amount Verification"
                                    ? "bg-yellow-500/10 text-yellow-300"
                                    : "bg-white/5 text-white"
                                }`}>
                                  <div>{stage.stage_name || `Stage ${stage.step_order}`}</div>
                                  {stage.approver_label && (
                                    <div className="text-[10px] text-white/40 mt-0.5">{stage.approver_label}</div>
                                  )}
                                  {stage.min_approver_count && (
                                    <div className="text-[10px] text-white/40">Min. Approver: {stage.min_approver_count}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-white/40">
                          No matching workflow found for this claim.
                        </p>
                      )}
                    </div>

                  </div>
                )}
                <div
                  className="
                flex
                items-center
                justify-between
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-4
                backdrop-blur-xl
                "
                >

                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                    className="
                  rounded-xl
                  border
                  border-white/10
                  px-4
                  py-2
                  text-sm
                  disabled:opacity-30
                  "
                  >
                    Previous
                  </button>

                  <div className="flex gap-3">

                    {step === TOTAL_STEPS && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setSaving(true);
                          const totalAmount = formData.expenseItems.reduce(
                            (sum: number, item: any) => sum + Number(item.amount || 0),
                            0
                          );
                          const payload = {
                            reimbursement_type_id:
                              "3d258f63-1532-4f30-b3e4-4d1331006b0e",
                            requested_amount: totalAmount,
                            claim_date: formData.claimDate,
                            remarks: formData.remarks,
                            expense_items: formData.expenseItems.map((item: any) => ({
                              expense_date: item.expenseDate,
                              claim_type: item.claimType,
                              purpose: item.purpose,
                              mode: item.mode,
                              project: item.project,
                              from_location: item.from,
                              to_location: item.to,
                              amount: Number(item.amount),
                            })),
                            attachment_ids: uploadedFileIds,
                          };
                          const draft = await reimbursementService.createApplication(payload);
                          toast.success(
                            `Draft saved! Application No: ${draft.application_no}`,
                            {
                              duration: 8000,
                              action: {
                                label: "Go to Claims List",
                                onClick: () => {
                                  window.location.href = "/claims";
                                },
                              },
                            }
                          );
                        } catch (error: any) {
                          toast.error(
                            error?.response?.data?.detail ?? "Failed to save draft."
                          );
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Draft"}
                    </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {

                        if (step < TOTAL_STEPS) {

                          if (step === 1) {
                            if (!validateClaimDetails(formData)) return;
                          }

                          if (step === 2) {
                            try {
                              const totalAmount = formData.expenseItems.reduce(
                                (sum: number, item: any) => sum + Number(item.amount || 0), 0
                              );
                              const expenseTypeIds = [...new Set(formData.expenseItems.map((i: any) => i.claimType).filter(Boolean))];
                              const wf = await workflowService.getMatchingWorkflow(totalAmount, expenseTypeIds as string[]);
                              setMatchedWorkflow(wf);
                            } catch {
                              setMatchedWorkflow(null);
                            }
                          }

                          setStep(step + 1);

                          return;
                        }

                        try {

                          setSaving(true);

                          const firstExpense =
                            formData.expenseItems[0];

                          const totalAmount =
                            formData.expenseItems.reduce(
                              (sum: number, item: any) =>
                                sum +
                                Number(item.amount || 0),
                              0
                            );

                            const payload = {
                              reimbursement_type_id:
                                "3d258f63-1532-4f30-b3e4-4d1331006b0e",

                              requested_amount:
                                totalAmount,

                              claim_date:
                                formData.claimDate,

                              remarks:
                                formData.remarks,

                              expense_items:
                                formData.expenseItems.map(
                                  (item: any) => ({
                                    expense_date:
                                      item.expenseDate,

                                    claim_type:
                                      item.claimType,

                                    purpose:
                                      item.purpose,

                                    mode:
                                      item.mode,

                                    project:
                                      item.project,

                                    from_location:
                                      item.from,

                                    to_location:
                                      item.to,

                                    amount:
                                      Number(item.amount),
                                  })
                                ),

                              attachment_ids:
                                uploadedFileIds,
                            };

                            console.log(
                              "CREATE PAYLOAD =>",
                              payload
                            );

                          const application =
                            await reimbursementService.createApplication(
                              payload
                            );

                          await reimbursementService.submitApplication(
                            application.id
                          );

                          setApplicationNo(
                            application.application_no
                          );

                          setSubmitted(true);

                        } catch (error: any) {

                          const message =
                            error?.response?.data?.detail ||
                            error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong. Please try again.";

                          toast.error(message);

                        } finally {

                          setSaving(false);

                        }

                      }}
                      disabled={saving}
                      className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving && step === TOTAL_STEPS ? "Submitting..." : saving ? "Saving..." : step === TOTAL_STEPS ? "Submit Claim" : "Next Step"}
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