import { apiClient } from "@/lib/api-client";

export const expenseTypeService = {
  async getExpenseTypes() {
    const response =
      await apiClient.get(
        "/expense-types"
      );

    return response.data;
  },
};