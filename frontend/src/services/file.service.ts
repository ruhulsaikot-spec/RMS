import { apiClient } from "@/lib/api-client";

export const fileService = {
  async uploadFile(file: File) {
    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await apiClient.post(
        "/files/upload",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

    return response.data;
  },
};