"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

import { workflowService } from "@/services/workflow.service";
import { expenseTypeService } from "@/services/expense-type.service";
import { approvalGroupService } from "@/services/approval-group.service";

export default function EditWorkflowPage() {

  const router = useRouter();

  const { id } = useParams<{
    id: string;
  }>();

  const [currentStep, setCurrentStep] =
    useState(1);

  const [workflowName, setWorkflowName] =
  useState(
    "Local Travel Reimbursement"
  );

  const [company, setCompany] =
  useState(
    "Wyze Solutions Ltd"
  );

  const [status, setStatus] =
    useState("Active");

  const [description, setDescription] =
  useState(
    "Local travel reimbursement workflow."
  );

  const [selectedExpenseTypeIds, setSelectedExpenseTypeIds] =
  useState<string[]>([]);

  const [isDefaultWorkflow, setIsDefaultWorkflow] =
  useState(true);

  const [amountFrom, setAmountFrom] =
  useState("1000");

  const [amountTo, setAmountTo] =
  useState("50000");

  const [expenseTypeList, setExpenseTypeList] =
  useState<any[]>([]);

const [approvalGroups, setApprovalGroups] =
  useState<any[]>([]);

const [approvalGroupDetails, setApprovalGroupDetails] =
  useState<
    Record<
      string,
      {
        approver: string;
        designation: string;
      }
    >
  >({});

const [showPublishConfirm, setShowPublishConfirm] =
  useState(false);

const loadApprovalGroups = async () => {

  try {

    const groups =
      await approvalGroupService.getApprovalGroups();

    setApprovalGroups(groups);

    const details: any = {};

    groups.forEach((group: any) => {

      details[group.group_name] = {

        approver:
          group.members?.[0]?.employee_name ?? "-",

        designation:
          group.members?.[0]?.designation_name ?? "-",

      };

    });

    setApprovalGroupDetails(details);

    return groups;

  } catch (error) {

    console.error(error);

    toast.error("Failed to load approval groups.");

    return [];

  }

};

const loadExpenseTypes = async () => {
  try {
    const response =
      await expenseTypeService.getExpenseTypes();

    const data = Array.isArray(response)
      ? response
      : response?.value ?? [];

    setExpenseTypeList(data);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load expense types.");
  }
};

const loadWorkflow = async () => {
  try {
    const workflow =
      await workflowService.getWorkflow(id as string);

    console.log(
      "Workflow Details:",
      workflow
    );

console.log(workflow);

setWorkflowName(
  workflow.workflowName ?? ""
);

setStatus(
  workflow.status ?? "Active"
);

setDescription(
  workflow.description ?? ""
);

setIsDefaultWorkflow(
  workflow.minAmount === 0 &&
  workflow.maxAmount >= 999999999
);

setAmountFrom(
  String(workflow.minAmount ?? 0)
);

setAmountTo(
  String(workflow.maxAmount ?? 0)
);

setSelectedExpenseTypeIds(
  workflow.reimbursement_type_ids ??
  workflow.reimbursementTypeIds ??
  []
);

setStages(
  (workflow.stages ?? []).map(
    (stage: any) => ({
      id: stage.id,

      stageName:
        stage.stage_name ??
        `Stage ${stage.step_order}`,

      approvalGroup:
        stage.approval_group_name ?? "",

      approvalGroupId:
        stage.approval_group_id ?? "",

      approverType:
        stage.approver_type ?? "GROUP",

      actionType:
          stage.action_type ||
          (
            stage.is_payment_step
              ? "Payment Processing"
              : stage.can_edit_amount
              ? "Amount Verification"
              : "Approval"
          ),

      mandatory:
        stage.min_approver_count > 0,

      emailNotification: true,

      inAppNotification: true,

      slaEnabled: false,

      slaHours: "",

      escalationEnabled: false,

      escalationHours: "",

      escalationGroup: "",
    })
  )
);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load workflow.");
  }
};

useEffect(() => {

  if (!id) return;

  const load = async () => {

    await loadApprovalGroups();

    await loadExpenseTypes();

    await loadWorkflow();

  };

  load();

}, [id]);

  type WorkflowStage = {
  id: string;
  stepOrder?: number;

  stageName: string;

  approvalGroup: string;
  approvalGroupId: string;

  approverType: string;
  actionType: string;

  mandatory: boolean;

  emailNotification: boolean;
  inAppNotification: boolean;

  slaEnabled: boolean;
  slaHours: string;

  escalationEnabled: boolean;
  escalationHours: string;
  escalationGroup: string;
};
  
const [stages, setStages] =
useState<WorkflowStage[]>([]);

  return (
    <PermissionGuard
      permission="workflow:update"
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
              title="Edit Workflow"
              subtitle="Modify workflow configuration and approval flow"
            />

            <div className="p-4">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-cyan-300">
                    Edit Workflow
                  </h2>

                  <p className="mt-1 text-xs text-white/60">
                    Define workflow information, rules and approval stages.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">

                <div
                  className={`rounded-2xl p-3 ${
                    currentStep === 1
                      ? "border border-cyan-500/30 bg-cyan-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[11px] text-white/60">
                    Step 1
                  </p>

                  <h3
                    className={`mt-1 text-sm font-semibold ${
                      currentStep === 1
                        ? "text-cyan-300"
                        : ""
                    }`}
                  >
                    Workflow Info
                  </h3>

                </div>

                <div
                  className={`rounded-2xl p-3 ${
                    currentStep === 2
                      ? "border border-cyan-500/30 bg-cyan-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[11px] text-white/60">
                    Step 2
                  </p>

                  <h3
                    className={`mt-1 text-sm font-semibold ${
                      currentStep === 2
                        ? "text-cyan-300"
                        : ""
                    }`}
                  >
                    Application Rules
                  </h3>

                </div>

                <div
                  className={`rounded-2xl p-3 ${
                    currentStep === 3
                      ? "border border-cyan-500/30 bg-cyan-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[11px] text-white/60">
                    Step 3
                  </p>

                  <h3
                    className={`mt-1 text-sm font-semibold ${
                      currentStep === 3
                        ? "text-cyan-300"
                        : ""
                    }`}
                  >
                    Approval Stages
                  </h3>

                </div>

                <div
                  className={`rounded-2xl p-3 ${
                    currentStep === 4
                      ? "border border-cyan-500/30 bg-cyan-500/10"
                      : "border border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[11px] text-white/60">
                    Step 4
                  </p>

                  <h3
                    className={`mt-1 text-sm font-semibold ${
                      currentStep === 4
                        ? "text-cyan-300"
                        : ""
                    }`}
                  >
                    Review & Create
                  </h3>

                </div>

              </div>

                {currentStep === 1 && (

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                <div className="mb-4">
                    <h3 className="text-base font-semibold text-cyan-300">
                    Workflow Information
                    </h3>

                    <p className="mt-1 text-xs text-white/60">
                    Configure workflow master information.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    <div>
                    <label className="mb-2 block text-xs font-medium text-white/80">
                        Workflow Name
                    </label>

                    <input
                      type="text"
                      value={workflowName}
                      onChange={(e) =>
                        setWorkflowName(
                          e.target.value
                        )
                      }
                      placeholder="Enter workflow name"
                      className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/10
                      px-3
                      text-xs
                      text-white
                      outline-none
                      "
                  />
                    
                    </div>

                    <div>
                    <label className="mb-2 block text-xs font-medium text-white/80">
                        Workflow Code
                    </label>

                    <input
                        type="text"
                        value="Auto Generated"
                        disabled
                        className="
                        h-10
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        text-xs
                        text-white/50
                        "
                    />
                    </div>

                                       
                    
                    <div>
                    <label className="mb-2 block text-xs font-medium text-white/80">
                        Status
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value
                        )
                      }
                      className="
                      h-10
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/10
                      px-3
                      text-xs
                      text-white
                      "
                  >
                      <option
                        value="Draft"
                        className="bg-[#17386E]"
                      >
                        Draft
                      </option>

                      <option
                        value="Active"
                        className="bg-[#17386E]"
                      >
                        Active
                      </option>

                      <option
                        value="Inactive"
                        className="bg-[#17386E]"
                      >
                        Inactive
                      </option>
                  </select>
                    </div>

                </div>



                    <div className="mt-4">

                    <label className="mb-2 block text-xs font-medium text-white/80">
                    Description
                    </label>

                    <textarea
                    rows={4}
                    placeholder="Workflow description"
                    className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/10
                    p-3
                    text-xs
                    text-white
                    outline-none
                    "
                    />

                </div>

                <div className="mt-5 flex justify-end gap-2">

                    <button
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
                    Cancel
                    </button>

                    <button
                      onClick={() => {

                        if (!workflowName.trim()) {

                          toast.error(
                            "Workflow name is required."
                          );

                          return;
                        }

                        if (!company) {

                          toast.error(
                            "Company is required."
                          );

                          return;
                        }

                        setCurrentStep(2);

                      }}
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
                      Continue
                    </button>

                </div>
                

                                </div>
                )}

                {currentStep === 2 && (

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <div className="mb-4">

                      <h3 className="text-base font-semibold text-cyan-300">
                        Application Rules
                      </h3>

                      <p className="mt-1 text-xs text-white/60">
                        Configure workflow applicability rules.
                      </p>

                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-xs font-medium text-white/80">
                          Company
                        </label>

                        <select
                          value={company}
                          onChange={(e) =>
                            setCompany(
                              e.target.value
                            )
                          }
                          className="
                          h-10
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-white/10
                          px-3
                          text-xs
                          text-white
                          "
                        >

                          <option
                            value="WyzeTech Ltd"
                            className="bg-[#17386E]"
                          >
                            WyzeTech Ltd
                          </option>

                        </select>

                      </div>

                      <div className="md:col-span-2">

                        <label className="mb-2 block text-xs font-medium text-white/80">
                          Expense Types
                        </label>

                        <div
                        className={`
                          grid
                          grid-cols-3
                          gap-2
                          rounded-xl
                          border
                          border-white/10
                          bg-white/10
                          p-3
                          ${
                            isDefaultWorkflow
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }
                        `}
                      >

                          {expenseTypeList.map((item: any) => (

                            <label
                              key={item.id}
                              className="flex items-center gap-2 text-xs text-white"
                            >

                              <input
                                type="checkbox"
                                checked={selectedExpenseTypeIds.includes(item.id)}
                                onChange={(e) => {

                                  if (e.target.checked) {

                                    setSelectedExpenseTypeIds([
                                      ...selectedExpenseTypeIds,
                                      item.id,
                                    ]);

                                  } else {

                                    setSelectedExpenseTypeIds(
                                     selectedExpenseTypeIds.filter(
                                        (x) => x !== item.id
                                      )
                                    );

                                  }

                                }}
                                className="h-4 w-4"
                              />

                              {item.name}

                            </label>

                          ))}

                        </div>

                      </div>

                      <div>

                        <label className="mb-2 block text-xs font-medium text-white/80">
                          Amount From
                        </label>

                        <input
                          type="number"
                          value={amountFrom}
                          onChange={(e) =>
                            setAmountFrom(
                              e.target.value
                            )
                          }
                          disabled={isDefaultWorkflow}
                          placeholder="0"
                          className="
                          h-10
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-white/10
                          px-3
                          text-xs
                          text-white
                          disabled:opacity-50
                          "
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-xs font-medium text-white/80">
                          Amount To
                        </label>

                        <input
                          type="number"
                          value={amountTo}
                          onChange={(e) =>
                            setAmountTo(
                              e.target.value
                            )
                          }
                          disabled={isDefaultWorkflow}
                          placeholder="999999"
                          className="
                          h-10
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-white/10
                          px-3
                          text-xs
                          text-white
                          disabled:opacity-50
                          "
                        />

                      </div>

                    </div>

                    <label className="mt-4 flex items-center gap-2 text-xs text-white">

                      <input
                        type="checkbox"
                        checked={isDefaultWorkflow}
                        onChange={(e) =>
                          setIsDefaultWorkflow(
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />

                      Use as Default Workflow

                    </label>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        onClick={() =>
                          setCurrentStep(1)
                        }
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
                        onClick={() => {

                          if (
                            !isDefaultWorkflow &&
                            selectedExpenseTypeIds.length === 0
                          ) {

                            toast.error(
                              "At least one expense type is required."
                            );

                            return;
                          }

                          if (
                            !isDefaultWorkflow &&
                            (
                              !amountFrom ||
                              !amountTo
                            )
                          ) {

                            toast.error(
                              "Amount range is required."
                            );

                            return;
                          }

                          setCurrentStep(3);

                        }}
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
                        Continue
                      </button>

                    </div>

                  </div>

                )}

              </div>

                              {currentStep === 3 && (

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <div className="mb-4 flex items-center justify-between">

                      <div>

                        <h3 className="text-base font-semibold text-cyan-300">
                          Approval Stages
                        </h3>

                        <p className="mt-1 text-xs text-white/60">
                          Configure approval flow and approver groups.
                        </p>

                      </div>

                      
                    </div>

                    <div className="space-y-4">

                      {stages.map(
                        (stage, index) => (

                          <div
                            key={stage.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-4"
                          >

                            <div className="mb-4 flex items-center justify-between">

                              <h4 className="text-sm font-semibold text-cyan-300">
                                Stage {index + 1}
                              </h4>

                              {stages.length > 1 && (

                                <button
                                  onClick={() =>
                                    setStages(
                                      stages.filter(
                                        (s) =>
                                          s.id !== stage.id
                                      )
                                    )
                                  }
                                  className="text-xs text-red-300"
                                >
                                  Remove
                                </button>

                              )}

                            </div>

                            <div className="grid gap-4 md:grid-cols-3">

                              <div>

                                <label className="mb-2 block text-xs font-medium text-white/80">
                                  Stage Name
                                </label>

                                <input
                                  type="text"
                                  value={stage.stageName}
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? {
                                              ...s,
                                              stageName:
                                                e.target.value,
                                            }
                                          : s
                                      )
                                    )
                                  }
                                  className="
                                  h-10
                                  w-full
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

                              <div>

                                <label className="mb-2 block text-xs font-medium text-white/80">
                                  Approval Group
                                </label>

                                <select
                                  value={
                                    stage.approvalGroupId
                                  }
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? {
                                              ...s,
                                              approvalGroupId:
                                                e.target.value,
                                              approvalGroup:
                                                approvalGroups.find(
                                                  (g: any) =>
                                                    g.id === e.target.value
                                                )?.group_name ?? "",
                                            }
                                          : s
                                      )
                                    )
                                  }
                                  className="
                                  h-10
                                  w-full
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-white/10
                                  px-3
                                  text-xs
                                  text-white
                                  "
                                >

                                  <option
                                    value=""
                                    className="bg-[#17386E]"
                                  >
                                    Select Group
                                  </option>

                                  {approvalGroups.map(
                                    (group: any) => (
                                      <option
                                        key={group.id}
                                        value={group.id}
                                        className="bg-[#17386E]"
                                      >
                                        {group.group_name}
                                      </option>
                                    )
                                  )}

                                  </select>

                                    </div>

                                    <div>

                                      <label className="mb-2 block text-xs font-medium text-white/80">
                                        Primary Approver
                                      </label>

                                      <div
                                        className="
                                        h-10
                                        rounded-xl
                                        border
                                        border-cyan-500/20
                                        bg-cyan-500/10
                                        px-3
                                        flex
                                        items-center
                                        text-xs
                                        text-cyan-300
                                        "
                                      >

                                        {
                                          stage.approvalGroup
                                            ? approvalGroupDetails[
                                                stage.approvalGroup as keyof typeof approvalGroupDetails
                                              ]?.approver
                                            : "Select approval group"
                                        }

                                      </div>

                                      {stage.approvalGroup && (

                                        <p className="mt-1 text-[11px] text-white/60">

                                          {
                                            approvalGroupDetails[
                                              stage.approvalGroup
                                            ]?.designation ?? "-"
                                          }

                                        </p>

                                      )}

                                    </div>

                                    </div>

                                    <div className="mt-4">

                              <label className="mb-2 block text-xs font-medium text-white/80">
                                Workflow Action
                              </label>

                              {stage.actionType === "Approval" && (

                                <div
                                  className="
                                  mb-3
                                  rounded-xl
                                  border
                                  border-blue-500/20
                                  bg-blue-500/10
                                  px-3
                                  py-2
                                  text-[11px]
                                  text-blue-300
                                  "
                                >
                                  Approval Stage
                                </div>

                              )}

                              {stage.actionType === "Amount Verification" && (

                                <div
                                  className="
                                  mb-3
                                  rounded-xl
                                  border
                                  border-yellow-500/20
                                  bg-yellow-500/10
                                  px-3
                                  py-2
                                  text-[11px]
                                  text-yellow-300
                                  "
                                >
                                  Finance Verification Stage
                                </div>

                              )}

                              {stage.actionType === "Payment Processing" && (

                                <div
                                  className="
                                  mb-3
                                  rounded-xl
                                  border
                                  border-green-500/20
                                  bg-green-500/10
                                  px-3
                                  py-2
                                  text-[11px]
                                  text-green-300
                                  "
                                >
                                  Payment Processing Stage
                                </div>

                              )}

                            <div className="grid gap-2 md:grid-cols-3">

                              {[
                                "Approval",
                                "Amount Verification",
                                "Payment Processing",
                              ].map((action) => (

                                <label
                                  key={action}
                                  className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-white/5
                                  p-3
                                  text-xs
                                  "
                                >

                                  <input
                                    type="radio"
                                    name={`action-${stage.id}`}
                                    checked={
                                      stage.actionType === action
                                    }
                                    onChange={() =>
                                      setStages(
                                        stages.map((s) =>
                                          s.id === stage.id
                                            ? {
                                                ...s,
                                                actionType: action,
                                              }
                                            : s
                                        )
                                      )
                                    }
                                  />

                                  {action}

                                </label>

                              ))}

                            </div>

                          </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">

                              <label className="flex items-center gap-2 text-xs">

                                <input
                                  type="checkbox"
                                  checked={
                                    stage.mandatory
                                  }
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? {
                                              ...s,
                                              mandatory:
                                                e.target.checked,
                                            }
                                          : s
                                      )
                                    )
                                  }
                                />

                                Mandatory Approval

                              </label>

                              <label className="flex items-center gap-2 text-xs">

                                <input
                                  type="checkbox"
                                  checked={
                                    stage.emailNotification
                                  }
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? {
                                              ...s,
                                              emailNotification:
                                                e.target.checked,
                                            }
                                          : s
                                      )
                                    )
                                  }
                                />

                                Email Notification

                              </label>

                              <label className="flex items-center gap-2 text-xs">

                                <input
                                  type="checkbox"
                                  checked={
                                    stage.inAppNotification
                                  }
                                  onChange={(e) =>
                                    setStages(
                                      stages.map((s) =>
                                        s.id === stage.id
                                          ? {
                                              ...s,
                                              inAppNotification:
                                                e.target.checked,
                                            }
                                          : s
                                      )
                                    )
                                  }
                                />

                                In-App Notification

                              </label>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                    <div
                    className="
                    rounded-2xl
                    border
                    border-dashed
                    border-cyan-500/30
                    bg-cyan-500/5
                    p-4
                    "
                  >

                    <button
                      onClick={() =>
                        setStages([
                          ...stages,
                          {
                            id: `new-${Date.now()}`,
                            stageName: "",
                            approvalGroup: "",
                            approvalGroupId: "",
                            approverType: "GROUP",
                            actionType: "Approval",
                            mandatory: true,
                            emailNotification: true,
                            inAppNotification: true,
                            slaEnabled: false,
                            slaHours: "",
                            escalationEnabled: false,
                            escalationHours: "",
                            escalationGroup: "",
                          },
                        ])
                      }
                      className="
                      w-full
                      rounded-xl
                      py-3
                      text-sm
                      font-medium
                      text-cyan-300
                      "
                    >
                      + Add Next Stage
                    </button>

                  </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        onClick={() =>
                          setCurrentStep(2)
                        }
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
                        onClick={() => {

                          const invalidStageName =
                            stages.find(
                              (stage) =>
                                !stage.stageName.trim()
                            );

                          if (invalidStageName) {

                            toast.error(
                              "Stage Name is required."
                            );

                            return;

                          }

                          const invalidStage =
                            stages.find(
                              (stage) =>
                                !stage.approvalGroup.trim()
                            );

                          if (invalidStage) {

                            toast.error(
                              `${
                                invalidStage.stageName ||
                                "Stage"
                              } requires an Approval Group.`
                            );

                            return;

                          }

                        const paymentStages =
                          stages.filter(
                            (s) =>
                              s.actionType ===
                              "Payment Processing"
                          );

                        const verificationStages =
                          stages.filter(
                            (s) =>
                              s.actionType ===
                              "Amount Verification"
                          );

                        if (
                          paymentStages.length > 1
                        ) {

                          toast.error(
                            "Only one payment stage is allowed."
                          );

                          return;

                        }

                        if (
                          verificationStages.length > 1
                        ) {

                          toast.error(
                            "Only one Amount Verification stage is allowed."
                          );

                          return;

                        }

                        const lastStage =
                          stages[
                            stages.length - 1
                          ];

                        if (
                          paymentStages.length === 1 &&
                          lastStage.actionType !==
                            "Payment Processing"
                        ) {

                          toast.error(
                            "Payment stage must be the final stage."
                          );

                          return;

                        }

                        const paymentIndex =
                          stages.findIndex(
                            (s) =>
                              s.actionType ===
                              "Payment Processing"
                          );

                        const verificationIndex =
                          stages.findIndex(
                            (s) =>
                              s.actionType ===
                              "Amount Verification"
                          );

                        if (
                          paymentIndex >= 0 &&
                          verificationIndex === -1
                        ) {

                          toast.error(
                            "Amount Verification stage is required before Payment Processing."
                          );

                          return;

                        }

                        if (
                          paymentIndex >= 0 &&
                          verificationIndex > paymentIndex
                        ) {

                          toast.error(
                            "Amount Verification must be completed before Payment Processing."
                          );

                          return;

                        }

                        setCurrentStep(4);

                      }}
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
                        Continue
                      </button>

                    </div>

                  </div>

                )}
                
                 
                {currentStep === 4 && (
                  <>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <div className="mb-5">

                      <h3 className="text-base font-semibold text-cyan-300">
                        Review Workflow
                      </h3>                      

                      <p className="mt-1 text-xs text-white/60">
                        Review before publishing.
                      </p>

                    </div>

                    <div
                      className="
                      mb-4
                      rounded-2xl
                      border
                      border-emerald-500/20
                      bg-emerald-500/10
                      p-4
                      "
                    >

                      <p className="text-sm font-medium text-emerald-300">
                        Workflow Ready For Publishing
                      </p>

                      <p className="mt-1 text-xs text-white/70">
                        Approval flow, verification stage and payment sequence validation completed.
                      </p>

                    </div>

                    <div className="grid gap-4 md:grid-cols-3">

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Workflow Name
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {workflowName}
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Company
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {company}
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Status
                        </p>

                        <p className="mt-2 text-sm font-medium">
                          {status}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-4">

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Total Stages
                        </p>

                        <p className="mt-2 text-lg font-semibold text-cyan-300">
                          {stages.length}
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Approval
                        </p>

                        <p className="mt-2 text-lg font-semibold text-cyan-300">
                          {
                            stages.filter(
                              (s) =>
                                s.actionType ===
                                "Approval"
                            ).length
                          }
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Verification
                        </p>

                        <p className="mt-2 text-lg font-semibold text-cyan-300">
                          {
                            stages.filter(
                              (s) =>
                                s.actionType ===
                                "Amount Verification"
                            ).length
                          }
                        </p>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                        <p className="text-[11px] text-white/50">
                          Payment
                        </p>

                        <p className="mt-2 text-lg font-semibold text-cyan-300">
                          {
                            stages.filter(
                              (s) =>
                                s.actionType ===
                                "Payment Processing"
                            ).length
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">

                      <h4 className="mb-3 text-sm font-semibold text-cyan-300">
                        Rules
                      </h4>

                      <div className="space-y-2 text-xs">

                        <p>
                          <span className="text-white/60">
                            Expense Types:
                          </span>{" "}
                          {
                            selectedExpenseTypeIds.length > 0
                            ? expenseTypeList
                                .filter((x: any) =>
                                  selectedExpenseTypeIds.includes(x.id)
                                )
                                .map((x: any) => x.name)
                                .join(", ")
                              : "All"
                          }
                        </p>

                        <p>
                          <span className="text-white/60">
                            Amount Range:
                          </span>{" "}
                          {
                            isDefaultWorkflow
                              ? "Default Workflow"
                              : `${amountFrom} - ${amountTo}`
                          }
                        </p>

                        <p>
                          <span className="text-white/60">
                            Workflow Type:
                          </span>{" "}
                          {
                            isDefaultWorkflow
                              ? "Default Workflow"
                              : "Conditional Workflow"
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">

                      <h4 className="mb-3 text-sm font-semibold text-cyan-300">
                        Approval Flow
                      </h4>

                      <div
                        className="
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
                                key={stage.id}
                                className="
                                min-w-[220px]
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/5
                                px-4
                                py-3
                                "
                              >

                                <p className="text-sm font-semibold">
                                  {stage.stageName || `Stage ${index + 1}`}
                                </p>

                                <p className="mt-1 text-[11px] text-cyan-300">
                                  {stage.actionType}
                                </p>

                                <p className="mt-1 text-[11px] text-white/60">
                                  {stage.approvalGroup || "-"}
                                </p>

                                <p className="text-[11px] text-white/40">

                                  {
                                    approvalGroupDetails[
                                      stage.approvalGroup
                                    ]?.approver ?? "-"
                                  }

                                </p>

                              </div>

                              {index < stages.length - 1 && (

                                <div
                                  className="
                                  text-xl
                                  font-bold
                                  text-cyan-300
                                  "
                                >
                                  &gt;
                                </div>

                              )}

                            </React.Fragment>

                          )
                        )}

                      </div>

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                      <button
                        onClick={() =>
                          setCurrentStep(3)
                        }
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
                          setShowPublishConfirm(true)
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
                        Update Workflow
                      </button>

                    </div>

                  </div>

                    {showPublishConfirm && (

                    <div
                      className="
                      fixed
                      inset-0
                      z-50
                      flex
                      items-center
                      justify-center
                      bg-black/60
                      backdrop-blur-sm
                      "
                    >

                      <div
                        className="
                        w-full
                        max-w-md
                        rounded-3xl
                        border
                        border-white/10
                        bg-[#08142F]
                        p-6
                        "
                      >

                        <h3 className="text-lg font-semibold text-cyan-300">
                          Update Workflow
                        </h3>

                        <p className="mt-2 text-xs text-white/60">
                          Please review workflow details before updating.
                        </p>

                        <div className="mt-4 space-y-2 text-sm">

                          <p>
                            <span className="text-white/60">
                              Workflow:
                            </span>{" "}
                            {workflowName}
                          </p>

                          <p>
                            <span className="text-white/60">
                              Stages:
                            </span>{" "}
                            {stages.length}
                          </p>

                          <p>
                            <span className="text-white/60">
                              Type:
                            </span>{" "}
                            {
                              isDefaultWorkflow
                                ? "Default Workflow"
                                : "Conditional Workflow"
                            }
                          </p>

                        </div>

                        <div className="mt-6 flex justify-end gap-2">

                          <button
                            onClick={() =>
                              setShowPublishConfirm(false)
                            }
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
                            Cancel
                          </button>

                          <button
                            onClick={async () => {

                                try {

                                  const payload = {

                                    name: workflowName,

                                    reimbursement_type_ids: selectedExpenseTypeIds,

                                    module_name: "REIMBURSEMENT",

                                    min_amount: isDefaultWorkflow
                                      ? 0
                                      : Number(amountFrom),

                                    max_amount: isDefaultWorkflow
                                      ? 999999999
                                      : Number(amountTo),

                                    is_active: status === "Active",

                                  };

                                  await workflowService.updateWorkflow(
                                    id as string,
                                    payload
                                  );

                                  // Update/Create Workflow Stages
                                  for (const [index, stage] of stages.entries()) {

                                    const stepPayload = {

                                      workflow_id: id,

                                      step_order: index + 1,

                                      stage_name: stage.stageName,

                                      action_type: stage.actionType,

                                      approver_type: stage.approverType ?? "GROUP",

                                      approval_group_id:
                                        stage.approvalGroupId || null,

                                      role_id: null,

                                      user_id: null,

                                      min_approver_count:
                                        stage.mandatory ? 1 : 0,

                                      can_edit_amount:
                                        stage.actionType ===
                                        "Amount Verification",

                                      is_finance_step:
                                        stage.actionType ===
                                        "Finance Verification",

                                      is_payment_step:
                                        stage.actionType ===
                                        "Payment Processing",

                                    };

                                    if (
                                        String(stage.id).startsWith("new-")
                                      ) {

                                        await workflowService.createWorkflowStep(
                                          stepPayload
                                        );

                                      } else {

                                        await workflowService.updateWorkflowStep(
                                          String(stage.id),
                                          stepPayload
                                        );

                                      }

                                  }

                                  setShowPublishConfirm(false);

                                  toast.success(
                                    "Workflow updated successfully."
                                  );

                                  router.push(
                                    "/admin/administration/workflows"
                                  );

                                } catch (error) {

                                  console.error(error);

                                  toast.error(
                                    "Failed to update workflow."
                                  );

                                }

                              }}
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
                            Confirm Update
                          </button>

                        </div>

                      </div>

                    </div>

                  )}

                  </>

                  )}

              

            </div>
              

          </section>

        </div>

      </main>
    </PermissionGuard>
  );
}
