"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";
import { useRBAC } from "@/hooks/use-rbac";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

export default function CompaniesPage() {

    const {
      canCreate,
      canEdit,
      canDelete,
    } = useRBAC("Company");

    const [showModal, setShowModal] = useState(false);

const [editingId, setEditingId] =
  useState<number | null>(null);

const [deleteId, setDeleteId] =
  useState<number | null>(null);

const [companies, setCompanies] =
useState<any[]>([]);

const [companyForm, setCompanyForm] = useState({
  code: "",
  name: "",
  contactPerson: "",
  mobile: "",
  email: "",
  website: "",
  country: "Bangladesh",
  city: "",
  logo: "",
  status: "Active",
});

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] =
  useState("All");

const [currentPage, setCurrentPage] =
  useState(1);

const loadCompanies = async () => {

  try {

    const response =
      await apiClient.get(
        "/companies/"
      );

    const companiesData =
      response.data.map(
        (item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          contactPerson:
            item.contact_person,
          mobile:
            item.mobile || "",
          email:
            item.email,
          website:
            item.website || "",
          country:
            item.country,
          city:
            item.city || "",
          logo:
            item.logo || "",
          references: 0,
          status:
            item.is_active
              ? "Active"
              : "Inactive",
        })
      );

    setCompanies(
      companiesData
    );

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to load companies."
    );
  }
};

useEffect(() => {
  loadCompanies();
}, []);

const recordsPerPage = 10;

const filteredCompanies =
  companies.filter((company) => {

    const matchesSearch =
      company.code
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      company.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      company.contactPerson
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      company.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

const totalPages = Math.ceil(
  filteredCompanies.length /
  recordsPerPage
);

const startIndex =
  (currentPage - 1) *
  recordsPerPage;

const paginatedCompanies =
  filteredCompanies.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  return (
  <PermissionGuard
    permission="company:read"
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

        <Sidebar active="companies" />

        <section className="flex-1">

          <Topbar
            title="Companies"
            subtitle="Manage organizational companies"
          />

          <div className="p-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

              <div className="mb-4 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] text-white/60">
                    Total Companies
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {companies.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] text-white/60">
                    Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                    {
                        companies.filter(
                        (d) => d.status === "Active"
                        ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] text-white/60">
                    Inactive
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-red-300">
                    {
                        companies.filter(
                        (d) => d.status === "Inactive"
                        ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[11px] text-white/60">
                    References
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {companies.reduce(
                        (sum, item) => sum + item.references,
                        0
                    )}
                    </h3>
                </div>

                </div>

                <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <input
                    placeholder="Search company..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="
                    h-9
                    w-[220px]
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    text-xs
                    text-white
                    "
                    />

                    <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="
                    h-9
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    text-xs
                    text-white
                    "
                    >
                    <option
                        value="All"
                        className="bg-[#102E67] text-white"
                    >
                        All
                    </option>

                    <option
                        value="Active"
                        className="bg-[#102E67] text-white"
                    >
                        Active
                    </option>

                    <option
                        value="Inactive"
                        className="bg-[#102E67] text-white"
                    >
                        Inactive
                    </option>
                    </select>

                </div>

                <ActionGuard
                permission="company:create"
                >
                    <button
                        onClick={() => {

                        setEditingId(null);

                        setCompanyForm({
                        code: "",
                        name: "",
                        contactPerson: "",
                        mobile: "",
                        email: "",
                        website: "",
                        country: "Bangladesh",
                        city: "",
                        logo: "",
                        status: "Active",
                    });

                    setShowModal(true);
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
                    + New Company
                </button>
                </ActionGuard>

                </div>

            </div>

            <div
                className="
                mt-4
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                "
            >

            <table className="w-full">

                <thead>

                <tr className="border-b border-white/10 bg-white/[0.04]">

                    <th className="p-3 text-left text-xs">
                    Company Code
                    </th>

                    <th className="p-3 text-left text-xs">
                    Company Name
                    </th>

                    <th className="p-3 text-left text-xs">
                    Contact Person
                    </th>

                    <th className="p-3 text-left text-xs">
                    Official Email
                    </th>

                    <th className="p-3 text-left text-xs">
                    Mobile
                    </th>

                    <th className="p-3 text-left text-xs">
                    Website
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

                {paginatedCompanies.map((company) => (

                    <tr
                    key={company.id}
                    className="border-b border-white/5"
                    >

                    <td className="p-3 text-xs">
                        {company.code}
                    </td>

                    <td className="p-3 text-xs">
                        {company.name}
                    </td>

                    <td className="p-3 text-xs">
                        {company.contactPerson}
                    </td>

                    <td className="p-3 text-xs">
                        {company.email}
                    </td>

                    <td className="p-3 text-xs">
                        {company.mobile}
                    </td>

                    <td className="p-3 text-xs">
                        {company.website}
                    </td>
                    
                    <td
                        className={`p-3 text-xs ${
                        company.status === "Active"
                            ? "text-green-300"
                            : "text-red-300"
                        }`}
                    >
                        {company.status}
                    </td>

                    <td className="p-3 flex gap-3">

                        <ActionGuard
                          permission="company:update"

                        >
                        <button
                            onClick={() => {

                                setEditingId(company.id);

                            setCompanyForm({
                            code: company.code,
                            name: company.name,
                            contactPerson:
                                company.contactPerson,
                            mobile:
                                company.mobile || "",
                            email:
                                company.email,
                            website:
                                company.website || "",
                            country:
                                company.country || "Bangladesh",
                            city:
                                company.city || "",
                            logo:
                                company.logo || "",
                            status:
                                company.status,
                        });

                            setShowModal(true);

                        }}
                        className="
                        text-cyan-300
                        text-xs
                        "
                        >
                        Edit
                        </button>
                        </ActionGuard>

                        <ActionGuard
                              permission="company:delete"

                            >
                            <button
                                onClick={async () => {

                                    if (company.references > 0) {

                            toast.error(
                                "Company cannot be deleted because it is assigned in the system."
                            );

                            return;
                            }

                            setDeleteId(company.id);

                        }}
                        className="
                        text-red-300
                        text-xs
                        "
                        >
                        Delete
                        </button>
                        </ActionGuard>

                    </td>

                    </tr>

                ))}

                </tbody>

            </table>

            <div className="mt-4 flex items-center justify-between px-3 pb-3">

            <p className="text-xs text-white/60">
                Showing {startIndex + 1} -
                {Math.min(
                    startIndex + recordsPerPage,
                    filteredCompanies.length
                )} of {filteredCompanies.length}
            </p>

            <div className="flex items-center gap-1">

                <button
                disabled={currentPage === 1}
                onClick={() =>
                    setCurrentPage(currentPage - 1)
                }
                className="
                h-8
                px-3
                rounded-lg
                border
                border-white/10
                bg-white/[0.04]
                text-xs
                disabled:opacity-40
                "
                >
                Previous
                </button>

                {Array.from(
                { length: totalPages },
                (_, i) => (
                    <button
                    key={i}
                    onClick={() =>
                        setCurrentPage(i + 1)
                    }
                    className={`
                    h-8
                    min-w-[32px]
                    rounded-lg
                    text-xs
                    ${
                        currentPage === i + 1
                        ? "bg-cyan-500 text-black"
                        : "bg-white/[0.04]"
                    }
                    `}
                    >
                    {i + 1}
                    </button>
                )
                )}

                <button
                disabled={currentPage === totalPages}
                onClick={() =>
                    setCurrentPage(currentPage + 1)
                }
                className="
                h-8
                px-3
                rounded-lg
                border
                border-white/10
                bg-white/[0.04]
                text-xs
                disabled:opacity-40
                "
                >
                Next
                </button>

            </div>

        </div>

            </div>

          </div>

          {showModal && (

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
                max-w-4xl
                rounded-3xl
                border
                border-white/10
                bg-[#102E67]
                p-5
                shadow-[0_25px_50px_rgba(0,0,0,0.45)]
                "
                >

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold">
                    {editingId
                        ? "Update Company"
                        : "Create Company"}
                    </h2>

                    <button
                    onClick={() => {
                        setEditingId(null);
                        setShowModal(false);
                    }}
                    className="text-white/60"
                    >
                    ✕
                    </button>

                </div>

                <div
                    className="
                    grid
                    gap-4
                    md:grid-cols-2
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/10
                    p-4
                    "
                    >

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Company Code *
                        </label>

                        <input
                        value={companyForm.code}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                code: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Company Name *
                        </label>

                        <input
                        value={companyForm.name}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                name: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Contact Person *
                        </label>

                        <input
                        value={companyForm.contactPerson}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                contactPerson: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Mobile Number
                        </label>

                        <input
                        value={companyForm.mobile}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                mobile: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Official Email *
                        </label>

                        <input
                        type="email"
                        value={companyForm.email}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                email: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Website
                        </label>

                        <input
                        value={companyForm.website}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                website: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Country
                        </label>

                        <input
                        value={companyForm.country}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                country: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            City
                        </label>

                        <input
                        value={companyForm.city}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                city: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-3
                        py-2
                        text-xs
                        "
                        />
                    </div>

                    <div>
                    <div>

                    <label className="mb-2 block text-xs text-white/60">
                    Company Logo
                    </label>

                    <div className="flex items-start gap-4">

                        <div className="flex-1">

                            <input
                            type="file"
                            accept="image/*"
                            className="
                            w-full
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            px-3
                            py-2
                            text-xs
                            "
                            />

                            <p className="mt-1 text-[10px] text-white/40">
                                PNG, JPG, SVG
                            </p>

                        </div>

                        <div
                        className="
                        flex
                        h-20
                        w-40
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-dashed
                        border-white/20
                        bg-white/[0.04]
                        text-[10px]
                        text-white/40
                        "
                        >
                        Logo Preview
                        </div>

                    </div>

                    </div>
                    

                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Status
                        </label>

                        <select
                        value={companyForm.status}
                        onChange={(e) =>
                            setCompanyForm({
                                ...companyForm,
                                status: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-[#35538F]
                        px-3
                        py-2
                        text-xs
                        "
                        >
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>

                                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                        <button
                        onClick={() => {
                            setEditingId(null);

                            setCompanyForm({
                                code: "",
                                name: "",
                                contactPerson: "",
                                mobile: "",
                                email: "",
                                website: "",
                                country: "Bangladesh",
                                city: "",
                                logo: "",
                                status: "Active",
                            });

                            setShowModal(false);
                        }}
                        className="
                        rounded-xl
                        border
                        border-white/10
                        px-4
                        py-2
                        text-xs
                        "
                        >
                        Cancel
                        </button>

                        <button
                        onClick={async () => {

                            if (
                                !companyForm.code ||
                                !companyForm.name ||
                                !companyForm.contactPerson ||
                                !companyForm.email
                            ) {

                                toast.error(
                                    "Company Code, Name, Contact Person and Email are required."
                                );

                                return;
                            }

                            const duplicateCode =
                                companies.find(
                                    (d) =>
                                        d.code.toLowerCase() ===
                                        companyForm.code.toLowerCase() &&
                                        d.id !== editingId
                                );

                            if (duplicateCode) {

                                toast.error(
                                    "Company Code already exists."
                                );

                                return;
                            }

                            const duplicateName =
                                companies.find(
                                    (d) =>
                                        d.name.toLowerCase() ===
                                        companyForm.name.toLowerCase() &&
                                        d.id !== editingId
                                );

                            if (duplicateName) {

                                toast.error(
                                    "Company Name already exists."
                                );

                                return;
                            }

                            const duplicateEmail =
                                companies.find(
                                    (d) =>
                                        d.email.toLowerCase() ===
                                        companyForm.email.toLowerCase() &&
                                        d.id !== editingId
                                );

                            if (duplicateEmail) {

                                toast.error(
                                    "Company Email already exists."
                                );

                                return;
                            }

                            if (editingId) {

                                setCompanies(
                                    companies.map((d) =>
                                        d.id === editingId
                                            ? {
                                                ...d,
                                                code: companyForm.code,
                                                name: companyForm.name,
                                                contactPerson:
                                                    companyForm.contactPerson,
                                                mobile:
                                                    companyForm.mobile,
                                                email:
                                                    companyForm.email,
                                                website:
                                                    companyForm.website,
                                                country:
                                                    companyForm.country,
                                                city:
                                                    companyForm.city,
                                                status:
                                                    companyForm.status,
                                            }
                                            : d
                                    )
                                );

                            } else {

                                setCompanies([
                                    ...companies,
                                    {
                                        id: Date.now(),
                                        code: companyForm.code,
                                        name: companyForm.name,
                                        contactPerson:
                                            companyForm.contactPerson,
                                        mobile:
                                            companyForm.mobile,
                                        email:
                                            companyForm.email,
                                        website:
                                            companyForm.website,
                                        country:
                                            companyForm.country,
                                        city:
                                            companyForm.city,
                                        logo: "",
                                        references: 0,
                                        status:
                                            companyForm.status,
                                    },
                                ]);

                            }

                            setCompanyForm({
                                code: "",
                                name: "",
                                contactPerson: "",
                                mobile: "",
                                email: "",
                                website: "",
                                country: "Bangladesh",
                                city: "",
                                logo: "",
                                status: "Active",
                            });

                            try {

                                if (editingId) {

                                    await apiClient.put(
                                        `/companies/${editingId}`,
                                        {
                                            code: companyForm.code,
                                            name: companyForm.name,
                                            contact_person:
                                                companyForm.contactPerson,
                                            mobile:
                                                companyForm.mobile,
                                            email:
                                                companyForm.email,
                                            website:
                                                companyForm.website,
                                            country:
                                                companyForm.country,
                                            city:
                                                companyForm.city,
                                            logo:
                                                companyForm.logo,
                                            is_active:
                                                companyForm.status ===
                                                "Active",
                                        }
                                    );

                                    toast.success(
                                        "Company updated successfully."
                                    );

                                } else {

                                    await apiClient.post(
                                        "/companies/",
                                        {
                                            code: companyForm.code,
                                            name: companyForm.name,
                                            contact_person:
                                                companyForm.contactPerson,
                                            mobile:
                                                companyForm.mobile,
                                            email:
                                                companyForm.email,
                                            website:
                                                companyForm.website,
                                            country:
                                                companyForm.country,
                                            city:
                                                companyForm.city,
                                            logo:
                                                companyForm.logo,
                                        }
                                    );

                                    toast.success(
                                        "Company created successfully."
                                    );
                                }

                                await loadCompanies();

                                setCompanyForm({
                                    code: "",
                                    name: "",
                                    contactPerson: "",
                                    mobile: "",
                                    email: "",
                                    website: "",
                                    country: "Bangladesh",
                                    city: "",
                                    logo: "",
                                    status: "Active",
                                });

                                setEditingId(null);

                                setShowModal(false);

                            } catch (error) {

                                if (
                                    axios.isAxiosError(error)
                                ) {

                                    toast.error(
                                        error.response?.data?.detail ||
                                        "Operation failed."
                                    );

                                } else {

                                    toast.error(
                                        "Operation failed."
                                    );
                                }
                            }

                        }}
                        className="
                        rounded-xl
                        bg-cyan-500
                        px-4
                        py-2
                        text-xs
                        font-medium
                        text-black
                        "
                        >
                        {editingId
                            ? "Update Company"
                            : "Save Company"}
                        </button>

                    </div>

                </div>

            </div>

                        )}

            {deleteId && (

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
                border-red-500/20
                bg-[#102E67]
                p-5
                shadow-[0_25px_50px_rgba(0,0,0,0.45)]
                "
                >

                <h2 className="text-lg font-semibold text-white">
                    Delete Company
                </h2>

                <p className="mt-3 text-sm text-white/70">
                    Are you sure you want to delete this company?
                </p>

                <p className="mt-1 text-xs text-red-300">
                    This action cannot be undone.
                </p>

                <div className="mt-5 flex justify-end gap-2">

                    <button
                    onClick={() =>
                        setDeleteId(null)
                    }
                    className="
                    rounded-xl
                    border
                    border-white/10
                    px-4
                    py-2
                    text-xs
                    "
                    >
                    Cancel
                    </button>

                    <button
                    onClick={async () => {

                        try {

                            await apiClient.delete(
                                `/companies/${deleteId}`
                            );

                            await loadCompanies();

                            toast.success(
                                "Company deleted successfully."
                            );

                            setDeleteId(null);

                        } catch (error) {

                            console.error(error);

                            toast.error(
                                "Failed to delete company."
                            );
                        }
                    }}
                    className="
                    rounded-xl
                    bg-red-500
                    px-4
                    py-2
                    text-xs
                    font-medium
                    text-white
                    "
                    >
                    Delete
                    </button>

                </div>

                </div>

            </div>

            )}

        </section>

      </div>

        </main>
  </PermissionGuard>
  );
}