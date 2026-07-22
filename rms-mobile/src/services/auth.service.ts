import { apiClient } from "../lib/api-client";
import * as SecureStore from "expo-secure-store";

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    const { access_token, refresh_token, user } = response.data;
    console.log("Login response:", JSON.stringify(response.data));

    await SecureStore.setItemAsync("access_token", access_token);
    await SecureStore.setItemAsync("refresh_token", refresh_token);
    await SecureStore.setItemAsync("user", JSON.stringify(user));

    return response.data;
  },

  async logout() {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user");
  },

  async getUser() {
    const user = await SecureStore.getItemAsync("user");
    return user ? JSON.parse(user) : null;
  },

  async isLoggedIn() {
    const token = await SecureStore.getItemAsync("access_token");
    return !!token;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post("/auth/password-reset/request", { email });
    return response.data;
  },

  async resetPassword(token: string, new_password: string, confirm_password: string) {
    const response = await apiClient.post("/auth/password-reset/confirm", {
      token,
      new_password,
      confirm_password,
    });
    return response.data;
  },
};