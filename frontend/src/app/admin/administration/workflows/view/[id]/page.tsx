"use client";

import React from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

export default function ViewWorkflowPage() {
  const router = useRouter();

  const workflow = {
  code: "WF-0001",
  name: "Local Travel Reimbursement",
  company: "Wyze Solutions Ltd",
  workflowType: "Conditional",
  status: "Active",
  createdDate: "13-Jun-2026",
  amountRange: "1,000 - 50,000",
  expenseTypes: [
    "Travel",
    "Fuel",
    "Hotel",
  ],
};

  const stages = [
  {
    id: 1,
    stageName: "Department Approval",
    actionType: "Approval",
    approvalGroup:
      "HR Approval Group",
    approver:
      "Karim Hasan",
  },
  {
    id: 2,
    stageName:
      "Finance Verification",
    actionType:
      "Amount Verification",
    approvalGroup:
      "Finance Approval Group",
    approver:
      "Nusrat Jahan",
  },
  {
    id: 3,
    stageName:
      "Payment Release",
    actionType:
      "Payment Processing",
    approvalGroup:
      "Finance Approval Group",
    approver:
      "Rahim Uddin",
  },
];

  const totalStages =
  stages.length;

  return (
  <PermissionGuard
    permission="workflow:read"
  >
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

          <Sidebar active="workflows" />

          <section className="flex-1">

            <Topbar
              title="Workflow Details"
              subtitle="View workflow configuration"
            />

            <div className="p-4">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

                {/* Summary Cards */}

                <div className="grid gap-3 md:grid-cols-2">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                    <p className="text-[11px] text-white/60">
                      Total Stages
                    </p>

                    <h3 className="mt-1 text-2xl font-semibold text-cyan-300">
                      {totalStages}
                    </h3>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                    <p className="text-[11px] text-white/60">
                      Workflow Type
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-cyan-300">
                      {workflow.workflowType}
                    </h3>

                  </div>

                </div>

                {/* Workflow Information */}

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                  <h3 className="text-base font-semibold text-cyan-300">
                    Workflow Information
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    <div>

                      <p className="text-[11px] text-white/50">
                        Workflow Code
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {workflow.code}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] text-white/50">
                        Status
                      </p>

                      <span
                        className="
                        mt-1
                        inline-flex
                        rounded-full
                        bg-green-500/15
                        px-2
                        py-1
                        text-xs
                        text-green-300
                        "
                      >
                        {workflow.status}
                      </span>

                    </div>

                    <div>

                      <p className="text-[11px] text-white/50">
                        Workflow Name
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {workflow.name}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] text-white/50">
                        Company
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {workflow.company}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] text-white/50">
                        Amount Range
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {workflow.amountRange}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] text-white/50">
                        Created Date
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {workflow.createdDate}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5">

                    <p className="text-[11px] text-white/50">
                      Expense Types
                    </p>

                    <p className="mt-1 text-sm">
                      {workflow.expenseTypes.join(", ")}
                    </p>

                  </div>

                </div>

                
                {/* Approval Flow */}

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                  <h3 className="text-base font-semibold text-cyan-300">
                    Approval Flow
                  </h3>

                  <div
                    className="
                    mt-5
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    "
                  >

                    {stages.map(
                      (stage, index) => (

                        <React.Fragment
                          key={stage.id}
                        >

                          <div
                            className="
                            min-w-[220px]
                            rounded-2xl
                            border
                            border-cyan-500/20
                            bg-cyan-500/10
                            px-4
                            py-3
                            "
                          >

                            <p className="text-sm font-semibold">
                              {stage.stageName}
                            </p>

                            <p className="mt-1 text-[11px] text-cyan-300">
                              {stage.actionType}
                            </p>

                            <p className="mt-1 text-[11px] text-white/60">
                              {stage.approvalGroup}
                            </p>

                            <p className="text-[11px] text-white/40">
                              {stage.approver}
                            </p>

                          </div>

                          {index <
                            stages.length - 1 && (

                            <div
                              className="
                              text-xl
                              font-bold
                              text-cyan-300
                              "
                            >
                              →
                            </div>

                          )}

                        </React.Fragment>

                      )
                    )}

                  </div>

                </div>

                <div className="mt-5 flex justify-end gap-2">

                  <button
                    onClick={() => router.back()}
                    className="
                    h-9
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    text-xs
                    text-white
                    "
                  >
                    Back
                  </button>

                  <button
                    onClick={() =>
                      router.push(
                        "/admin/administration/workflows/edit/1"
                      )
                    }
                    className="
                    h-9
                    rounded-xl
                    bg-cyan-500
                    px-4
                    text-xs
                    font-medium
                    text-black
                    "
                  >
                    Edit
                  </button>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </PermissionGuard>
  );
}
