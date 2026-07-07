"use client";

import {
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { employeeService }
from "@/services/employee.service";

export default function UsersPage() {
    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] =
    useState<string | null>(null);
    const [deleteId, setDeleteId] =
    useState<string | null>(null);

    const [resetPasswordId, setResetPasswordId] =
    useState<string | null>(null);

        const [resetPasswordForm, setResetPasswordForm] =
        useState({
        password: "",
        confirmPassword: "",
        });

    const [users, setUsers] =
    useState<any[]>([]);

    const [roles, setRoles] =
    useState<any[]>([]);

    const [employees, setEmployees] =
        useState<any[]>([]);

        const roleOptions =
        roles.map((role) => ({
            value: role.id,
            label: role.display_name,
        }));

        const [userForm, setUserForm] = useState({
            employeeId: "",
            employeeName: "",
            email: "",
            roles: [] as string[],
            password: "",
            confirmPassword: "",
            status: "Active",
        });

        const selectedEmployee =
        employees.find(
            (emp) =>
            emp.employee_id ===
            userForm.employeeId
        );
       

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 10;
    const filteredUsers = users.filter((user) => {

        const matchesSearch =
            (user.employee_id || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||

            (user.full_name || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||

            (user.email || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "All" ||
            (user.is_active
            ? "Active"
            : "Inactive") === statusFilter;

        return matchesSearch && matchesStatus;

        });

const totalPages = Math.ceil(
  filteredUsers.length / recordsPerPage
);

const startIndex =
  (currentPage - 1) * recordsPerPage;

const paginatedUsers =
  filteredUsers.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const loadData = async () => {

  try {

    const [
        usersResponse,
        rolesResponse,
        employeesResponse,
        ] = await Promise.all([
        userService.getUsers(),
        roleService.getRoles(),
        employeeService.getEmployees(),
        ]);

        setUsers(
            usersResponse.data || []
            );

            setRoles(
            rolesResponse || []
            );

            setEmployees(
            employeesResponse || []
            );

            console.log(
            "EMPLOYEES =>",
            employeesResponse
            );

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to load data"
    );

  }

};

useEffect(() => {

  loadData();

}, []);

  return (
  <PermissionGuard
    permission="user:list"
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

        <Sidebar active="users" />

        <section className="flex-1">

          <Topbar
            title="Users"
            subtitle="Manage system users and role assignments"
          />

          <div className="p-4">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

             <div className="mb-4 grid gap-3 md:grid-cols-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Total Users
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    {users.length}
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Active
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-green-300">
                    {
                    users.filter(
                    (d) => d.is_active
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
                    users.filter(
                    (d) => !d.is_active
                    ).length
                    }
                    </h3>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">
                    Assigned Users
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-cyan-300">
                    485
                    </h3>
                </div>

                </div>

             <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <input
                        placeholder="Search user..."
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

               
                <button
                    onClick={() => {

                        setEditingId(null);

                        setUserForm({
                            employeeId: "",
                            employeeName: "",
                            email: "",
                            roles: [],
                            password: "",
                            confirmPassword: "",
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
                    + New User
                    </button>

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
                        Employee Name
                        </th>

                        <th className="p-3 text-left text-xs">
                        Email
                        </th>

                        <th className="p-3 text-left text-xs">
                        User Role
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

                    {paginatedUsers.map((user) => (

                        <tr
                        key={user.id}
                        className="border-b border-white/5"
                        >

                        <td className="p-3 text-xs">
                            {user.employee_id}
                        </td>

                        <td className="p-3 text-xs max-w-[280px] text-white/70">
                            {user.full_name}
                        </td>

                        <td className="p-3 text-xs text-white/70">
                            {user.email}
                        </td>

                        <td className="p-3 text-xs">
                            <div className="flex flex-wrap gap-1">
                                <span
                                className="
                                rounded-lg
                                border
                                border-cyan-500/20
                                bg-cyan-500/10
                                px-2
                                py-1
                                text-[10px]
                                text-cyan-300
                                "
                                >
                                {user.roles
                                ?.map((r: any) => r.display_name)
                                ?.join(", ")}
                                </span>
                            </div>
                        </td>

      
                        <td
                        className={`p-3 text-xs ${
                            user.is_active
                                ? "text-green-300"
                                : "text-red-300"
                        }`}
                        >
                            {user.is_active
                                ? "Active"
                                : "Inactive"}
                        </td>

                        <td className="p-3 flex gap-3">

                            <button
                            onClick={() => {

                            setEditingId(user.id);

                            setUserForm({
                                employeeId: user.employee_id,
                                employeeName: user.full_name,
                                email: user.email,
                                roles:
                                    user.roles?.map(
                                        (role: any) => role.id
                                    ) || [],
                                password: "",
                                confirmPassword: "",
                                status: user.is_active
                                    ? "Active"
                                    : "Inactive",
                            });

                                setShowModal(true);
                            }}
                            className="text-cyan-300 text-xs"
                            >
                            Edit
                            </button>

                            <button
                                onClick={() => {

                                setResetPasswordId(
                                    user.id
                                );

                                setResetPasswordForm({
                                    password: "",
                                    confirmPassword: "",
                                });

                                }}
                                className="text-yellow-300 text-xs"
                                >
                                Reset Password
                                </button>

                            <button
                            onClick={() => {

                                const hasEmployee =
                                user.employee_id === "EMP001";

                                if (hasEmployee) {

                                toast.error(
                                "System Administrator user cannot be deleted."
                                );

                                return;
                                }

                                setDeleteId(user.id);
                                if (user.employeeId === "admin") {

                                toast.error(
                                    "System Administrator user cannot be deleted."
                                );

                                return;
                                }

                                setDeleteId(user.id);
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
                        filteredUsers.length
                        )} of {filteredUsers.length}
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
                    Create User
                    </h2>

                    <button
                    onClick={() => {

                        setEditingId(null);

                        setUserForm({
                            employeeId: "",
                            employeeName: "",
                            email: "",
                            roles: [],
                            password: "",
                            confirmPassword: "",
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

                    <select
                    value={userForm.employeeId}
                    onChange={(e) => {
                        if (editingId) return;

                        const selectedEmployee =
                        employees.find(
                            (employee) =>
                            employee.employee_id ===
                            e.target.value
                        );

                        if (!selectedEmployee) return;

                        setUserForm({
                            ...userForm,
                            employeeId:
                            selectedEmployee.employee_id,
                            employeeName:
                                selectedEmployee.name,
                            email:
                                selectedEmployee.email,
                        });
                    }}
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
                    Select Employee
                    </option>

                    {employees.map((employee) => (
                    <option
                    key={employee.id}
                    value={employee.employee_id}
                    >
                    {employee.employee_id} - {employee.name}
                    </option>
                    ))}
                    </select>
                    </div>

                    <div>
                    <label className="mb-2 block text-xs text-white/60">
                        Employee Name *
                    </label>

                    <input
                    value={userForm.employeeName}
                    readOnly
                    className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-3
                    py-2
                    text-xs
                    cursor-not-allowed
                    "
                    />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-white/60">
                            Email *
                        </label>

                        <input
                        value={userForm.email}
                        readOnly
                        className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-3
                        py-2
                        text-xs
                        cursor-not-allowed
                        "
                        />
                        </div>

                        <div>
                                <label className="mb-2 block text-xs text-white/60">
                                    Roles *
                                </label>
                                <div className="space-y-2">

                                    {roleOptions.map((role) => (

                                    <label
                                    key={role.value}
                                    className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    cursor-pointer
                                    "
                                    >

                                    <input
                                    type="checkbox"
                                    checked={userForm.roles.includes(
                                        role.value
                                    )}
                                    onChange={(e) => {

                                        if (e.target.checked) {

                                            setUserForm({
                                                ...userForm,
                                                roles: [
                                                    ...userForm.roles,
                                                    role.value,
                                                ],
                                            });

                                        } else {

                                            setUserForm({
                                                ...userForm,
                                                roles:
                                                userForm.roles.filter(
                                                    (id) =>
                                                    id !== role.value
                                                ),
                                            });

                                        }

                                    }}
                                    />

                                    <span>
                                    {role.label}
                                    </span>

                                    </label>

                                    ))}

                                    </div>

                   </div>

                   <div>
                    <label className="mb-2 block text-xs text-white/60">
                        Password *
                    </label>

                    <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) =>
                        setUserForm({
                            ...userForm,
                            password: e.target.value,
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
                            Confirm Password *
                        </label>

                        <input
                            type="password"
                            value={userForm.confirmPassword}
                            onChange={(e) =>
                            setUserForm({
                                ...userForm,
                                confirmPassword: e.target.value,
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
                    value={userForm.status}
                    onChange={(e) =>
                        setUserForm({
                            ...userForm,
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

                         setUserForm({
                            employeeId: "",
                            employeeName: "",
                            email: "",
                            roles: [],
                            password: "",
                            confirmPassword: "",
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
                            !userForm.employeeId ||
                            !userForm.employeeName ||
                            !userForm.email ||
                            userForm.roles.length === 0
                        ) {
                            toast.error(
                                "Employee ID, Employee Name, Email and Role are required."
                            );

                            return;
                        }

                        if (
                            !editingId &&
                            (
                                !userForm.password ||
                                !userForm.confirmPassword
                            )
                        ) {
                            toast.error(
                                "Password is required."
                            );

                            return;
                        }

                        if (
                            userForm.password &&
                            userForm.password !==
                            userForm.confirmPassword
                        ) {
                            toast.error(
                                "Password and Confirm Password do not match."
                            );

                            return;
                        }

                        if (
                            userForm.password &&
                            userForm.password.length < 8
                        ) {
                            toast.error(
                                "Password must be at least 8 characters."
                            );

                            return;
                    
                        }

                        const duplicateEmployeeId =
                        users.find(
                        (d) =>
                        (d.employee_id || "")
                        .toLowerCase() ===
                        userForm.employeeId.toLowerCase() &&
                        d.id !== editingId
                        );

                        if (duplicateEmployeeId) {
                        toast.error(
                            "Employee ID already exists."
                        );

                        return;
                        }

                        const duplicateEmail = users.find(
                        (d) =>
                        (d.email || "")
                        .toLowerCase() ===
                        userForm.email.toLowerCase() &&
                        d.id !== editingId
                        );

                        if (duplicateEmail) {
                        toast.error(
                            "Email already exists."
                        );
                        return;
                        }

                       console.log(
                        "SELECTED EMPLOYEE =>",
                        selectedEmployee
                        );

                        if (!selectedEmployee) {

                        toast.error(
                        "Please select an employee"
                        );

                        return;
                        }

                        try {

                        const payload = {
                        full_name: userForm.employeeName,
                        employee_id: userForm.employeeId,
                        email: userForm.email,
                        password: userForm.password,
                        phone: selectedEmployee.mobile,
                        department_id:
                        selectedEmployee.department_id,
                        designation_id:
                        selectedEmployee.designation_id,
                        manager_id: null,
                        is_active:
                        userForm.status === "Active",
                        };

                        console.log(
                        "CREATE USER PAYLOAD =>",
                        payload
                        );

                        if (editingId) {

                        console.log(
                            "UPDATE PAYLOAD =>",
                            JSON.stringify(payload, null, 2)
                        );

                        await userService.updateUser(
                            editingId,
                            payload
                        );

                        await userService.assignRoles(
                            editingId,
                            userForm.roles
                        );

                        await loadData();

                    } else {

                            const createdUser =
                            await userService.createUser(
                                payload
                            );

                            await userService.assignRoles(
                                createdUser.id,
                                userForm.roles
                            );

                            await loadData();
                            }

                            }
                            catch (error: any) {

                        console.log(
                        "FULL ERROR =>",
                        error?.response?.data
                        );

                        toast.error(
                            error?.response?.data?.detail ||
                            "Operation failed"
                        );

                        return;

                        }

                        setUserForm({
                            employeeId: "",
                            employeeName: "",
                            email: "",
                            roles: [],
                            password: "",
                            confirmPassword: "",
                            status: "Active",
                        });

                        
                        toast.success(
                        editingId
                        ? "User updated successfully."
                        : "User created successfully."
                        );

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
                    {editingId ? "Update User" : "Save User"}
                    
                    </button>
                    
                    
                </div>

                </div>

            </div>

            )}

            {resetPasswordId && (

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
                bg-[#102E67]
                p-5
                shadow-2xl
                "
                >

                <h2 className="text-lg font-semibold">
                Reset Password
                </h2>

                <div className="mt-4">

                <label className="mb-2 block text-xs text-white/60">
                New Password
                </label>

                <input
                type="password"
                value={resetPasswordForm.password}
                onChange={(e) =>
                setResetPasswordForm({
                ...resetPasswordForm,
                password: e.target.value,
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

                <div className="mt-4">

                <label className="mb-2 block text-xs text-white/60">
                Confirm Password
                </label>

                <input
                type="password"
                value={resetPasswordForm.confirmPassword}
                onChange={(e) =>
                setResetPasswordForm({
                ...resetPasswordForm,
                confirmPassword: e.target.value,
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

                <div className="mt-5 flex justify-end gap-2">

                <button
                onClick={() => {

                setResetPasswordId(null);

                setResetPasswordForm({
                password: "",
                confirmPassword: "",
                });

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
                !resetPasswordForm.password ||
                !resetPasswordForm.confirmPassword
                ) {

                toast.error(
                "Password fields are required."
                );

                return;
                }

                if (
                resetPasswordForm.password !==
                resetPasswordForm.confirmPassword
                ) {

                toast.error(
                "Password and Confirm Password do not match."
                );

                return;
                }

                if (
                resetPasswordForm.password.length < 6
                ) {

                toast.error(
                "Password must be at least 6 characters."
                );

                return;
                }

                try {

                    await userService.resetPassword(
                        resetPasswordId!,
                        resetPasswordForm.password
                    );

                    toast.success(
                        "Password reset successfully."
                    );

                    setResetPasswordId(null);

                    setResetPasswordForm({
                        password: "",
                        confirmPassword: "",
                    });

                } catch (error: any) {

                    toast.error(
                        error?.response?.data?.detail ||
                        "Password reset failed"
                    );

                }

                setResetPasswordId(null);

                }}
                className="
                rounded-xl
                bg-yellow-500
                px-4
                py-2
                text-xs
                font-medium
                text-black
                "
                >
                Reset Password
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
                    Delete User
                </h2>

                <p className="mt-3 text-sm text-white/70">
                    Are you sure you want to delete this
                    role?
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

                            if (!deleteId) {
                                return;
                            }

                            await userService.deleteUser(
                                deleteId
                            );

                            await loadData();

                            toast.success(
                                "User deleted successfully."
                            );

                            setDeleteId(null);

                        } catch (error: any) {

                            console.log(
                                "DELETE ERROR =>",
                                error?.response?.data
                            );

                            toast.error(
                                error?.response?.data?.detail ||
                                "Failed to delete user"
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