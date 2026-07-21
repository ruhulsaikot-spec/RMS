import { apiClient } from "@/lib/api-client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  application_id: string | null;
  created_at: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const res = await apiClient.get("/notifications/");
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get("/notifications/unread-count");
    return res.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch("/notifications/mark-all-read");
  },
};