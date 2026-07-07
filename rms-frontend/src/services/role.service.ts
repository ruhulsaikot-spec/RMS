import { apiClient } from "@/lib/api-client";

export const roleService = {
  async getRoles() {
    const response = await apiClient.get(
      "/roles"
    );

    return response.data;
  },

  async assignPermissions(
    roleId: string,
    permissionIds: string[]
  ) {
    const response =
      await apiClient.put(
        `/roles/${roleId}/permissions`,
        {
          permission_ids: permissionIds,
        }
      );

    return response.data;
  },
};