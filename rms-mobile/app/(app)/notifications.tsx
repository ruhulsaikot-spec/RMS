import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { apiClient } from "../../src/lib/api-client";

const TYPE_COLORS: Record<string, string> = {
  info: "#0891b2",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

const TYPE_ICONS: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await apiClient.get("/notifications/");
      setNotifications(res.data || []);
    } catch (e) {
      console.log("Notifications error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (e) {
      console.log("Mark read error:", e);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.log("Mark all read error:", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.unreadCard]}
      onPress={() => !item.is_read && markAsRead(item.id)}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${TYPE_COLORS[item.type] || "#0891b2"}20` }]}>
          <Text style={styles.icon}>{TYPE_ICONS[item.type] || "ℹ️"}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, !item.is_read && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2" />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#eef2ff" },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 24, paddingTop: 60,
  },
  title: { color: "#0f172a", fontSize: 22, fontWeight: "700" },
  unreadCount: { color: "#2563eb", fontSize: 12, marginTop: 2 },
  markAllBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(37,99,235,0.2)",
  },
  markAllText: { color: "#2563eb", fontSize: 11, fontWeight: "600" },
  list: { padding: 16, gap: 8 },
  card: {
    flexDirection: "row", gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(37,99,235,0.08)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  unreadCard: {
    backgroundColor: "#eff6ff",
    borderColor: "rgba(37,99,235,0.2)",
  },
  cardLeft: { justifyContent: "flex-start" },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  icon: { fontSize: 18 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardTitle: { color: "#64748b", fontSize: 13, fontWeight: "600", flex: 1 },
  unreadTitle: { color: "#0f172a" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0891b2" },
  cardMessage: { color: "#64748b", fontSize: 12, lineHeight: 18, marginBottom: 6 },
  cardTime: { color: "#94a3b8", fontSize: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});