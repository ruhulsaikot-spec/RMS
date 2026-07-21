import { apiClient } from "@/lib/api-client";

export const companyService = {
  async getCompanies() {
    const response = await apiClient.get("/companies");
    return response.data;
  },
};