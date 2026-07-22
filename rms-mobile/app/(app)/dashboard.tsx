import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/auth-context";
import { useRouter } from "expo-router";
import { apiClient } from "../../src/lib/api-client";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0, pending: 0, paid: 0, rejected: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await apiClient.get("/reimbursements");
      const claims = res.data?.items || res.data || [];
      setStats({
        total: claims.length,
        pending: claims.filter((c: any) => ["SUBMITTED", "IN_APPROVAL", "VERIFIED"].includes(c.status)).length,
        paid: claims.filter((c: any) => c.status === "PAID").length,
        rejected: claims.filter((c: any) => c.status === "REJECTED").length,
      });
    } catch (e) {
      console.log("Stats error:", e);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day,</Text>
          <Text style={styles.name}>{user?.full_name || "User"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: "Total Claims", value: String(stats.total), color: "#0891b2" },
          { label: "Pending", value: String(stats.pending), color: "#f59e0b" },
          { label: "Paid", value: String(stats.paid), color: "#10b981" },
          { label: "Rejected", value: String(stats.rejected), color: "#ef4444" },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/claims")}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>My Claims</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/approvals")}
        >
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={styles.actionText}>Approvals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(app)/notifications")}
        >
          <Text style={styles.actionIcon}>🔔</Text>
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030B1F" },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 24, paddingTop: 60,
  },
  greeting: { color: "#4a6080", fontSize: 14 },
  name: { color: "#fff", fontSize: 22, fontWeight: "700" },
  logoutBtn: {
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  logoutText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 12, marginBottom: 24,
  },
  statCard: {
    flex: 1, minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  statValue: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: "#4a6080", fontSize: 12 },
  sectionTitle: {
    color: "#fff", fontSize: 16, fontWeight: "700",
    paddingHorizontal: 24, marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row", paddingHorizontal: 16, gap: 12,
  },
  actionCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16, padding: 20, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" },
});