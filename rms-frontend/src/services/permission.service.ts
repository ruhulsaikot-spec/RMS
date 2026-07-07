import { apiClient } from "@/lib/api-client";

export const permissionService = {
  async getPermissions() {
    const response =
      await apiClient.get(
        "/permissions"
      );

    return response.data;
  },
};