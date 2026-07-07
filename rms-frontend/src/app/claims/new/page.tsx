"use client";

import {
  useState,
  useEffect,
} from "react";

import { useUser }
  from "@/contexts/user-context";

import { userService }
  from "@/services/user.service";

import { reimbursementService }
  from "@/services/reimbursement.service";

import {
  fileService
}
from "@/services/file.service";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

import EmployeeInfoCard from "@/components/claims/EmployeeInfoCard";
import ClaimDetailsStep from "@/components/claims/ClaimDetailsStep";

export default function NewClaimPage() {
  const {
    currentUser,
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

  const [applicationNo, setApplicationNo] =
    useState("");

  const [claimNumber] = useState(
    `CLM-${new Date().getFullYear()}-0000001`
  );

  useEffect(() => {

    const loadEmployee =
      async () => {

        try {


          console.log(
            "CURRENT USER =>",
            currentUser
          );

          console.log(
            "CURRENT USER EMPLOYEE ID =>",
            currentUser.employeeId
          );

          const users =
            await userService.getUsers();

          console.log(
            "USERS RESPONSE =>",
            users
          );

          console.log(
            "USERS DATA =>",
            users.data
          );

          const employee =
            users.data.find(
              (u: any) =>
                u.employee_id ===
                currentUser.employeeId
            );

          console.log(
            "MATCHED EMPLOYEE =>",
            employee
          );

          console.log(
            "MATCHED EMPLOYEE =>",
            employee
          );

          if (!employee) return;

          setEmployeeInfo({
            employee_id:
              employee.employee_id,

            full_name:
              employee.full_name,

            email:
              employee.email,

            department:
              "Information Technology",

            designation:
              "System Administrator",
          });

        } catch (error) {

          console.error(error);

        }

      };

    console.log(
      "CURRENT USER =>",
      currentUser
    );

    if (
      currentUser.employeeId
    ) {
      loadEmployee();
    }

  }, [currentUser]);

  console.log(
    "EMPLOYEE INFO STATE =>",
    employeeInfo
  );

  const [
    uploadedFileIds,
    setUploadedFileIds,
  ] = useState<string[]>([]);


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
            Your reimbursement request has been submitted.
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

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-xs font-semibold">
                    1
                  </div>

                  <span className="text-xs font-medium">
                    Claim Information
                  </span>
                </div>

                <div className="h-[1px] flex-1 bg-white/10" />

                <div className="flex items-center gap-2 opacity-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    2
                  </div>

                  <span className="text-xs">
                    Attachments
                  </span>
                </div>

                <div className="h-[1px] flex-1 bg-white/10" />

                <div className="flex items-center gap-2 opacity-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
                    3
                  </div>

                  <span className="text-xs">
                    Review & Submit
                  </span>
                </div>

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

                            alert(
                              `Only PDF, JPG, JPEG, PNG, DOC, DOCX, XLS and XLSX files are allowed.

                  Maximum file size is 3 MB.

                  Rejected Files:

                  ${invalidFiles
                                .map((file) => file.name)
                                .join("\n")}`
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
                  <div className="space-y-3">

                    {/* Claim Summary */}
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
                        Claim Summary
                      </h3>

                      <div className="mt-3 grid gap-3 md:grid-cols-4">

                        <div>
                          <p className="text-xs text-white/50">
                            Travel Reimbursement Claim
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/50">
                            Total Expenses
                          </p>

                          <p className="mt-1 text-sm">
                            {formData.expenseItems?.length || 0}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/50">
                            Claim Amount
                          </p>

                          <p className="mt-1 text-sm">
                            ৳ {
                              formData.expenseItems
                                ?.reduce(
                                  (sum: number, item: any) =>
                                    sum + Number(item.amount || 0),
                                  0
                                )
                                .toLocaleString() || "0"
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/50">
                            Claim Date
                          </p>

                          <p className="mt-1 text-sm">
                            09-Jun-2026
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-white/50">
                            Status
                          </p>

                          <p className="mt-1 text-sm text-yellow-300">
                            Draft
                          </p>
                        </div>


                      </div>
                    </div>

                    {/* Employee Info */}
                    <EmployeeInfoCard
                      employee={employeeInfo}
                    />

                    {/* Expense Summary */}

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
                        Expense Details
                      </h3>

                      <div className="mt-4 overflow-x-auto">

                        <table className="w-full text-sm">

                          <thead>
                            <tr className="border-b border-white/10">

                              <th className="p-2 text-left">
                                Date
                              </th>

                              <th className="p-2 text-left">
                                Type
                              </th>

                              <th className="p-2 text-left">
                                Project
                              </th>

                              <th className="p-2 text-left">
                                From
                              </th>

                              <th className="p-2 text-left">
                                To
                              </th>

                              <th className="p-2 text-right">
                                Amount
                              </th>

                            </tr>
                          </thead>

                          <tbody>

                            {formData.expenseItems?.map(
                              (item: any) => (
                                <tr
                                  key={item.id}
                                  className="
                              border-b
                              border-white/5
                              "
                                >

                                  <td className="p-2">
                                    {item.date || "-"}
                                  </td>

                                  <td className="p-2">
                                    {item.transportType || "-"}
                                  </td>

                                  <td className="p-2">
                                    {item.project || "-"}
                                  </td>

                                  <td className="p-2">
                                    {item.from || "-"}
                                  </td>

                                  <td className="p-2">
                                    {item.to || "-"}
                                  </td>

                                  <td className="p-2 text-right">
                                    ৳ {item.amount || 0}
                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>

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
                      <h3 className="text-base font-semibold">
                        Attachments
                      </h3>

                      <div
                        className="
                    mt-3
                    grid
                    gap-3
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3
                    "
                      >

                        {formData.attachments?.length > 0 ? (

                          formData.attachments.map(
                            (file: any, index: number) => (

                              <div
                                key={index}
                                className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-3
                            "
                              >
                                <div className="text-2xl">
                                  📄
                                </div>

                                <p
                                  className="
                              mt-2
                              truncate
                              text-sm
                              font-medium
                              "
                                >
                                  {file.name}
                                </p>

                                <p className="text-xs text-white/50">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>

                                <button
                                  type="button"
                                  className="
                              mt-2
                              text-xs
                              text-cyan-300
                              "
                                >
                                  Preview
                                </button>

                              </div>

                            )
                          )

                        ) : (

                          <div
                            className="
                        col-span-full
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-4
                        text-sm
                        text-white/50
                        "
                          >
                            No attachment uploaded
                          </div>

                        )}

                      </div>

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

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">

                        <div className="rounded-xl bg-cyan-500/10 px-3 py-2">
                          Employee
                        </div>

                        <span>→</span>

                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Reporting Manager
                        </div>

                        <span>→</span>

                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Department Head
                        </div>

                        <span>→</span>

                        <div className="rounded-xl bg-white/5 px-3 py-2">
                          Finance
                        </div>

                        <span>→</span>

                        <div className="rounded-xl bg-green-500/10 px-3 py-2">
                          Payment
                        </div>

                      </div>
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

                    <button
                      className="
                    rounded-xl
                    border
                    border-white/10
                    px-4
                    py-2
                    text-sm
                    "
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={async () => {

                        if (step < TOTAL_STEPS) {

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

                          console.error(
                            "SUBMIT ERROR =>",
                            error
                          );

                          console.error(
                            "API RESPONSE =>",
                            error?.response?.data
                          );

                          alert(
                            JSON.stringify(
                              error?.response?.data ??
                              error?.message
                            )
                          );

                        } finally {

                          setSaving(false);

                        }

                      }}
                      className="
                    rounded-xl
                    bg-cyan-500
                    px-5
                    py-2
                    text-sm
                    font-medium
                    text-black
                    "
                    >
                      {step === TOTAL_STEPS ? "Submit Claim" : "Next Step"}
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