"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Building2, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";
import { useRBAC } from "@/hooks/use-rbac";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors";
const selectClass = "w-full rounded-xl border border-white/10 bg-[#0d1f40] px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition-colors";

const emptyForm = { code: "", name: "", contactPerson: "", mobile: "", email: "", website: "", country: "Bangladesh", city: "", logo: "", status: "Active" };

export default function CompaniesPage() {
  const { canCreate, canEdit, canDelete } = useRBAC("Company");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyForm, setCompanyForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try {
      const response = await apiClient.get("/companies/");
      setCompanies(response.data.map((item: any) => ({
        id: item.id, code: item.code, name: item.name,
        contactPerson: item.contact_person, mobile: item.mobile || "",
        email: item.email, website: item.website || "",
        country: item.country, city: item.city || "", logo: item.logo || "",
        status: item.is_active ? "Active" : "Inactive",
      })));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load companies.");
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactPerson || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredCompanies.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + recordsPerPage);

  const openEdit = (company: any) => {
    setEditingId(company.id);
    setCompanyForm({
      code: company.code, name: company.name, contactPerson: company.contactPerson,
      mobile: company.mobile, email: company.email, website: company.website,
      country: company.country || "Bangladesh", city: company.city,
      logo: company.logo, status: company.status,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setCompanyForm(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setCompanyForm(emptyForm);
  };

  const handleSave = async () => {
    if (!companyForm.code || !companyForm.name || !companyForm.contactPerson || !companyForm.email) {
      toast.error("Code, Name, Contact Person and Email are required.");
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await apiClient.put(`/companies/${editingId}`, {
          code: companyForm.code, name: companyForm.name,
          contact_person: companyForm.contactPerson, mobile: companyForm.mobile,
          email: companyForm.email, website: companyForm.website,
          country: companyForm.country, city: companyForm.city,
          logo: companyForm.logo, is_active: companyForm.status === "Active",
        });
        toast.success("Company updated successfully.");
      } else {
        await apiClient.post("/companies/", {
          code: companyForm.code, name: companyForm.name,
          contact_person: companyForm.contactPerson, mobile: companyForm.mobile,
          email: companyForm.email, website: companyForm.website,
          country: companyForm.country, city: companyForm.city, logo: companyForm.logo,
        });
        toast.success("Company created successfully.");
      }
      await loadCompanies();
      closeModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.detail || "Operation failed.");
      } else {
        toast.error("Operation failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/companies/${deleteId}`);
      await loadCompanies();
      toast.success("Company deleted successfully.");
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete company.");
    }
  };

  const field = (label: string, value: string, field: string, required = false, type = "text") => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => setCompanyForm({ ...companyForm, [field]: e.target.value })}
        className={inputClass}
      />
    </div>
  );

  return (
    <PermissionGuard permission="company:read">
      <main className="relative flex min-h-screen overflow-hidden bg-gradient-to-b from-[#030B1F] to-[#06153C] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.20),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.25),transparent_30%)]" />

        <div className="relative z-10 flex min-h-screen w-full">
          <Sidebar active="companies" />

          <section className="flex-1 flex flex-col">
            <Topbar title="Companies" subtitle="Manage organizational companies" />

            <div className="flex-1 p-5 space-y-4">

              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-cyan-300" />
                    <p className="text-xs text-white/60">Total Companies</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-cyan-300">{companies.length}</p>
                </div>
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                  <p className="text-xs text-white/60">Active</p>
                  <p className="mt-2 text-2xl font-bold text-green-300">{companies.filter((c) => c.status === "Active").length}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-xs text-white/60">Inactive</p>
                  <p className="mt-2 text-2xl font-bold text-red-300">{companies.filter((c) => c.status === "Inactive").length}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex w-[220px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <Search size={14} className="text-white/50" />
                  <input placeholder="Search company..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-white/40 text-white" />
                </div>

                <select value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-9 rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white appearance-none">
                  {["All", "Active", "Inactive"].map((s) => (
                    <option key={s} value={s} className="bg-[#17386E]">{s}</option>
                  ))}
                </select>

                <div className="ml-auto">
                  <ActionGuard permission="company:create">
                    <button onClick={openNew}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-black hover:opacity-90 transition-opacity">
                      <Plus size={13} /> New Company
                    </button>
                  </ActionGuard>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Code", "Company Name", "Contact Person", "Email", "Mobile", "Website", "Status", "Action"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wide ${i === 7 ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-white/40">No companies found</td>
                      </tr>
                    ) : paginatedCompanies.map((company) => (
                      <tr key={company.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-xs font-semibold text-cyan-300">{company.code}</td>
                        <td className="px-4 py-3 text-xs font-medium text-white">{company.name}</td>
                        <td className="px-4 py-3 text-xs text-white/70">{company.contactPerson}</td>
                        <td className="px-4 py-3 text-xs text-white/70">{company.email}</td>
                        <td className="px-4 py-3 text-xs text-white/70">{company.mobile || "-"}</td>
                        <td className="px-4 py-3 text-xs text-white/70">{company.website || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            company.status === "Active"
                              ? "bg-green-500/15 text-green-300 border border-green-400/30"
                              : "bg-red-500/15 text-red-300 border border-red-400/30"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {company.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <ActionGuard permission="company:update">
                              <button onClick={() => openEdit(company)}
                                className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                Edit
                              </button>
                            </ActionGuard>
                            <ActionGuard permission="company:delete">
                              <button onClick={() => setDeleteId(company.id)}
                                className="rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 transition-colors">
                                Delete
                              </button>
                            </ActionGuard>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                  <p className="text-xs text-white/40">
                    Showing {Math.min(startIndex + 1, filteredCompanies.length)}–{Math.min(startIndex + recordsPerPage, filteredCompanies.length)} of {filteredCompanies.length}
                  </p>
                  <div className="flex gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 disabled:opacity-30">← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 rounded-lg text-xs font-medium ${currentPage === page ? "bg-cyan-500 text-black" : "border border-white/10 bg-white/5 text-white/60"}`}>
                        {page}
                      </button>
                    ))}
                    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-7 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 disabled:opacity-30">Next →</button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{editingId ? "Update Company" : "New Company"}</h2>
                  <p className="text-xs text-white/40">{editingId ? "Update company information" : "Fill in company details"}</p>
                </div>
                <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
                  <X size={14} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {field("Company Code", companyForm.code, "code", true)}
                {field("Company Name", companyForm.name, "name", true)}
                {field("Contact Person", companyForm.contactPerson, "contactPerson", true)}
                {field("Official Email", companyForm.email, "email", true, "email")}
                {field("Mobile Number", companyForm.mobile, "mobile")}
                {field("Website", companyForm.website, "website")}
                {field("Country", companyForm.country, "country")}
                {field("City", companyForm.city, "city")}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Status</label>
                  <select value={companyForm.status}
                    onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
                    className={selectClass}>
                    <option value="Active" className="bg-[#0d1f40]">Active</option>
                    <option value="Inactive" className="bg-[#0d1f40]">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-black hover:bg-cyan-400 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update Company" : "Save Company"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-[#0d1f40] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <div className="mb-1 text-2xl">🗑️</div>
              <h2 className="text-base font-bold text-white">Delete Company</h2>
              <p className="mt-2 text-sm text-white/60">Are you sure you want to delete this company?</p>
              <p className="mt-1 text-xs text-red-300">This action cannot be undone.</p>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setDeleteId(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PermissionGuard>
  );
}