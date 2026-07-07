"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import axios from "axios";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import ActionGuard from "@/components/auth/action-guard";
import { useRBAC } from "@/hooks/use-rbac";

export default function EmployeesPage() {

  const {
  canCreate,
  canEdit,
  canDelete,
} = useRBAC("Employee");

console.log(
  "EMPLOYEE RBAC",
  {
    canCreate,
    canEdit,
    canDelete,
  }
);

console.log(
  "EMPLOYEE RBAC =>",
  {
    canCreate,
    canEdit,
    canDelete,
  }
);

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] =
    useState<number | null>(null);

    const [employees, setEmployees] = useState<any[]>([]);

    const [companies, setCompanies] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [lineManagers, setLineManagers] = useState<any[]>([]);

    const [employeeForm, setEmployeeForm] = useState({
        employeeId: "",
        name: "",
        email: "",
        mobile: "",

        company: "",

        department: "",
        designation: "",
        lineManager: "",
        location: "",

        joiningDate: "",
        status: "Active",
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
       

    const recordsPerPage = 10;
    const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
        employee.employeeId
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        employee.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        employee.email
            .toLowerCase()
            .includes(search.toLowerCase());

    const matchesStatus =
    statusFilter === "All" ||
    employee.status === statusFilter;

    return matchesSearch && matchesStatus;
});

const totalPages = Math.ceil(
  filteredEmployees.length / recordsPerPage
);

const startIndex =
  (currentPage - 1) * recordsPerPage;

const paginatedEmployees =
  filteredEmployees.slice(
    startIndex,
    startIndex + recordsPerPage
  );

useEffect(() => {
    loadEmployees();
    loadCompanies();
    loadDepartments();
    loadDesignations();
    loadLocations();
}, []);

const loadEmployees = async () => {
    try {

        const response =
            await apiClient.get("/employees/");

        setEmployees(
            response.data.map((employee: any) => ({

                id: employee.id,

                employeeId:
                    employee.employee_id,

                name:
                    employee.name,

                email:
                    employee.email,

                mobile:
                    employee.mobile || "",

                company:
                    employee.company_id,

                department:
                    employee.department_id,

                designation:
                    employee.designation_id,

                location:
                    employee.location_id,

                lineManager:
                    employee.line_manager_id || "",

                joiningDate:
                    employee.joining_date,

                status:
                    employee.is_active
                        ? "Active"
                        : "Inactive",

                references: 0,
            }))
        );

        setLineManagers(
            response.data
        );

    } catch (error) {

        console.error(error);

        toast.error(
            "Failed to load employees."
        );
    }
};

const loadCompanies = async () => {
    try {

        const response =
            await apiClient.get("/companies/");

        setCompanies(response.data);

    } catch (error) {

        console.error(error);
    }
};

const loadDepartments = async () => {
    try {

        const response =
            await apiClient.get("/departments/");

        setDepartments(response.data);

    } catch (error) {

        console.error(error);
    }
};

const loadDesignations = async () => {
    try {

        const response =
            await apiClient.get("/designations/");

        setDesignations(response.data);

    } catch (error) {

        console.error(error);
    }
};

const loadLocations = async () => {
    try {

        const response =
            await apiClient.get("/locations/");

        setLocations(response.data);

    } catch (error) {

        console.error(error);
    }
};

return (

  <PermissionGuard
  
    permission="employee:read"
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

        <Sidebar active="employees" />

        <section className="flex-1">

          <Topbar
            title="Employees"
            subtitle="Manage employees"
          />

          <div className="p-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

             <div className="mb-4 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Total Employees
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {employees.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                    {
                    employees.filter(
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
                    employees.filter(
                        (d) => d.status === "Inactive"
                    ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Line Managers
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    2
                    </h3>
                </div>

                </div>

             <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <input
                        placeholder="Search employee..."
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

               
                <ActionGuard
                  permission="employee:create"

                >
                <button
                    onClick={() => {

                    setEditingId(null);

                    setEmployeeForm({
                        employeeId: "",
                        name: "",
                        email: "",
                        mobile: "",

                        company: "",

                        department: "",
                        designation: "",
                        lineManager: "",
                        location: "",

                        joiningDate: "",
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
                    + New Employee
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
                        Employee ID
                      </th>

                      <th className="p-3 text-left text-xs">
                        Company
                      </th>

                      <th className="p-3 text-left text-xs">
                        Employee Name
                      </th>

                      <th className="p-3 text-left text-xs">
                        Official Email
                      </th>

                      <th className="p-3 text-left text-xs">
                        Department
                        </th>

                        <th className="p-3 text-left text-xs">
                        Designation
                        </th>

                        <th className="p-3 text-left text-xs">
                        Line Manager
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

                    {paginatedEmployees.map((employee) => (

                        <tr
                        key={employee.id}
                        className="border-b border-white/5"
                        >

                        <td className="p-3 text-xs">
                            {employee.employeeId}
                        </td>

                        <td className="p-3 text-xs">
                            {
                                companies.find(
                                    (c) =>
                                        c.id ===
                                        employee.company
                                )?.name || "-"
                            }
                        </td>

                        <td className="p-3 text-xs">
                            {employee.name}
                        </td>

                        <td className="p-3 text-xs">
                            {employee.email}
                        </td>                        

                        <td className="p-3 text-xs">
                        {
                            departments.find(
                                (d) =>
                                    d.id ===
                                    employee.department
                            )?.name || "-"
                        }
                        </td>

                        <td className="p-3 text-xs">
                        {
                            designations.find(
                                (d) =>
                                    d.id ===
                                    employee.designation
                            )?.name || "-"
                        }
                        </td>

                        <td className="p-3 text-xs">
                        {
                            lineManagers.find(
                                (m) =>
                                    m.id ===
                                    employee.lineManager
                            )?.name || "-"
                        }
                        </td>
                       
                        <td className="p-3 text-xs text-green-300">
                            {employee.status}
                        </td>                        

                        <td className="p-3 flex gap-3">

                            <ActionGuard
                              permission="employee:update"

                            >
                            <button
                            onClick={() => {

                                setEditingId(employee.id);

                                setEmployeeForm({
                                    employeeId: employee.employeeId,
                                    name: employee.name,
                                    email: employee.email,
                                    mobile: employee.mobile,

                                    company: employee.company || "",

                                    department: employee.department,
                                    designation: employee.designation,
                                    lineManager: employee.lineManager,
                                    location: employee.location,

                                    joiningDate: employee.joiningDate,
                                    status: employee.status,
                                });

                                setShowModal(true);
                            }}
                            className="text-cyan-300 text-xs"
                            >
                            Edit
                            </button>
                            </ActionGuard>

                            <ActionGuard
                              permission="employee:delete"

                            >
                            <button
                            onClick={() => {

                            if (employee.status === "Active") {

                                toast.error(
                                "Active employee cannot be deleted. Please mark employee inactive first."
                                );

                                return;
                            }

                            if (employee.references > 0) {

                                toast.error(
                                "This employee is referenced in claims, approvals or workflow history and cannot be deleted."
                                );

                                return;
                            }

                            setDeleteId(employee.id);
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
                        filteredEmployees.length
                        )} of {filteredEmployees.length}
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
                max-w-5xl
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
                    Create Employee
                    </h2>

                    <button
                        onClick={() => {

                            setEditingId(null);

                            setEmployeeForm({
                                employeeId: "",
                                name: "",
                                email: "",
                                mobile: "",

                                company: "",

                                department: "",
                                designation: "",
                                lineManager: "",
                                location: "",

                                joiningDate: "",
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
                        Employee ID *
                    </label>

                    <input
                    value={employeeForm.employeeId}
                    onChange={(e) =>
                        setEmployeeForm({
                        ...employeeForm,
                        employeeId: e.target.value,
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
                        Employee Name *
                    </label>

                    <input
                        value={employeeForm.name}
                        onChange={(e) =>
                            setEmployeeForm({
                            ...employeeForm,
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
                        Official Email *
                    </label>

                    <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) =>
                        setEmployeeForm({
                            ...employeeForm,
                            email: e.target.value,
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
                            Mobile Number
                        </label>

                        <input
                        value={employeeForm.mobile}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                mobile: e.target.value,
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
                                Company *
                            </label>

                            <select
                                value={employeeForm.company}
                                onChange={(e) =>
                                    setEmployeeForm({
                                        ...employeeForm,
                                        company: e.target.value,
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
                                <option value="">
                                    Select Company
                                </option>

                                {companies.map((company) => (

                                    <option
                                        key={company.id}
                                        value={company.id}
                                    >
                                        {company.name}
                                    </option>

                                ))}
                            </select>
                        </div>

                        <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Department *
                        </label>

                        <select
                        value={employeeForm.department}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                department: e.target.value,
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
                        <option value="">
                            Select Department
                        </option>

                        {departments.map((department) => (

                            <option
                                key={department.id}
                                value={department.id}
                            >
                                {department.name}
                            </option>

                        ))}
                        </select>
                        </div>

                        <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Designation *
                        </label>

                        <select
                        value={employeeForm.designation}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                designation: e.target.value,
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
                        <option value="">
                            Select Designation
                        </option>

                        {designations.map((designation) => (

                            <option
                                key={designation.id}
                                value={designation.id}
                            >
                                {designation.name}
                            </option>

                        ))}
                        </select>
                        </div>

                        <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Line Manager *
                        </label>

                        <select
                        value={employeeForm.lineManager}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                lineManager: e.target.value,
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
                        <option value="">
                            Select Manager
                        </option>

                        {lineManagers.map((manager) => (

                            <option
                                key={manager.id}
                                value={manager.id}
                            >
                                {manager.name}
                            </option>

                        ))}
                        </select>
                        </div>

                        <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Location *
                        </label>

                        <select
                        value={employeeForm.location}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                location: e.target.value,
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
                        <option value="">
                            Select Location
                        </option>

                        {locations.map((location) => (

                            <option
                                key={location.id}
                                value={location.id}
                            >
                                {location.name}
                            </option>

                        ))}
                        </select>
                        </div>

                        <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Joining Date
                        </label>

                        <input
                        type="date"
                        value={employeeForm.joiningDate}
                        onChange={(e) =>
                            setEmployeeForm({
                                ...employeeForm,
                                joiningDate: e.target.value,
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
                    value={employeeForm.status}
                    onChange={(e) =>
                        setEmployeeForm({
                        ...employeeForm,
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

                            setEmployeeForm({
                                employeeId: "",
                                name: "",
                                email: "",
                                mobile: "",

                                company: "",

                                department: "",
                                designation: "",
                                lineManager: "",
                                location: "",

                                joiningDate: "",
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

                    {((editingId && canEdit) ||
                    (!editingId && canCreate)) && (

                    <button
                    onClick={async () => {

                        if (
                            !employeeForm.employeeId ||
                            !employeeForm.name ||
                            !employeeForm.email ||
                            !employeeForm.company ||
                            !employeeForm.department ||
                            !employeeForm.designation ||
                            !employeeForm.location
                        ) {
                        toast.error(
                            "Employee ID, Name, Email, Company, Department, Designation and Location are required."
                            );
                        return;
                        }

                        const duplicateEmployeeId = employees.find(
                        (d) =>
                            d.employeeId.toLowerCase() ===
                            employeeForm.employeeId.toLowerCase() &&
                            d.id !== editingId
                        );

                        if (duplicateEmployeeId) {
                        toast.error(
                            "Employee ID already exists."
                        );
                        return;
                        }

                        const duplicateEmail = employees.find(
                        (d) =>
                            d.email.toLowerCase() ===
                            employeeForm.email.toLowerCase() &&
                            d.id !== editingId
                        );

                        if (duplicateEmail) {
                        toast.error(
                            "Email already exists."
                        );
                        return;
                        }

                        try {

                            const payload = {

                                employee_id:
                                    employeeForm.employeeId,

                                name:
                                    employeeForm.name,

                                email:
                                    employeeForm.email,

                                mobile:
                                    employeeForm.mobile,

                                company_id:
                                    employeeForm.company,

                                department_id:
                                    employeeForm.department,

                                designation_id:
                                    employeeForm.designation,

                                location_id:
                                    employeeForm.location,

                                line_manager_id:
                                    employeeForm.lineManager || null,

                                joining_date:
                                    employeeForm.joiningDate,

                                is_active:
                                    employeeForm.status === "Active",
                            };

                            if (editingId) {

                                await apiClient.put(
                                    `/employees/${editingId}`,
                                    payload
                                );

                                toast.success(
                                    "Employee updated successfully."
                                );

                            } else {

                                await apiClient.post(
                                    "/employees/",
                                    payload
                                );

                                toast.success(
                                    "Employee created successfully."
                                );
                            }

                            await loadEmployees();

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

                            return;
                        }

                    setEmployeeForm({
                        employeeId: "",
                        name: "",
                        email: "",
                        mobile: "",

                        company: "",

                        department: "",
                        designation: "",
                        lineManager: "",
                        location: "",

                        joiningDate: "",
                        status: "Active",
                    });
                    
                    setEditingId(null);
                    setShowModal(false);
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
                    {editingId ? "Update Employee" : "Save Employee"}
                    
                </button>
                )}
                    

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
                    Delete Employee
                </h2>

                <p className="mt-3 text-sm text-white/70">
                    Are you sure you want to delete this
                    employee?
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
                                `/employees/${deleteId}`
                            );

                            await loadEmployees();

                            toast.success(
                                "Employee deleted successfully."
                            );

                            setDeleteId(null);

                        } catch (error) {

                            console.error(error);

                            toast.error(
                                "Failed to delete employee."
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