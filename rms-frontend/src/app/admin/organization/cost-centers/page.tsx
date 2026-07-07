"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";

export default function CostCentersPage() {
    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] =
    useState<number | null>(null);

    const [costCenters, setCostCenters] =
    useState<any[]>([]);

    const [costCenterForm, setCostCenterForm] = useState({
    code: "",
    name: "",
    status: "Active",
    });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const loadCostCenters = async () => {

        try {

            const response =
                await apiClient.get(
                    "/cost-centers/"
                );

            const costCenterData =
                response.data.map(
                    (item: any) => ({
                        id: item.id,
                        code: item.code,
                        name: item.name,
                        references: 0,
                        status:
                            item.is_active
                                ? "Active"
                                : "Inactive",
                    })
                );

            setCostCenters(
                costCenterData
            );

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load cost centers."
            );
        }
    };

    useEffect(() => {
        loadCostCenters();
    }, []);

    const recordsPerPage = 10;
    const filteredCostCenters = costCenters.filter((costCenter) => {
  const matchesSearch =
  costCenter.code.toLowerCase().includes(search.toLowerCase()) ||
  costCenter.name.toLowerCase().includes(search.toLowerCase());

const matchesStatus =
  statusFilter === "All" ||
  costCenter.status === statusFilter;

  return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(
  filteredCostCenters.length / recordsPerPage
);
const startIndex =
  (currentPage - 1) * recordsPerPage;

const paginatedCostCenters =
  filteredCostCenters.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  return (
  <PermissionGuard
    permission="cost_center:read"
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

       <Sidebar active="cost-centers" />

        <section className="flex-1">

          <Topbar
            title="Cost Centers"
            subtitle="Manage organizational Cost Center"
          />

          <div className="p-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

             <div className="mb-4 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Total Cost Centers
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {costCenters.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                    {
                    costCenters.filter(
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
                    costCenters.filter(
                        (d) => d.status === "Inactive"
                    ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                        Draft
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-yellow-300">
                        0
                    </h3>
                </div>

               
                </div>

             <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <input
                        placeholder="Search costCenter..."
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

               
                <ActionGuard permission="cost_center:create">
                <button
                    onClick={() => {

                        setEditingId(null);

                        setCostCenterForm({
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
                    + New Cost Center
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
                        Cost Center
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

                    {paginatedCostCenters.map((costCenter) => (

                        <tr
                        key={costCenter.id}
                        className="border-b border-white/5"
                        >

                        <td className="p-3 text-xs">
                            {costCenter.code}
                        </td>

                        <td className="p-3 text-xs">
                            {costCenter.name}
                        </td>


                        <td className="p-3 text-xs text-green-300">
                            {costCenter.status}
                        </td>

                        <td className="p-3 flex gap-3">

                            <ActionGuard permission="cost_center:update">
                            <button
                            onClick={() => {

                                setEditingId(costCenter.id);

                                setCostCenterForm({
                                    code: costCenter.code,
                                    name: costCenter.name,
                                    status: costCenter.status,
                                });

                                setShowModal(true);

                            }}
                            className="text-cyan-300 text-xs"
                            >
                            Edit
                            </button>
                            </ActionGuard>

                            <ActionGuard permission="cost_center:delete">
                            <button
                            onClick={() => {

                                if (costCenter.references > 0) {

                                    toast.error(
                                        "Cost Center cannot be deleted because it is assigned in the system."
                                    );

                                    return;
                                }

                                setDeleteId(costCenter.id);

                            }}
                            className="text-red-300 text-xs"
                            >
                            Delete
                            </button>
                            </ActionGuard>

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
                        filteredCostCenters.length
                        )} of {filteredCostCenters.length}
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
                    Create Cost Center
                    </h2>

                    <button
                    onClick={() => {

                        setEditingId(null);

                        setCostCenterForm({
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
                        Cost Center Code *
                    </label>

                    <input
                    value={costCenterForm.code}
                    onChange={(e) =>
                    setCostCenterForm({
                    ...costCenterForm,
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
                        Cost Center Name *
                    </label>

                    <input
                        value={costCenterForm.name}
                        onChange={(e) =>
                        setCostCenterForm({
                        ...costCenterForm,
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
                    value={costCenterForm.status}
                    onChange={(e) =>
                    setCostCenterForm({
                    ...costCenterForm,
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

                        setCostCenterForm({
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

                        if (!costCenterForm.code || !costCenterForm.name) {
                        toast.error(
                            "Cost Center Code and Name required"
                            );
                        return;
                        }

                        const duplicateCode = costCenters.find(
                        (d) =>
                            d.code.toLowerCase() ===
                            costCenterForm.code.toLowerCase() &&
                            d.id !== editingId
                        );

                        if (duplicateCode) {
                        toast.error(
                            "Cost Center Code already exists."
                        );
                        return;
                        }

                        const duplicateName = costCenters.find(
                        (d) =>
                            d.name.toLowerCase() ===
                            costCenterForm.name.toLowerCase() &&
                            d.id !== editingId
                        );

                        if (duplicateName) {
                        toast.error(
                            "Cost Center Name already exists."
                        );
                        return;
                        }

                        try {

                            if (editingId) {

                                await apiClient.put(
                                    `/cost-centers/${editingId}`,
                                    {
                                        code:
                                            costCenterForm.code,

                                        name:
                                            costCenterForm.name,

                                        is_active:
                                            costCenterForm.status ===
                                            "Active",
                                    }
                                );

                                toast.success(
                                    "Cost Center updated successfully."
                                );

                            } else {

                                await apiClient.post(
                                    "/cost-centers/",
                                    {
                                        code:
                                            costCenterForm.code,

                                        name:
                                            costCenterForm.name,
                                    }
                                );

                                toast.success(
                                    "Cost Center created successfully."
                                );
                            }

                            await loadCostCenters();

                            setCostCenterForm({
                                code: "",
                                name: "",
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

                        setCostCenterForm({
                        code: "",
                        name: "",
                        status: "Active",
                        });                        
                        
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
                    {editingId ? "Update Cost Center" : "Save Cost Center"}
                    
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
                    Delete Cost Center
                </h2>

                <p className="mt-3 text-sm text-white/70">
                    Are you sure you want to delete this
                    cost center?
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
                                `/cost-centers/${deleteId}`
                            );

                            await loadCostCenters();

                            toast.success(
                                "Cost Center deleted successfully."
                            );

                            setDeleteId(null);

                        } catch (error) {

                            console.error(error);

                            toast.error(
                                "Failed to delete cost center."
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