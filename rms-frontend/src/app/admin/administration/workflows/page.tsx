"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { workflowService } from "@/services/workflow.service";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

export default function WorkflowPage() {
    const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

const [showWorkflowModal, setShowWorkflowModal] =
  useState(false);

const [workflowForm, setWorkflowForm] =
  useState<Workflow>({
    id: 0,
    workflowCode: "",
    workflowName: "",
    claimType: "",
    company: "",
    department: "",
    status: "Draft",
    workflowType: "Default",
    description: "",
    rules: [],
    stages: [
      {
        id: 1,
        sequence: 1,
        stageName: "",
        approverType: "Line Manager",
        slaHours: 48,
        escalationHours: 72,
      },
    ],
  });

  type WorkflowRule = {
    id: number;
    field: string;
    operator: string;
    value: string;
    };

    type WorkflowStage = {
    id: number;
    sequence: number;
    stageName: string;
    approverType: string;
    slaHours: number;
    escalationHours: number;
    };

    type Workflow = {
    id: number;
    workflowCode: string;
    workflowName: string;
    claimType: string;
    company: string;
    department: string;
    status: "Draft" | "Active" | "Inactive";
    workflowType:
  | "Default"
  | "Conditional";
    description: string;
    rules: WorkflowRule[];
    stages: WorkflowStage[];
    };

  const [workflows, setWorkflows] =
  useState<any[]>([]);

  const loadWorkflows = async () => {

  try {

    const response =
      await workflowService.getWorkflows();

    console.log("Workflow API Response:", response);

    const data = Array.isArray(response)
      ? response
      : response?.value ?? [];

    console.log("Workflow Data:", data);

    setWorkflows(data);

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to load workflows."
    );

  }

};
  
  const recordsPerPage = 10;

  useEffect(() => {

    loadWorkflows();

  }, []);

  const filteredWorkflows =
    workflows.filter((workflow) => {
      const matchesSearch =
        workflow.workflowCode
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        workflow.workflowName
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        workflow.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  const totalPages = Math.ceil(
    filteredWorkflows.length /
      recordsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    recordsPerPage;

  const paginatedWorkflows =
    filteredWorkflows.slice(
      startIndex,
      startIndex +
        recordsPerPage
    );

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
              title="Workflow Configuration"
              subtitle="Manage reimbursement approval workflows"
            />

            <div className="p-4">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

                <div className="mb-4 grid gap-3 md:grid-cols-4">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Total Workflows
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                      {
                        workflows.length
                      }
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                      {
                        workflows.filter(
                          (w) =>
                            w.status ===
                            "Active"
                        ).length
                      }
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Default Workflows
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-yellow-300">
                      {
                        workflows.filter(
                        (w) =>
                          w.workflowType ===
                          "Default"
                      ).length
                      }
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Conditional Workflows
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-red-300">
                      {
                        workflows.filter(
                        (w) =>
                          w.workflowType ===
                          "Conditional"
                      ).length
                      }
                    </h3>
                  </div>

                </div>

                <div className="mb-4 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <input
                      placeholder="Search workflow..."
                      value={search}
                      onChange={(e) => {
                        setSearch(
                          e.target.value
                        );
                        setCurrentPage(
                          1
                        );
                      }}
                      className="h-9 w-[220px] rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white"
                    />

                    <select
                      value={
                        statusFilter
                      }
                      onChange={(
                        e
                      ) => {
                        setStatusFilter(
                          e.target
                            .value
                        );
                        setCurrentPage(
                          1
                        );
                      }}
                      className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white"
                    >
                      <option
                        value="All"
                        className="bg-[#17386E]"
                      >
                        All
                      </option>

                      <option
                        value="Active"
                        className="bg-[#17386E]"
                      >
                        Active
                      </option>

                      <option
                        value="Draft"
                        className="bg-[#17386E]"
                      >
                        Draft
                      </option>

                      <option
                        value="Inactive"
                        className="bg-[#17386E]"
                      >
                        Inactive
                      </option>
                    </select>

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                        onClick={() =>
                            router.push(
                            "/admin/administration/workflows/new"
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
                        + New Workflow
                        </button>

                    <button
                      className="h-9 rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white hover:bg-white/10"
                    >
                      Export
                    </button>

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b border-white/10">

                        <th className="p-3 text-left text-xs">
                          Workflow Name
                        </th>

                        <th className="p-3 text-left text-xs">
                          Claim Type
                        </th>

                        <th className="p-3 text-left text-xs">
                          Stages
                        </th>

                        <th className="p-3 text-left text-xs">
                          Type
                        </th>

                        <th className="p-3 text-left text-xs">
                          Status
                        </th>

                        <th className="p-3 text-left text-xs">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {paginatedWorkflows.length === 0 ? (
                        <tr>
                            <td
                            colSpan={6}
                            className="
                            py-16
                            text-center
                            "
                            >
                            <div className="flex flex-col items-center justify-center">

                                <div
                                className="
                                mb-4
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-cyan-500/20
                                bg-cyan-500/10
                                "
                                >
                                🌊
                                </div>

                                <h3 className="text-base font-semibold text-white">
                                No Workflows Configured
                                </h3>

                                <p className="mt-2 max-w-md text-xs text-white/60">
                                Create your first workflow to define approval
                                stages, approvers, routing rules and SLA
                                escalation policies.
                                </p>

                            </div>
                            </td>
                        </tr>
                        ) : (
                        paginatedWorkflows.map((workflow) => (
                            <tr
                            key={workflow.id}
                            className="border-b border-white/5"
                            >

                            <td className="p-3 text-xs">
                                {workflow.workflowName}
                            </td>

                            <td className="p-3 text-xs">
                              {Array.isArray(workflow.claimTypes) && workflow.claimTypes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {workflow.claimTypes.map((type: string) => (
                                    <span
                                      key={type}
                                      className="rounded-full bg-cyan-500/15 px-2 py-1 text-[10px] text-cyan-300"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="p-3 text-xs">
                                {workflow.stages.length}
                            </td>

                            <td className="p-3 text-xs">

                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                                workflow.workflowType === "Default"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-purple-500/15 text-purple-300"
                              }`}
                            >
                              {workflow.workflowType}
                            </span>

                          </td>

                            <td className="p-3 text-xs">

                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                                workflow.status === "Active"
                                  ? "bg-green-500/15 text-green-300"
                                  : workflow.status === "Draft"
                                  ? "bg-yellow-500/15 text-yellow-300"
                                  : "bg-red-500/15 text-red-300"
                              }`}
                            >
                              {workflow.status}
                            </span>

                          </td>

                            <td className="p-3">

                            <div className="flex items-center gap-2">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/administration/workflows/view/${workflow.id}`
                                  )
                                }
                                className="
                                rounded-lg
                                border
                                border-cyan-500/20
                                bg-cyan-500/10
                                px-2
                                py-1
                                text-[11px]
                                text-cyan-300
                                "
                              >
                                View
                              </button>

                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/administration/workflows/edit/${workflow.id}`
                                  )
                                }
                                className="
                                rounded-lg
                                border
                                border-white/10
                                bg-white/5
                                px-2
                                py-1
                                text-[11px]
                                text-white
                                "
                              >
                                Edit
                              </button>                             

                            <button
                                onClick={() => {
                                  toast("Delete this workflow?", {
                                    style: { background: "#7f1d1d", border: "1px solid rgba(239,68,68,0.6)", color: "white" },
                                    actionButtonStyle: { background: "#ef4444", color: "white" },
                                    cancelButtonStyle: { background: "rgba(255,255,255,0.15)", color: "white" },
                                    action: {
                                      label: "Confirm Delete",
                                      onClick: async () => {
                                        try {
                                          await workflowService.deleteWorkflow(workflow.id);
                                          toast.success("Workflow deleted.");
                                          loadWorkflows();
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
                                rounded-lg
                                border
                                border-red-500/20
                                bg-red-500/10
                                px-2
                                py-1
                                text-[11px]
                                text-red-300
                                "
                              >
                                Delete
                              </button>

                            </div>

                          </td>
                            </tr>
                        ))
                        )}

                    </tbody>

                  </table>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-xs text-white/60">
                      Showing{" "}
                      {startIndex +
                        1}
                      -
                      {Math.min(
                        startIndex +
                          recordsPerPage,
                        filteredWorkflows.length
                      )}{" "}
                      of{" "}
                      {
                        filteredWorkflows.length
                      }
                    </p>

                    <div className="flex items-center gap-1">

                      <button
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((page) => Math.max(page - 1, 1))
                        }
                        className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`h-8 min-w-[32px] rounded-lg text-xs ${
                            currentPage === index + 1
                              ? "bg-cyan-500 text-black"
                              : "border border-white/10 bg-white/5 text-white"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(page + 1, totalPages)
                          )
                        }
                        className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs disabled:opacity-50"
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