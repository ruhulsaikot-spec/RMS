"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";

import { apiClient } from "@/lib/api-client";
import axios from "axios";

export default function DesignationsPage() {
    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] =
    useState<string | null>(null);

    const [deleteId, setDeleteId] =
    useState<string | null>(null);

    const [designations, setDesignations] =
    useState<any[]>([]);

    const [designationForm, setDesignationForm] = useState({
    code: "",
    name: "",
    status: "Active",
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const loadDesignations = async () => {

        try {

            const response =
                await apiClient.get(
                    "/designations/"
                );

            const mappedData =
                response.data.map(
                    (item: any) => ({
                        id: item.id,
                        code: item.code,
                        name: item.name,
                        employees: 0,
                        status:
                            item.is_active
                                ? "Active"
                                : "Inactive",
                    })
                );

            setDesignations(
                mappedData
            );

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load designations"
            );
        }
    };

    useEffect(() => {

        loadDesignations();

    }, []);

    const recordsPerPage = 10;
    const filteredDesignations = designations.filter((designation) => {
  const matchesSearch =
    designation.code
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    designation.name
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "All" ||
    designation.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(
  filteredDesignations.length / recordsPerPage
);

const startIndex =
  (currentPage - 1) * recordsPerPage;

const paginatedDesignations =
  filteredDesignations.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  return (
  <PermissionGuard

    permission="designation:read"
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

        <Sidebar active="designations" />

        <section className="flex-1">

          <Topbar
            title="Designations"
            subtitle="Manage organizational setDesignations"
          />

          <div className="p-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

             <div className="mb-4 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Total Designations
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {designations.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                    {
                    designations.filter(
                        (d) => d.status === "Active"
                    ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Inactive
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-red-300">
                    {
                    designations.filter(
                        (d) => d.status === "Inactive"
                    ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Employees
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    485
                    </h3>
                </div>

                </div>

             <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <input
                        placeholder="Search designation..."
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
                        bg-white/10
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
                    bg-white/10
                    px-3
                    text-xs
                    text-white
                    "
                    >
                    <option
                        value="All"
                        className="bg-[#17386E] text-white"
                        >
                        All
                        </option>

                        <option
                        value="Active"
                        className="bg-[#17386E] text-white"
                        >
                        Active
                        </option>

                        <option
                        value="Inactive"
                        className="bg-[#17386E] text-white"
                        >
                        Inactive
                        </option>
                    </select>

                </div>

                <div className="ml-auto flex items-center gap-2">

               <ActionGuard permission="designation:create">
                <button
                    onClick={() => {

                        setEditingId(null);

                        setDesignationForm({
                            code: "",
                            name: "",
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
                    + New Designation
                    </button>
                    </ActionGuard>

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
                    hover:bg-white/10
                    "
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
                        Code
                      </th>

                      <th className="p-3 text-left text-xs">
                        Department
                      </th>

                      <th className="p-3 text-left text-xs">
                        Employees
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

                    {paginatedDesignations.map((designation) => (

                        <tr
                        key={designation.id}
                        className="border-b border-white/5"
                        >

                        <td className="p-3 text-xs">
                            {designation.code}
                        </td>

                        <td className="p-3 text-xs">
                            {designation.name}
                        </td>

                        
                        <td className="p-3 text-xs">
                            {designation.employees}
                        </td>

                        <td className="p-3 text-xs text-green-300">
                            {designation.status}
                        </td>

                        <td className="p-3 flex gap-3">

                            <ActionGuard permission="designation:update">
                            <button
                            onClick={() => {

                            setEditingId(designation.id);

                            setDesignationForm({
                            code: designation.code,
                            name: designation.name,
                            status: designation.status,
                            });

                                setShowModal(true);
                            }}
                            className="text-cyan-300 text-xs"
                            >
                            Edit
                            </button>
                            </ActionGuard>'

                            <button
                            onClick={() => {

                                const hasEmployee =
                                designation.employees > 0;

                                if (hasEmployee) {

                                toast.error(
                                "Designation cannot be deleted because employees are assigned."
                                );

                                return;
                                }

                                setDeleteId(designation.id);
                                if (designation.employees > 0) {

                                toast.error(
                                    "Department cannot be deleted because employees are assigned."
                                );

                                return;
                                }

                                setDeleteId(designation.id);
                            }}
                            className="text-red-300 text-xs"
                            >
                            Delete
                            </button>

                        </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

                <div className="mt-4 flex items-center justify-between">

                    <p className="text-xs text-white/60">
                        Showing {startIndex + 1} -
                        {Math.min(
                        startIndex + recordsPerPage,
                        filteredDesignations.length
                        )} of {filteredDesignations.length}
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
                        bg-white/5
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
                                : "bg-white/5"
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
                        bg-white/5
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
                max-w-2xl
                rounded-3xl
                border
                border-white/10
                bg-[#102E67]
                p-5
                shadow-2xl
                "
                >

                <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold">
                    Create Designation
                    </h2>

                    <button
                    onClick={() => {

                        setEditingId(null);

                        setDesignationForm({
                            code: "",
                            name: "",
                            status: "Active",
                        });

                        setShowModal(false);
                    }}
                    className="text-white/60"
                    >
                    ✕
                    </button>

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    <div>
                    <label className="mb-2 block text-xs text-white/60">
                        Designation Code *
                    </label>

                    <input
                    value={designationForm.code}
                    onChange={(e) =>
                        setDesignationForm({
                        ...designationForm,
                        code: e.target.value,
                        })
                    }
                    className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-3
                        py-2
                        text-xs
                        "
                    />
                    </div>

                    <div>
                    <label className="mb-2 block text-xs text-white/60">
                        Designation Name *
                    </label>

                    <input
                        value={designationForm.name}
                        onChange={(e) =>
                            setDesignationForm({
                            ...designationForm,
                            name: e.target.value,
                            })
                        }
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/10
                        px-3
                        py-2
                        text-xs
                        "
                    />
                    </div>

                    
                    <div>
                    <label className="mb-2 block text-xs text-white/60">
                        Status
                    </label>

                    <select
                    value={designationForm.status}
                    onChange={(e) =>
                        setDesignationForm({
                        ...designationForm,
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

                        setDesignationForm({
                            code: "",
                            name: "",
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

                        if (!designationForm.code || !designationForm.name) {
                        toast.error(
                            "Designation Code and Name required"
                            );
                        return;
                        }

                        
                        try {

                            if (editingId) {

                                await apiClient.put(
                                    `/designations/${editingId}`,
                                    {
                                        code:
                                            designationForm.code,

                                        name:
                                            designationForm.name,

                                        description:
                                            designationForm.name,

                                        is_active:
                                            designationForm.status ===
                                            "Active",
                                    }
                                );

                                toast.success(
                                    "Designation updated successfully."
                                );

                            } else {

                                await apiClient.post(
                                    "/designations/",
                                    {
                                        code:
                                            designationForm.code,

                                        name:
                                            designationForm.name,

                                        description:
                                            designationForm.name,
                                    }
                                );

                                toast.success(
                                    "Designation created successfully."
                                );
                            }

                            setDesignationForm({
                                code: "",
                                name: "",
                                status: "Active",
                            });

                            setShowModal(false);

                            setEditingId(null);

                            await loadDesignations();

                        } catch (error) {

                            if (
                                axios.isAxiosError(error)
                            ) {

                                toast.error(
                                    error.response?.data?.detail ??
                                    "Create failed"
                                );

                            } else {

                                toast.error(
                                    "Create failed"
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
                    {editingId ? "Update Designation" : "Save Designation"}
                    
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
                shadow-2xl
                "
                >

                <h2 className="text-lg font-semibold text-white">
                    Delete Designation
                </h2>

                <p className="mt-3 text-sm text-white/70">
                    Are you sure you want to delete this
                    designation?
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

                    <ActionGuard permission="designation:delete">
                    <button
                    onClick={async () => {

                        if (!deleteId) {
                            return;
                        }

                        try {

                            await apiClient.delete(
                                `/designations/${deleteId}`
                            );

                            toast.success(
                                "Designation deleted successfully."
                            );

                            setDeleteId(null);

                            await loadDesignations();

                        } catch (error) {

                            if (
                                axios.isAxiosError(error)
                            ) {

                                toast.error(
                                    error.response?.data?.detail ??
                                    "Delete failed"
                                );

                            } else {

                                toast.error(
                                    "Delete failed"
                                );
                            }
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
                    </ActionGuard>

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