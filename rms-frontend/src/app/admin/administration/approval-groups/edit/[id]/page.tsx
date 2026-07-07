"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";

import { approvalGroupService } from "@/services/approval-group.service";
import { employeeService } from "@/services/employee.service";

export default function EditApprovalGroupPage() {

  const router = useRouter();

  const { id } = useParams<{
    id: string;
  }>();

  const [loading, setLoading] =
    useState(true);

  const [currentStep, setCurrentStep] =
    useState(1);

  const [showMemberModal, setShowMemberModal] =
    useState(false);

  const [members, setMembers] =
  useState<
    {
      id: string;
      employeeId?: string;
      employee: string;
      designation: string;
      department: string;
      primary: boolean;
      backupApprover: string;
      sequence?: number;
    }[]
  >([
      {
        id: "1",
        employee: "Rahim Uddin",
        designation: "Admin Manager",
        department: "Administration",
        primary: true,
        backupApprover: "",
      },
      {
        id: "2",
        employee: "Karim Hasan",
        designation: "HR Manager",
        department: "Human Resource",
        primary: false,
        backupApprover: "",
      },
    ]);

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [employeeSearch, setEmployeeSearch] =
    useState("");

  const [selectedEmployees, setSelectedEmployees] =
    useState<string[]>([]);

  const [groupName, setGroupName] =
    useState("Finance Approval Group");

  const [approvalMethod, setApprovalMethod] =
    useState("Any One Approves");

  const [groupStatus, setGroupStatus] =
    useState("Active");

  const [description, setDescription] =
    useState(
      "Finance department reimbursement approval workflow."
    );

  type Employee = {
    id: string;
    employee_id: string;
    name: string;
    email: string;
    mobile: string;

    department_id: string;
    designation_id: string;

    department?: {
      id: string;
      name: string;
    };

    designation?: {
      id: string;
      name: string;
    };

    is_active: boolean;
  };

  const [employeeOptions, setEmployeeOptions] =
    useState<Employee[]>([]);

  const filteredEmployees =
    employeeSearch.trim()
      ? employeeOptions.filter((employee) => {

        const keyword =
          employeeSearch.toLowerCase();

        return (
          employee.employee_id
            .toLowerCase()
            .includes(keyword) ||

          employee.name
            .toLowerCase()
            .includes(keyword)
        );

      })
      : [];

  useEffect(() => {

    loadEmployees();

    if (!id) return;

    loadApprovalGroup();

  }, [id]);

  const loadApprovalGroup = async () => {

    try {

      setLoading(true);

      const group =
        await approvalGroupService.getApprovalGroup(
          id
        );

      setGroupName(
        group.group_name
      );

      setApprovalMethod(
        group.approval_method
      );

      setGroupStatus(
        group.is_active
          ? "Active"
          : "Inactive"
      );

      setDescription(
        group.description ?? ""
      );

      setMembers(

        group.members.map(
          (member: any) => ({

            id: member.id,

            employeeId: member.employee_id,

            employee: member.employee_name,

            designation:
              member.designation_name,

            department:
              member.department_name,

            primary:
              member.is_primary,

            backupApprover: "",

          })
        )

      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load approval group."
      );

    } finally {

      setLoading(false);

    }

  };

  const loadEmployees = async () => {
    
    try {

      const response =
        await employeeService.getEmployees();

      setEmployeeOptions(
        Array.isArray(response)
          ? response
          : []
      );

    } catch (error) {

      console.error(error);

      toast.error(
        "Failed to load employees."
      );

    }

  };

  const handleAddMember = () => {

    if (selectedEmployees.length === 0) {

      toast.error(
        "Please select at least one employee."
      );

      return;
    }

    const newMembers = selectedEmployees
      .map((employeeId) =>
        employeeOptions.find(
          (x) => x.id === employeeId
        )
      )
      .filter(Boolean)
      .filter(
        (employee: any) =>
          !members.some(
            (member: any) => member.id === employee.id
          )
      )
      .map((employee: any) => ({
        id: employee.id,
        employeeId: employee.id,
        employee: employee.name,
        designation: employee.designation?.name || "-",
        department: employee.department?.name || "-",
        primary: false,
        sequence: 0,
      }));

    if (newMembers.length === 0) {

      toast.error(
        "Selected employees already exist."
      );

      return;
    }

    setMembers((prev: any) => [
      ...prev,
      ...newMembers.map((m: any, index: number) => ({
        ...m,
        sequence: prev.length + index + 1,
      })),
    ]);

    toast.success(
      `${newMembers.length} member(s) added successfully.`
    );

    setSelectedEmployees([]);

    setEmployeeSearch("");

    setShowMemberModal(false);

  };

  return (

    <PermissionGuard
      permission="approval_group:update"
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
              title="Edit Approval Group"
              subtitle="Modify approval group information and members"
            />

            <div className="p-4">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

                <div className="grid gap-3 md:grid-cols-3">

                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                    <p className="text-[11px] text-white/60">
                      Step 1
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-cyan-300">
                      Group Info
                    </h3>
                  </div>

                  <div
                    className={`rounded-2xl p-3 ${currentStep === 2
                        ? "border border-cyan-500/30 bg-cyan-500/10"
                        : "border border-white/10 bg-white/5"
                      }`}
                  >
                    <p className="text-[11px] text-white/60">
                      Step 2
                    </p>

                    <h3
                      className={`mt-1 text-sm font-semibold ${currentStep === 2
                          ? "text-cyan-300"
                          : ""
                        }`}
                    >
                      Members
                    </h3>
                  </div>

                  <div
                    className={`rounded-2xl p-3 ${currentStep === 3
                        ? "border border-cyan-500/30 bg-cyan-500/10"
                        : "border border-white/10 bg-white/5"
                      }`}
                  >

                    <p className="text-[11px] text-white/60">
                      Step 3
                    </p>

                    <h3
                      className={`mt-1 text-sm font-semibold ${currentStep === 3
                          ? "text-cyan-300"
                          : ""
                        }`}
                    >
                      Review & Save
                    </h3>

                  </div>

                </div>

                {currentStep === 1 && (

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <h3 className="text-base font-semibold text-cyan-300">
                      Approval Group Information
                    </h3>

                    <p className="mt-1 text-xs text-white/60">
                      Configure approval group master information.
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-xs font-medium text-white/80">
                          Group Name *
                        </label>

                        <input
                          type="text"
                          value={groupName}
                          onChange={(e) =>
                            setGroupName(e.target.value)
                          }
                          placeholder="Enter approval group name"
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
                          Group Code
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
                          value={groupStatus}
                          onChange={(e) =>
                            setGroupStatus(
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
                          <option className="bg-[#17386E]">
                            Active
                          </option>

                          <option className="bg-[#17386E]">
                            Inactive
                          </option>
                        </select>
                      </div>

                      <div>
                  <label className="mb-2 block text-xs font-medium text-white/80">
                    Approval Method
                  </label>

                  <select
                    value={approvalMethod}
                    onChange={(e) =>
                      setApprovalMethod(e.target.value)
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
                      value="Any One Approves"
                      className="bg-[#17386E]"
                    >
                      Any One Approves
                    </option>

                    <option
                      value="All Must Approve"
                      className="bg-[#17386E]"
                    >
                      All Must Approve
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
                        value={description}
                        onChange={(e) =>
                          setDescription(
                            e.target.value
                          )
                        }
                        placeholder="Approval group description"
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

                  </div>
                )}


                {currentStep === 2 && (


                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="text-base font-semibold text-cyan-300">
                          Group Members
                        </h3>

                        <p className="mt-1 text-xs text-white/60">
                          Add employees who can approve workflow requests.
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          setShowMemberModal(true)
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
                        + Add Member
                      </button>

                    </div>

                    <div className="mt-5 overflow-x-auto">

                      <table className="w-full">

                        <thead>

                          <tr className="border-b border-white/10">

                            <th className="p-3 text-left text-xs">
                              Employee
                            </th>

                            <th className="p-3 text-left text-xs">
                              Designation
                            </th>

                            <th className="p-3 text-left text-xs">
                              Department
                            </th>

                            <th className="p-3 text-left text-xs">
                              Action
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {members.length === 0 ? (

                            <tr>

                              <td
                                colSpan={7}
                                className="py-12 text-center"
                              >
                                <h4 className="text-sm font-semibold text-cyan-300">
                                  No Members Added
                                </h4>

                                <p className="mt-2 text-xs text-white/60">
                                  Add one or more employees to this approval group.
                                </p>

                              </td>

                            </tr>

                          ) : (

                            members.map((member) => (

                              <tr
                                key={member.id}
                                className="border-b border-white/5"
                              >

                                <td className="p-3 text-xs">
                                  {member.employee}
                                </td>

                                <td className="p-3 text-xs">
                                  {member.designation}
                                </td>

                                <td className="p-3 text-xs">
                                  {member.department}
                                </td>

                                <td className="p-3">

                                  <button
                                    onClick={async () => {

                                      try {

                                        if (member.id) {

                                          await approvalGroupService.removeMember(
                                            member.id
                                          );

                                        }

                                        setMembers((prev: any) =>
                                          prev.filter(
                                            (x: any) => x.id !== member.id
                                          )
                                        );

                                        toast.success(
                                          "Member removed successfully."
                                        );

                                      } catch (error) {

                                        console.error(error);

                                        toast.error(
                                          "Failed to remove member."
                                        );

                                      }

                                    }}
                                    className="text-red-300 text-xs"
                                  >
                                    Remove
                                  </button>

                                </td>

                              </tr>

                            ))

                          )}

                        </tbody>

                      </table>

                    </div>

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

                          if (members.length === 0) {

                            toast.error(
                              "Please add at least one approval member."
                            );

                            return;
                          }

                          const hasPrimary =
                            members.some(
                              (member) =>
                                member.primary
                            );
                          
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

                {currentStep === 3 && (

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">

                    <h3 className="text-base font-semibold text-cyan-300">
                      Review Approval Group
                    </h3>

                    <p className="mt-1 text-xs text-white/60">
                      Review information before creating the approval group.
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">

                      <div>

                          <p className="text-[11px] text-white/50">
                            Group Name
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {groupName || "-"}
                          </p>

                        </div>

                        <div>

                          <p className="text-[11px] text-white/50">
                            Approval Method
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {approvalMethod}
                          </p>

                        </div>

                        <div>

                          <p className="text-[11px] text-white/50">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {groupStatus}
                          </p>

                        </div>

                    </div>

                    <div className="mt-5">

                      <p className="text-[11px] text-white/50">
                        Description
                      </p>

                      <p className="mt-1 text-sm">
                        {description || "-"}
                      </p>

                    </div>

                    <div className="mt-5">

                      <p className="text-[11px] text-white/50">
                        Total Members
                      </p>


                      <p className="mt-1 text-sm font-medium">
                        {members.length}
                      </p>

                    </div>

                    <div className="mt-6">

                      <h4 className="text-sm font-semibold text-cyan-300">
                        Approval Members
                      </h4>

                      <div className="mt-3 overflow-x-auto">

                        <table className="w-full">

                          <thead>

                            <tr className="border-b border-white/10">

                              <th className="p-3 text-left text-xs">
                                Employee
                              </th>

                              <th className="p-3 text-left text-xs">
                                Designation
                              </th>

                              <th className="p-3 text-left text-xs">
                                Department
                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {members.map((member) => (

                              <tr
                                key={member.id}
                                className="border-b border-white/5"
                              >

                                <td className="p-3 text-xs">
                                  {member.employee}
                                </td>

                                <td className="p-3 text-xs">
                                  {member.designation}
                                </td>

                                <td className="p-3 text-xs">
                                  {member.department}
                                </td>

                              </tr>

                            ))}

                          </tbody>

                        </table>

                      </div>

                    </div>

                    <div className="mt-6 flex justify-end gap-2">

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
                        onClick={async () => {

                          if (!groupName.trim()) {
                            toast.error("Approval group name is required.");
                            return;
                          }

                          if (members.length === 0) {
                            toast.error("Please add at least one approval member.");
                            return;
                          }

                          try {

                            const payload = {
                              group_name: groupName,
                              description,
                              approval_method: approvalMethod,
                              is_active: groupStatus === "Active",
                              members: members.map((member: any, index: number) => ({

                                id: member.id,

                                employee_id:
                                  member.employeeId ?? member.employee_id,

                                sequence:
                                  member.sequence ?? index + 1,

                                is_primary:
                                  member.primary,

                              })),
                            };

                            await approvalGroupService.updateApprovalGroup(
                              id,
                              payload
                            );

                            toast.success("Approval group updated successfully.");

                            router.push(
                              "/admin/administration/approval-groups"
                            );

                          } catch (error) {

                            console.error(error);

                            toast.error("Failed to update approval group.");

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
                        Save Changes
                      </button>

                    </div>

                  </div>

                )}

                {currentStep === 1 && (

                  <div className="mt-5 flex justify-end gap-2">

                  <button
                    onClick={() =>
                      router.push(
                        "/admin/administration/approval-groups"
                      )
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
                      onClick={() => {

                        if (!groupName.trim()) {

                          toast.error(
                            "Approval group name is required."
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
                )}

              </div>

            </div>

          </section>

        </div>

        {showMemberModal && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#08152F] p-5 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h3 className="text-base font-semibold text-cyan-300">
                    Add Members
                  </h3>

                  <p className="mt-1 text-xs text-white/60">
                    Search and select one or multiple employees.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowMemberModal(false)
                  }
                  className="text-xl text-white/60 hover:text-white"
                >
                  ×
                </button>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-medium text-white/80">
                    Employee *
                  </label>

                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(e) =>
                        setEmployeeSearch(e.target.value)
                      }
                      placeholder="Search Employee ID or Name"
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

                    {employeeSearch.trim() && (

                      <div
                        className="
      mt-2
      max-h-64
      overflow-y-auto
      rounded-xl
      border
      border-white/10
      bg-[#0B1E44]
      "
                      >

                        {filteredEmployees.length === 0 ? (

                          <div className="p-3 text-xs text-white/60">
                            No employee found.
                          </div>

                        ) : (

                          filteredEmployees.map((employee) => {

                            const checked =
                              selectedEmployees.includes(employee.id);

                            return (

                              <label
                                key={employee.id}
                                className="
              flex
              cursor-pointer
              items-center
              gap-3
              border-b
              border-white/5
              p-3
              hover:bg-white/5
              "
                              >

                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {

                                    if (e.target.checked) {

                                      setSelectedEmployees((prev) => [
                                        ...prev,
                                        employee.id,
                                      ]);

                                    } else {

                                      setSelectedEmployees((prev) =>
                                        prev.filter(
                                          (id) => id !== employee.id
                                        )
                                      );

                                    }

                                  }}
                                />

                                <div>

                                  <p className="text-xs font-medium text-white">
                                    {employee.employee_id} - {employee.name}
                                  </p>

                                  <p className="text-[11px] text-white/60">
                                    {employee.designation?.name} • {employee.department?.name}
                                  </p>

                                </div>

                              </label>

                            );

                          })

                        )}

                      </div>

                    )}

                  </div>

                </div>

                <div className="mt-5 flex justify-end gap-2">

                  <button
                    onClick={() =>
                      setShowMemberModal(false)
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
                    onClick={handleAddMember}
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
                    Add Member
                  </button>

                </div>

              </div>

            </div>

)}

          </main>
</PermissionGuard>

  );
}
