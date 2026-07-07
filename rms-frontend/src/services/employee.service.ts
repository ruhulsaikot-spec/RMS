import { apiClient } from "@/lib/api-client";

export const employeeService = {
  async getEmployees() {
    const response = await apiClient.get(
      "/employees"
    );

    return response.data;
  },
};