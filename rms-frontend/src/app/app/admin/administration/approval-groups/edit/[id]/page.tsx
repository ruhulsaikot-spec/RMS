"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, Users, X, UserPlus, Check } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { approvalGroupService } from "@/services/approval-group.service";
import { employeeService } from "@/services/employee.service";

type Employee = {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  mobile: string;
  department_id: string;
  designation_id: string;
  department?: { id: string; name: string };
  designation?: { id: string; name: string };
  is_active: boolean;
};

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors";
const selectClass = "w-full rounded-xl border border-white/10 bg-[#0d1f40] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

export default function EditApprovalGroupPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [members, setMembers] = useState<{ id: string; employeeId?: string; employee: string; designation: string; department: string; primary: boolean; sequence?: number }[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [approvalMethod, setApprovalMethod] = useState("ANY_ONE");
  const [groupStatus, setGroupStatus] = useState("Active");
  const [description, setDescription] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);

  const filteredEmployees = employeeSearch.trim()
    ? employeeOptions.filter((e) => {
        const kw = employeeSearch.toLowerCase();
        return e.employee_id.toLowerCase().includes(kw) || e.name.toLowerCase().includes(kw);
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
      const group = await approvalGroupService.getApprovalGroup(id);
      setGroupName(group.group_name);
      setApprovalMethod(group.approval_method);
      setGroupStatus(group.is_active ? "Active" : "Inactive");
      setDescription(group.description ?? "");
      setMembers(group.members.map((member: any) => ({
        id: member.id,
        employeeId: member.employee_id,
        employee: member.employee_name,
        designation: member.designation_name,
        department: member.department_name,
        primary: member.is_primary,
        sequence: member.sequence,
      })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load approval group.");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      setEmployeeOptions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load employees.");
    }
  };

  const handleAddMember = () => {
    if (selectedEmployees.length === 0) { toast.error("Please select at least one employee."); return; }
    const newMembers = selectedEmployees
      .map((eid) => employeeOptions.find((x) => x.id === eid))
      .filter(Boolean)
      .filter((e: any) => !members.some((m: any) => m.id === e.id))
      .map((e: any, idx: number) => ({
        id: e.id, employeeId: e.id, employee: e.name,
        designation: e.designation?.name || "-",
        department: e.department?.name || "-",
        primary: false, sequence: members.length + idx + 1,
      }));
    if (newMembers.length === 0) { toast.error("Selected employees already exist."); return; }
    setMembers((prev) => [...prev, ...newMembers]);
    toast.success(`${newMembers.length} member(s) added.`);
    setSelectedEmployees([]);
    setEmployeeSearch("");
    setShowMemberModal(false);
  };

  const handleSave = async () => {
    if (!groupName.trim()) { toast.error("Group name is required."); return; }
    if (members.length === 0) { toast.error("Please add at least one member."); return; }
    try {
      setSaving(true);
      const payload = {
        group_name: groupName,
        description,
        approval_method: approvalMethod,
        is_active: groupStatus === "Active",
        members: members.map((m: any, idx: number) => ({
          id: m.id,
          employee_id: m.employeeId ?? m.employee_id,
          sequence: m.sequence ?? idx + 1,
          is_primary: m.primary,
        })),
      };
      await approvalGroupService.updateApprovalGroup(id, payload);
      toast.success("Approval group updated successfully.");
      router.push("/admin/administration/approval-groups");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update approval group.");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: "Group Info" },
    { num: 2, label: "Members" },
    { num: 3, label: "Review" },
  ];

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <p className="text-sm text-white/40">Loading...</p>
      </main>
    );
  }

  return (
    <PermissionGuard permission="approval_group:update">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="approval-groups" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Edit Approval Group" subtitle="Modify approval group information and members" />

            <div className="flex-1 p-5">
              <div className="mx-auto max-w-3xl space-y-5">

                {/* Step Indicator */}
                <div className="flex items-center gap-2">
                  {steps.map((step, idx) => (
                    <div key={step.num} className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        currentStep > step.num
                          ? "bg-green-500 text-white"
                          : currentStep === step.num
                          ? "bg-cyan-500 text-black"
                          : "bg-white/10 text-white/40"
                      }`}>
                        {currentStep > step.num ? <Check size={14} /> : step.num}
                      </div>
                      <span className={`text-xs font-medium ${currentStep === step.num ? "text-cyan-300" : "text-white/40"}`}>
                        {step.label}
                      </span>
                      {idx < steps.length - 1 && (
                        <div className={`mx-2 h-px w-12 ${currentStep > step.num ? "bg-green-500/50" : "bg-white/10"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1 — Group Info */}
                {currentStep === 1 && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/15">
                        <Users size={16} className="text-cyan-300" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Group Information</h3>
                        <p className="text-xs text-white/40">Update approval group details</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">Group Name <span className="text-red-400">*</span></label>
                        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                          placeholder="e.g. Finance Approvers" className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">Approval Method</label>
                        <select value={approvalMethod} onChange={(e) => setApprovalMethod(e.target.value)} className={selectClass}>
                          <option value="ANY_ONE" className="bg-[#0d1f40]">Any One Approves</option>
                          <option value="ALL" className="bg-[#0d1f40]">All Must Approve</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">Status</label>
                        <select value={groupStatus} onChange={(e) => setGroupStatus(e.target.value)} className={selectClass}>
                          <option value="Active" className="bg-[#0d1f40]">Active</option>
                          <option value="Inactive" className="bg-[#0d1f40]">Inactive</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium text-white/60">Description</label>
                        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brief description..."
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors resize-none" />
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <button onClick={() => router.push("/admin/administration/approval-groups")}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                        Cancel
                      </button>
                      <button onClick={() => { if (!groupName.trim()) { toast.error("Group name is required."); return; } setCurrentStep(2); }}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 — Members */}
                {currentStep === 2 && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/15">
                          <UserPlus size={16} className="text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Group Members</h3>
                          <p className="text-xs text-white/40">{members.length} member(s)</p>
                        </div>
                      </div>
                      <button onClick={() => setShowMemberModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/25 transition-colors">
                        <Plus size={12} /> Add Member
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.03]">
                            {["Employee", "Designation", "Department", ""].map((h, i) => (
                              <th key={i} className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {members.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-10 text-center">
                                <p className="text-xs text-white/40">No members added yet</p>
                                <button onClick={() => setShowMemberModal(true)}
                                  className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">+ Add member</button>
                              </td>
                            </tr>
                          ) : members.map((member) => (
                            <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="px-4 py-2.5 text-xs font-medium text-white">{member.employee}</td>
                              <td className="px-4 py-2.5 text-xs text-white/60">{member.designation}</td>
                              <td className="px-4 py-2.5 text-xs text-white/60">{member.department}</td>
                              <td className="px-4 py-2.5 text-right">
                                <button onClick={() => setMembers(members.filter((x) => x.id !== member.id))}
                                  className="rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300 hover:bg-red-500/20 transition-colors">
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <button onClick={() => setCurrentStep(1)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                        ← Back
                      </button>
                      <button onClick={() => { if (members.length === 0) { toast.error("Please add at least one member."); return; } setCurrentStep(3); }}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Review */}
                {currentStep === 3 && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-white">Review & Save</h3>
                      <p className="text-xs text-white/40">Review changes before saving</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Group Name</p>
                        <p className="mt-1 text-xs font-semibold text-cyan-300">{groupName}</p>
                      </div>
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Method</p>
                        <p className="mt-1 text-xs font-semibold text-blue-300">{approvalMethod === "ANY_ONE" ? "Any One Approves" : "All Must Approve"}</p>
                      </div>
                      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Members</p>
                        <p className="mt-1 text-xs font-semibold text-green-300">{members.length}</p>
                      </div>
                    </div>

                    {description && (
                      <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-[10px] text-white/50 uppercase tracking-wide">Description</p>
                        <p className="mt-1 text-xs text-white/70">{description}</p>
                      </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.03]">
                            {["#", "Employee", "Designation", "Department"].map((h, i) => (
                              <th key={i} className="px-4 py-2.5 text-left text-[10px] font-semibold text-white/50 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, idx) => (
                            <tr key={member.id} className="border-b border-white/5">
                              <td className="px-4 py-2.5 text-[10px] text-white/30">{idx + 1}</td>
                              <td className="px-4 py-2.5 text-xs font-medium text-white">{member.employee}</td>
                              <td className="px-4 py-2.5 text-xs text-white/60">{member.designation}</td>
                              <td className="px-4 py-2.5 text-xs text-white/60">{member.department}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <button onClick={() => setCurrentStep(2)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                        ← Back
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity disabled:opacity-50">
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>
        </div>

        {/* Add Member Modal */}
        {showMemberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Add Members</h3>
                  <p className="text-xs text-white/40">Search and select employees</p>
                </div>
                <button onClick={() => { setShowMemberModal(false); setEmployeeSearch(""); setSelectedEmployees([]); }}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={12} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input type="text" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)}
                  placeholder="Search by Employee ID or Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors" />
              </div>

              {selectedEmployees.length > 0 && (
                <div className="mb-2 text-[10px] text-cyan-300">{selectedEmployees.length} selected</div>
              )}

              <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10">
                {filteredEmployees.length === 0 ? (
                  <div className="flex h-24 items-center justify-center text-xs text-white/40">
                    {employeeSearch ? "No employees found" : "Start typing to search"}
                  </div>
                ) : filteredEmployees.map((employee) => (
                  <label key={employee.id} className="flex cursor-pointer items-center gap-3 border-b border-white/5 p-3 hover:bg-white/5 transition-colors">
                    <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
                      selectedEmployees.includes(employee.id)
                        ? "border-cyan-500 bg-cyan-500 text-black"
                        : "border-white/20 bg-white/5"
                    }`}>
                      {selectedEmployees.includes(employee.id) && <Check size={10} strokeWidth={3} />}
                    </div>
                    <input type="checkbox" checked={selectedEmployees.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedEmployees([...selectedEmployees, employee.id]);
                        else setSelectedEmployees(selectedEmployees.filter((eid) => eid !== employee.id));
                      }}
                      className="hidden" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{employee.employee_id} — {employee.name}</div>
                      <div className="text-[10px] text-white/50">{employee.department?.name} · {employee.designation?.name}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setShowMemberModal(false); setEmployeeSearch(""); setSelectedEmployees([]); }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddMember}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors">
                  Add {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ""} Members
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}
