import { apiClient } from "@/lib/api-client";

import {
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

export const authService = {
  async login(
    payload: LoginRequest
  ): Promise<LoginResponse> {

    const response =
      await apiClient.post<LoginResponse>(
        "/auth/login",
        payload
      );

    return response.data;
  },

  logout() {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "refresh_token"
    );

    localStorage.removeItem(
      "user"
    );
  },
};