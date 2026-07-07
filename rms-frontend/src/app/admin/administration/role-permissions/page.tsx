"use client";

import {
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";


import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PermissionGuard from "@/components/auth/permission-guard";
import { useAuth } from "@/contexts/auth-context";

import { roleService } from "@/services/role.service";
import { permissionService } from "@/services/permission.service";

import { Role } from "@/types/role";
import { Permission } from "@/types/permission";

export default function RolePermissionsPage() {
  const {
  permissions: userPermissions,
} = useAuth();

const canEdit =
  userPermissions.includes(
    "role:manage_permissions"
  );
console.log(
  "CAN EDIT ROLE PERMISSIONS =>",
  canEdit
);

const [roles, setRoles] =
useState<Role[]>([]);

const [permissions, setPermissions] =
useState<Permission[]>([]);

const [selectedRoleId, setSelectedRoleId] =
useState("");

const [selectedPermissions, setSelectedPermissions] =
useState<string[]>([]);

const [loading, setLoading] =
useState(true);

useEffect(() => {
  loadData();
}, []);

const PERMISSION_GROUPS = {
  Organization: [
    "department",
    "designation",
    "employee",
    "company",
    "location",
    "project",
    "cost_center",
    "expense_type",
  ],

  Administration: [
    "user",
    "role",
    "permission",
    "workflow",
    "approval_group",
  ],

  Claims: [
    "reimbursement",
  ],
};

const RESOURCE_GROUPS: Record<
string,
string
> = {

department:
"Organization",

designation:
"Organization",

employee:
"Organization",

company:
"Organization",

location:
"Organization",

project:
"Organization",

cost_center:
"Organization",

expense_type:
"Organization",

user:
"Administration",

role:
"Administration",

permission:
"Administration",

workflow:
"Administration",

approval_group:
"Administration",

reimbursement:
"Claims",

};

const formatResourceName = (
  resource: string
) => {

  return resource
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

};

const groupedPermissions =
Object.entries(

permissions.reduce(
(acc, permission) => {

const groupName =
RESOURCE_GROUPS[
permission.resource
] || "Others";

if (!acc[groupName]) {
acc[groupName] = {};
}

if (
!acc[groupName][
permission.resource
]
) {
acc[groupName][
permission.resource
] = [];
}

acc[groupName][
permission.resource
].push(
permission
);

return acc;

},
{} as Record<
string,
Record<
string,
Permission[]
>
>

)

).map(
([groupName, resources]) => ({
groupName,
resources,
})
);



const permissionMatrix = Object.values(
  permissions.reduce(
    (acc, permission) => {
      const resource =
        permission.resource;

      if (!acc[resource]) {
        acc[resource] = {
          resource,
          view: null,
          create: null,
          update: null,
          delete: null,
          approve: null,
          export: null,
          submit: null,
          pay: null,
          manage_permissions: null,
        };
      }

      acc[resource][
        permission.action as keyof typeof acc[string]
      ] = permission;

      return acc;
    },
    {} as Record<string, any>
  )
);

const loadData = async () => {
  try {

    setLoading(true);

    const [
      rolesData,
      permissionsData,
    ] = await Promise.all([
      roleService.getRoles(),
      permissionService.getPermissions(),
    ]);

    setRoles(rolesData);
    setPermissions(permissionsData);

    if (rolesData.length > 0) {

      setSelectedRoleId(
        rolesData[0].id
      );

      setSelectedPermissions(
        rolesData[0].permissions?.map(
          (p: any) => p.id
        ) || []
      );
    }

  } catch (error) {

    console.error(error);

    toast.error(
      "Failed to load role permissions."
    );

  } finally {

    setLoading(false);

  }
};

  return (
  <PermissionGuard
      permission="permission:read"
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

        <Sidebar active="role-permissions" />

        <section className="flex-1">

          <Topbar
            title="Role Permissions"
            subtitle="Manage role-based access control"
          />

          <div className="p-4">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

          <div className="mb-5">

                <label className="mb-2 block text-xs text-white/60">
                  Select Role *
                </label>

                <select
                  value={selectedRoleId}
                  onChange={(e) => {

                  const roleId =
                    e.target.value;

                  setSelectedRoleId(roleId);

                  const role =
                    roles.find(
                      (r) => r.id === roleId
                    );

                  setSelectedPermissions(
                    role?.permissions?.map(
                      (p) => p.id
                    ) || []
                  );

                }}
                  className="
                  h-10
                  w-[320px]
                  rounded-xl
                  border
                  border-white/10
                  bg-[#35538F]
                  px-3
                  text-xs
                  "
                >
                  {roles.map((role) => (
                    <option
                        key={role.id}
                        value={role.id}
                    >
                        {role.display_name}
                    </option>
                    ))}
                </select>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                <h3 className="mb-4 text-base font-semibold">
                  Permission Matrix
                  </h3>

                  <div className="space-y-5">

                  {groupedPermissions.map(
                  (group) => (

                  <div
                  key={group.groupName}
                  className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  overflow-hidden
                  "
                  >

                  <div
                  className="
                  border-b
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  font-semibold
                  text-cyan-300
                  "
                  >
                  {group.groupName}
                  </div>

                  <div className="overflow-x-auto">

                  <table className="w-full">

                  <thead>

                  <tr className="border-b border-white/10">

                  <th className="p-3 text-left text-xs">
                  Form
                  </th>

                  <th className="p-3 text-center text-xs">
                  View
                  </th>

                  <th className="p-3 text-center text-xs">
                  Add
                  </th>

                  <th className="p-3 text-center text-xs">
                  Edit
                  </th>

                  <th className="p-3 text-center text-xs">
                  Delete
                  </th>

                  <th className="p-3 text-center text-xs">
                  Approve
                  </th>

                  <th className="p-3 text-center text-xs">
                  Submit
                  </th>

                  <th className="p-3 text-center text-xs">
                  Pay
                  </th>

                  </tr>

                  </thead>

                  <tbody>

                    {Object.entries(
                      group.resources
                    ).map(
                      ([resource, perms]) => {

                        const getPermission =
                          (action: string) =>
                            perms.find(
                              (p) =>
                                p.action === action
                            );

                        return (

                          <tr
                            key={resource}
                            className="
                            border-b
                            border-white/5
                            "
                          >

                            <td className="p-3 text-xs font-medium">
                              {formatResourceName(resource)}
                            </td>

                            {[
                              "read",
                              "create",
                              "update",
                              "delete",
                              "approve",
                              "submit",
                              "pay",
                            ].map((action) => {

                              const permission =
                                getPermission(action);

                              return (

                                <td
                                  key={action}
                                  className="
                                  p-3
                                  text-center
                                  "
                                >

                                  {permission ? (

                                    <input
                                      type="checkbox"
                                      disabled={!canEdit}
                                      checked={selectedPermissions.includes(
                                        permission.id
                                      )}
                                      onChange={(e) => {

                                        if (
                                          e.target.checked
                                        ) {

                                          setSelectedPermissions([
                                            ...selectedPermissions,
                                            permission.id,
                                          ]);

                                        } else {

                                          setSelectedPermissions(
                                            selectedPermissions.filter(
                                              (id) =>
                                                id !== permission.id
                                            )
                                          );

                                        }

                                      }}
                                    />

                                  ) : (

                                    <span className="text-white/20">
                                      —
                                    </span>

                                  )}

                                </td>

                              );

                            })}

                          </tr>

                        );

                      }
                    )}

                    </tbody>

                  </table>

                  </div>

                  </div>
                  )
                  )}

                  </div>

                <div className="mt-5 flex justify-end gap-2">

               
                {canEdit && (

                <button
                onClick={async () => {

                try {

                console.log(
                  "ROLE ID =>",
                  selectedRoleId
                );

                console.log(
                  "PERMISSIONS =>",
                  selectedPermissions
                );

                const response =
                  await roleService.assignPermissions(
                    selectedRoleId,
                    selectedPermissions
                  );

                console.log(
                  "SAVE RESPONSE =>",
                  response
                );

                toast.success(
                "Role permissions updated successfully."
                );

                await loadData();

                } catch (error) {

                console.error(error);

                toast.error(
                "Failed to update permissions."
                );

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
                Save Permissions
                </button>

                )}

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