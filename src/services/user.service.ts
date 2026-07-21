import { apiClient } from "@/lib/api-client";

export const userService = {

  async getUsers() {
    const response =
      await apiClient.get("/users");

    return response.data;
  },

  async createUser(
    payload: any
  ) {
    const response =
      await apiClient.post(
        "/users",
        payload
      );

    return response.data;
  },

  async updateUser(
    userId: string,
    payload: any
  ) {
    const response =
      await apiClient.put(
        `/users/${userId}`,
        payload
      );

    return response.data;
  },

  async deleteUser(
    userId: string
  ) {
    const response =
      await apiClient.delete(
        `/users/${userId}`
      );

    return response.data;
  },

  async assignRoles(
    userId: string,
    roleIds: string[]
  ) {
    const response =
      await apiClient.post(
        `/users/${userId}/roles`,
        {
          role_ids: roleIds,
        }
      );

    return response.data;
  },

  async resetPassword(
  userId: string,
  password: string
) {
  const response =
    await apiClient.post(
      `/users/${userId}/reset-password`,
      {
        password,
      }
    );

  return response.data;
},

};