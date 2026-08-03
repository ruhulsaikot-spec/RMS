import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/auth-context";
import { useRouter } from "expo-router";
import { apiClient } from "../../src/lib/api-client";
const BASE_URL = (apiClient.defaults.baseURL || "http://192.168.0.102:8000/api").replace("/api", "");

const { width } = Dimensions.get("window");

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
};

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, rejected: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadUnreadCount();
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    try {
      const res = await apiClient.get("/employees/");
      const emp = (res.data || []).find((e: any) => e.employee_id === user?.employee_id);
      if (emp?.profile_picture) {
        setProfilePicture(emp.profile_picture);
      }
    } catch {}
  };

  const loadStats = async () => {
    try {
      const res = await apiClient.get("/reimbursements");
      const allClaims = res.data || [];
      const myClaims = user?.id
        ? allClaims.filter((c: any) => c.employee_id === user.id || c.employee_id === user.employee_id)
        : allClaims;
      setStats({
        total: myClaims.length,
        pending: myClaims.filter((c: any) => ["SUBMITTED", "IN_APPROVAL", "VERIFIED", "DRAFT"].includes(c.status)).length,
        paid: myClaims.filter((c: any) => c.status === "PAID").length,
        rejected: myClaims.filter((c: any) => c.status === "REJECTED").length,
      });
    } catch (e) {}
  };

  const loadUnreadCount = async () => {
    try {
      const res = await apiClient.get("/notifications/unread-count");
      setUnreadCount(res.data?.count || 0);
    } catch (e) {}
  };

  const handleLogout = async () => {
    setShowSidebar(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const statCards = [
    { label: "Total Claims", value: stats.total, icon: "📄", color: "#2563eb", bg: "#eff6ff" },
    { label: "Pending", value: stats.pending, icon: "⏰", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Paid", value: stats.paid, icon: "💳", color: "#10b981", bg: "#f0fdf4" },
    { label: "Rejected", value: stats.rejected, icon: "❌", color: "#ef4444", bg: "#fef2f2" },
  ];

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/(app)/dashboard" },
    { label: "New Claim", icon: "➕", path: "/(app)/claims/new" },
    { label: "My Claims", icon: "📄", path: "/(app)/claims" },
    { label: "Approvals", icon: "✅", path: "/(app)/approvals" },
    { label: "Notifications", icon: "🔔", path: "/(app)/notifications" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Sidebar Modal */}
      <Modal
        visible={showSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSidebar(false)}
      >
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebar}>
            <SafeAreaView style={styles.sidebarContent}>
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                <Image
                  source={require("../../assets/logo.png")}
                  style={styles.sidebarLogo}
                  resizeMode="contain"
                />
              </View>

              {/* User Info */}
              <View style={styles.sidebarUser}>
                <View style={styles.sidebarAvatar}>
                  {profilePicture ? (
                    <Image
                      source={{ uri: `${BASE_URL}/${profilePicture}` }}
                      style={{ width: 46, height: 46, borderRadius: 23 }}
                    />
                  ) : (
                    <Text style={styles.sidebarAvatarText}>
                      {user?.full_name?.split(" ").map((w: string) => w[0]).join("").substring(0, 2)}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.sidebarUserName}>{user?.full_name}</Text>
                  <Text style={styles.sidebarUserEmail}>{user?.email}</Text>
                </View>
              </View>

              <View style={styles.sidebarDivider} />

              {/* Menu Items */}
              <View style={styles.sidebarMenu}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.path}
                    style={styles.sidebarMenuItem}
                    onPress={() => {
                      setShowSidebar(false);
                      router.push(item.path as any);
                    }}
                  >
                    <Text style={styles.sidebarMenuIcon}>{item.icon}</Text>
                    <Text style={styles.sidebarMenuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Logout at bottom */}
              <View style={styles.sidebarFooter}>
                <View style={styles.sidebarDivider} />
                <TouchableOpacity
                  style={styles.logoutMenuItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.sidebarMenuIcon}>🚪</Text>
                  <Text style={styles.logoutMenuLabel}>Logout</Text>
                </TouchableOpacity>
                <Text style={styles.sidebarFooterText}>Developed by Wyze Tech Ltd</Text>
              </View>
            </SafeAreaView>
          </View>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            onPress={() => setShowSidebar(false)}
          />
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push("/(app)/notifications")}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatar}>
            {profilePicture ? (
              <Image
                source={{ uri: `${BASE_URL}/${profilePicture}` }}
                style={{ width: 38, height: 38, borderRadius: 19 }}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.full_name?.split(" ").map((w: string) => w[0]).join("").substring(0, 2)}
              </Text>
            )}
            <View style={styles.onlineDot} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>
            {user?.full_name?.split(" ")[0]} 👋
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Manage expenses</Text>
            <Text style={styles.bannerHighlight}>smarter</Text>
            <Text style={styles.bannerSubtitle}>Submit, track and manage{"\n"}all your claims in one place.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => router.push("/(app)/claims/new")}
          >
            <Text style={styles.bannerBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: "My Claims", icon: "📄", path: "/(app)/claims", color: "#2563eb", bg: "#eff6ff" },
            { label: "Approvals", icon: "🛡️", path: "/(app)/approvals", color: "#10b981", bg: "#f0fdf4" },
            { label: "Notifications", icon: "🔔", path: "/(app)/notifications", color: "#8b5cf6", bg: "#f5f3ff" },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => router.push(action.path as any)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: action.bg }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionLabel, { color: action.color }]} numberOfLines={1}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  topGlow: {
    position: "absolute", top: -80, right: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: "rgba(37,99,235,0.12)",
  },
  topGlow2: {
    position: "absolute", top: 100, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(139,92,246,0.08)",
  },

  // Sidebar
  sidebarOverlay: { flex: 1, flexDirection: "row" },
  sidebarBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
  },
  sidebar: {
    width: width * 0.78,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 20,
  },
  sidebarContent: { flex: 1 },
  sidebarHeader: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    backgroundColor: "#eef2ff",
  },
  sidebarLogo: { width: 140, height: 50 },
  sidebarUser: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: "#eef2ff",
  },
  sidebarAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center",
  },
  sidebarAvatarText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  sidebarUserName: { color: "#0f172a", fontSize: 14, fontWeight: "700" },
  sidebarUserEmail: { color: "#64748b", fontSize: 12 },
  sidebarDivider: { height: 1, backgroundColor: "#f1f5f9", marginHorizontal: 20 },
  sidebarMenu: { paddingVertical: 8 },
  sidebarMenuItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  sidebarMenuIcon: { fontSize: 20, width: 28, textAlign: "center" },
  sidebarMenuLabel: { color: "#0f172a", fontSize: 15, fontWeight: "600" },
  sidebarFooter: { marginTop: "auto", paddingBottom: 20 },
  logoutMenuItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  logoutMenuLabel: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
  sidebarFooterText: {
    color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 12,
  },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: "#f0f4ff",
    borderBottomWidth: 1, borderBottomColor: "rgba(37,99,235,0.1)",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 4,
  },
  menuIcon: { fontSize: 22, color: "#1e293b" },
  headerLogo: { width: 120, height: 36 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  bellBtn: { position: "relative" },
  bellIcon: { fontSize: 22 },
  badge: {
    position: "absolute", top: -6, right: -6,
    backgroundColor: "#ef4444", borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#dbeafe", justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#2563eb", fontSize: 13, fontWeight: "800" },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#10b981", borderWidth: 2, borderColor: "#fff",
  },
  scroll: { flex: 1 },
  greetingSection: { padding: 20, paddingBottom: 12 },
  greetingText: { color: "#64748b", fontSize: 15 },
  greetingName: { color: "#0f172a", fontSize: 28, fontWeight: "800", marginTop: 2 },
  statsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 12, marginBottom: 16,
  },
  statCard: {
    width: "47%",
    backgroundColor: "#fff", borderRadius: 20, padding: 16, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  statIcon: { fontSize: 22 },
  statLabel: { color: "#64748b", fontSize: 12, fontWeight: "500" },
  statValue: { fontSize: 32, fontWeight: "800" },
  banner: {
    marginHorizontal: 16, marginBottom: 24,
    backgroundColor: "#eff6ff", borderRadius: 20,
    padding: 20, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  bannerContent: { flex: 1 },
  bannerTitle: { color: "#0f172a", fontSize: 18, fontWeight: "700" },
  bannerHighlight: { color: "#2563eb", fontSize: 18, fontWeight: "700" },
  bannerSubtitle: { color: "#64748b", fontSize: 13, marginTop: 6, lineHeight: 18 },
  bannerBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center",
  },
  bannerBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  sectionTitle: {
    color: "#0f172a", fontSize: 18, fontWeight: "700",
    paddingHorizontal: 20, marginBottom: 12,
  },
  actionsGrid: { flexDirection: "row", paddingHorizontal: 16, gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 20, padding: 14,
    alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    minHeight: 110,
  },
  actionIconBox: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  actionIcon: { fontSize: 22 },
  actionBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", overflow: "hidden" },
  actionLabel: { color: "#0f172a", fontSize: 11, fontWeight: "700", textAlign: "center" },
  actionArrow: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  actionArrowText: { fontSize: 14, fontWeight: "700" },
});