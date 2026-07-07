"use client";

import { useEffect, useState } from "react";
import { approvalGroupService } from "@/services/approval-group.service";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

type ApprovalGroup = {
  id: string;
  group_code: string;
  group_name: string;
  approval_method: "ANY_ONE" | "ALL";
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;

  member_count: number;

  members: {
    id: string;
    employee_name: string;
    department_name: string;
    designation_name: string;
  }[];
};

export default function ApprovalGroupsPage() {

  const router = useRouter();

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteGroupId, setDeleteGroupId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
  useState("All");

  const [methodFilter, setMethodFilter] =
    useState("All");

  const [approvalGroups, setApprovalGroups] =
    useState<ApprovalGroup[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [hoveredGroupId, setHoveredGroupId] =
    useState<string | null>(null);

  const loadApprovalGroups = async () => {
  try {

    setLoading(true);

    const response =
      await approvalGroupService.getApprovalGroups();

    console.log("========== RESPONSE ==========");
    console.log(response);
    console.log("Array:", Array.isArray(response));
    console.log("Length:", response?.length);
    console.log("response.data:", response?.data);
    console.log("response.items:", response?.items);

    setApprovalGroups(
      Array.isArray(response)
        ? response
        : response.data ?? response.items ?? []
    );

  } catch (error) {

    console.error(
      "Failed to load approval groups",
      error
    );

  } finally {

    setLoading(false);

  }
};

useEffect(() => {

  loadApprovalGroups();

}, []);

const handleDelete = async () => {

  if (!deleteGroupId) return;

  try {

    setDeleteLoading(true);

    await approvalGroupService.deleteApprovalGroup(
      deleteGroupId
    );

    setApprovalGroups((prev: any) =>
      prev.filter(
        (x: any) => x.id !== deleteGroupId
      )
    );

    toast.success(
      "Approval group deleted successfully."
    );

    setDeleteGroupId(null);

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to delete approval group."
    );

  } finally {

    setDeleteLoading(false);

  }

};

const filteredGroups =
  (approvalGroups ?? []).filter((group) => {

      const matchesSearch =
        group.group_code
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        group.group_name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (group.is_active ? "Active" : "Inactive") === statusFilter;

      const matchesMethod =
        methodFilter === "All" ||
        (methodFilter === "ANY_ONE"
          ? group.approval_method === "ANY_ONE"
          : group.approval_method === "ALL");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod
      );
    });

const ITEMS_PER_PAGE = 10;

const [currentPage, setCurrentPage] =
  useState(1);

const totalPages =
  Math.max(
    1,
    Math.ceil(
      filteredGroups.length /
      ITEMS_PER_PAGE
    )
  );

const paginatedGroups =
  filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

useEffect(() => {
  setCurrentPage(1);
}, [search, statusFilter, methodFilter]);

  return (
    <PermissionGuard
      permission="approval_group:read"
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

          <Sidebar active="approval-groups" />

          <section className="flex-1">

            <Topbar
              title="Approval Groups"
              subtitle="Manage workflow approval teams"
            />

            <div className="p-4">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

                <div className="mb-4 grid gap-3 md:grid-cols-4">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Total Groups
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                      {approvalGroups.length}
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Active
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                      {approvalGroups.filter(
                        (group) => group.is_active
                      ).length}
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                      Inactive
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-red-300">
                      {approvalGroups.filter(
                        (group) => !group.is_active
                      ).length}
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">

                  <p className="text-[11px] text-white/60">
                    Used In Workflows
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    0
                  </h3>

                </div>

                </div>

              <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <input
                    placeholder="Search group..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    className="
                      h-9
                      w-[220px]
                      rounded-xl
                      border
                      border-white/10
                      bg-white/10
                      px-3
                      text-xs
                      text-white
                      "
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="
                      h-9
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
                      value="Inactive"
                      className="bg-[#17386E]"
                    >
                      Inactive
                    </option>
                  </select>

                  <select
                    value={methodFilter}
                    onChange={(e) =>
                      setMethodFilter(e.target.value)
                    }
                    className="
                      h-9
                      rounded-xl
                      border
                      border-white/10
                      bg-white/10
                      px-3
                      text-xs
                      text-white
                      min-w-[170px]
                    "
                  >
                    <option
                      value="All"
                      className="bg-[#17386E]"
                    >
                      All Methods
                    </option>

                    <option
                      value="ANY_ONE"
                      className="bg-[#17386E]"
                    >
                      Any One Approves
                    </option>

                    <option
                      value="ALL"
                      className="bg-[#17386E]"
                    >
                      All Must Approve
                    </option>
                  </select>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      router.push(
                        "/admin/administration/approval-groups/new"
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
                    + New Group
                  </button>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-white/10">

                      <th className="p-3 text-left text-xs font-semibold">
                        Group Name
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Approval Method
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Members
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Status
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Workflow Usage
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Updated
                      </th>

                      <th className="p-3 text-left text-xs font-semibold">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredGroups.length === 0 ? (

                      <tr>

                        <td
                          colSpan={6}
                          className="py-16 text-center"
                        >

                          <h3 className="text-base font-semibold text-cyan-300">
                            No Approval Groups Found
                          </h3>

                          <p className="mt-2 text-xs text-white/60">
                            No approval groups match your search criteria.
                          </p>

                        </td>

                      </tr>

                    ) : (

                      paginatedGroups.map((group) => (

                        <tr
                          key={group.id}
                          className="border-b border-white/5"
                        >
                          <td className="p-3 text-xs font-medium">
                            {group.group_name}
                          </td>

                          <td className="p-3">

                            <span
                              className={`
                            rounded-full
                            px-2
                            py-1
                            text-[11px]
                            font-medium

                            ${group.approval_method === "ANY_ONE"
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-violet-500/15 text-violet-300"
                                }
                            `}
                            >

                              {group.approval_method === "ANY_ONE"
                              ? "Any One Approves"
                              : "All Must Approve"}

                            </span>

                          </td>

                          <td className="p-3">

                          <div className="relative">

                            <div className="flex flex-wrap gap-1 text-xs">

                              {group.members
                                ?.slice(0, 3)
                                .map((member, index) => (
                                  <span key={member.id}>
                                    {member.employee_name}
                                    {index < Math.min(group.members.length, 3) - 1 ? ", " : ""}
                                  </span>
                                ))}

                              {group.member_count > 3 && (
                                <span
                                  className="cursor-pointer text-cyan-300"
                                  onMouseEnter={() => setHoveredGroupId(group.id)}
                                  onMouseLeave={() => setHoveredGroupId(null)}
                                >
                                  , +{group.member_count - 3}
                                </span>
                              )}

                            </div>

                            {hoveredGroupId === group.id && (
                              <div
                                className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0B1735] p-3 shadow-2xl"
                                onMouseEnter={() => setHoveredGroupId(group.id)}
                                onMouseLeave={() => setHoveredGroupId(null)}
                              >
                                <p className="mb-2 text-xs font-semibold text-cyan-300">
                                  Approval Group Members
                                </p>

                                <div className="space-y-2">
                                  {group.members.map((member) => (
                                    <div
                                      key={member.id}
                                      className="rounded-lg border border-white/10 p-2"
                                    >
                                      <p className="text-sm font-medium text-white">
                                        {member.employee_name}
                                      </p>

                                      <p className="text-[11px] text-white/60">
                                        {member.department_name}
                                      </p>

                                      <p className="text-[11px] text-cyan-300">
                                        {member.designation_name}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>

                        </td>

                          <td className="p-3">

                            <span
                                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                                  group.is_active
                                    ? "bg-green-500/15 text-green-300"
                                    : "bg-red-500/15 text-red-300"
                                }`}
                              >
                              {group.is_active ? "Active" : "Inactive"}
                            </span>

                          </td>

                          <td className="p-3 text-xs">
                            {"0 Workflows"}
                          </td>

                          <td className="p-3 text-xs">
                            {new Date(group.updated_at)
                            .toLocaleDateString()}
                          </td>

                          <td className="p-3">

                            <div className="flex items-center gap-2">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/admin/administration/approval-groups/edit/${group.id}`
                                  )
                                }
                                className="
                              rounded-lg
                              border
                              border-white/10
                              bg-white/5
                              px-2
                              py-1
                              text-xs
                              text-white
                              "
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteGroupId(group.id)
                                }
                                className="
                              rounded-lg
                              border
                              border-red-500/30
                              bg-red-500/10
                              px-2
                              py-1
                              text-xs
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

                            </div>

              {filteredGroups.length > 0 && (

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">

                  <p className="text-xs text-white/60">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                    -
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredGroups.length
                    )}
                    {" "}of{" "}
                    {filteredGroups.length}
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage(currentPage - 1)
                      }
                      className="
                      rounded-lg
                      border
                      border-white/10
                      bg-white/5
                      px-3
                      py-1.5
                      text-xs
                      disabled:opacity-40
                      "
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => (

                        <button
                          key={index}
                          onClick={() =>
                            setCurrentPage(index + 1)
                          }
                          className={`
                          h-8
                          w-8
                          rounded-lg
                          text-xs
                          ${
                            currentPage === index + 1
                              ? "bg-cyan-500 text-black"
                              : "border border-white/10 bg-white/5 text-white"
                          }
                          `}
                        >
                          {index + 1}
                        </button>

                      )
                    )}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage(currentPage + 1)
                      }
                      className="
                      rounded-lg
                      border
                      border-white/10
                      bg-white/5
                      px-3
                      py-1.5
                      text-xs
                      disabled:opacity-40
                      "
                    >
                      Next
                    </button>

                  </div>

                </div>

              )}

            </div>

        </div>

      </section>

    </div>

    {deleteGroupId && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#08152F] p-6">

      <h3 className="text-lg font-semibold text-white">
        Delete Approval Group
      </h3>

      <p className="mt-2 text-sm text-white/70">
        Are you sure you want to delete this approval group?
      </p>

      <div className="mt-6 flex justify-end gap-2">

        <button
          onClick={() =>
            setDeleteGroupId(null)
          }
          className="rounded-xl border border-white/10 px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          disabled={deleteLoading}
          onClick={handleDelete}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white"
        >
          {deleteLoading
            ? "Deleting..."
            : "Delete"}
        </button>

      </div>

    </div>

  </div>

)}

      </main>
    </PermissionGuard >
  );
}