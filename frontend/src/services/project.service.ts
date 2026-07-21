import { apiClient } from "@/lib/api-client";

export const projectService = {
  async getProjects() {
    const response =
      await apiClient.get(
        "/projects"
      );

    return response.data;
  },
};