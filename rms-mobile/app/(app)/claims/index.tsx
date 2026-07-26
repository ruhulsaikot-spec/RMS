import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  TextInput,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../src/lib/api-client";
import { BackHandler } from "react-native";

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  DRAFT: { text: "#64748b", bg: "#f1f5f9" },
  SUBMITTED: { text: "#2563eb", bg: "#eff6ff" },
  IN_APPROVAL: { text: "#8b5cf6", bg: "#f5f3ff" },
  VERIFIED: { text: "#0891b2", bg: "#ecfeff" },
  PAID: { text: "#10b981", bg: "#f0fdf4" },
  REJECTED: { text: "#ef4444", bg: "#fef2f2" },
  RETURNED: { text: "#f59e0b", bg: "#fffbeb" },
};

const STATUS_OPTIONS = ["ALL", "DRAFT", "SUBMITTED", "IN_APPROVAL", "VERIFIED", "PAID", "REJECTED", "RETURNED"];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expenseTypeMap, setExpenseTypeMap] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        router.replace("/(app)/dashboard" as any);
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [])
  );

  useEffect(() => {
    let filtered = claims;
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(c =>
        (c.application_no || "").toLowerCase().includes(q)
      );
    }
    setFilteredClaims(filtered);
  }, [selectedStatus, claims, searchQuery]);

  const loadExpenseTypes = async () => {
    try {
      const res = await apiClient.get("/expense-types/");
      const map: Record<string, string> = {};
      (res.data || []).forEach((et: any) => { map[et.id] = et.name; });
      setExpenseTypeMap(map);
    } catch (e) {}
  };

  const loadClaims = async () => {
    try {
      const res = await apiClient.get("/reimbursements");
      const allClaims = res.data || [];
      
      // Filter by current user's employee_id
      const userStr = await (await import("expo-secure-store")).getItemAsync("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userId = userObj?.id || null;
      
      const myClaims = userId
        ? allClaims.filter((c: any) => c.employee_id === userId)
        : allClaims;
      
      const sorted = myClaims.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setClaims(sorted);
    } catch (e) {
      console.log("Claims error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadClaims(); };

  const resetFilter = () => {
    setSelectedStatus("ALL");
    setShowFilter(false);
  };

  const renderClaim = ({ item }: { item: any }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT;
    return (
      <TouchableOpacity activeOpacity={0.85} style={styles.cardGradientBorder} onPress={() => router.push(`/(app)/claims/details?id=${item.id}` as any)}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>📄</Text>
            </View>
            <View style={styles.cardMiddle}>
              <Text style={styles.claimNo}>{item.application_no}</Text>
              <View style={styles.infoRows}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expense Type</Text>
                  <Text style={[styles.infoValue, { color: "#2563eb", fontWeight: "700" }]}>
                    {item.claim_types?.map((id: string) => expenseTypeMap[id] || id).join(", ") || "-"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Requested Amount</Text>
                  <Text style={[styles.infoValue, { color: "#10b981", fontWeight: "800" }]}>
                    ৳ {Number(item.requested_amount || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Submitted</Text>
                  <Text style={styles.infoValue}>{formatDate(item.submitted_at || item.created_at)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
              </View>
              {["DRAFT", "RETURNED"].includes(item.status) ? (
                <TouchableOpacity
                  style={styles.editBox}
                  onPress={() => router.push(`/(app)/claims/${item.id}` as any)}
                >
                  <Text style={styles.editText}>✏️</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.arrowBox}>
                  <Text style={styles.arrowText}>›</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(app)/dashboard" as any)}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backIcon}>‹</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Claims</Text>
          <Text style={styles.subtitle}>{filteredClaims.length} claims</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(app)/claims/new")}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, selectedStatus !== "ALL" && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={styles.filterIcon}>🔽</Text>
          {selectedStatus !== "ALL" && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by claim ID..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Text style={{ color: "#94a3b8", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      {showFilter && (
        <View style={styles.filterModal}>
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Text style={styles.filterClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptions}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterOption, selectedStatus === status && styles.filterOptionActive]}
                  onPress={() => { setSelectedStatus(status); setShowFilter(false); }}
                >
                  <Text style={[styles.filterOptionText, selectedStatus === status && styles.filterOptionTextActive]}>
                    {status === "ALL" ? "All Status" : status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedStatus !== "ALL" && (
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilter}>
                <Text style={styles.resetBtnText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={filteredClaims}
        keyExtractor={(item) => item.id}
        renderItem={renderClaim}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No claims found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(37,99,235,0.1)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1, fontSize: 13, color: "#0f172a",
  },
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
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
    gap: 10,
  },
  backBtn: {
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  backBtnInner: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(37,99,235,0.1)",
  },
  backIcon: { fontSize: 22, color: "#2563eb", fontWeight: "600", marginLeft: -2 },
  title: { color: "#0f172a", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 13 },
  addBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "#2563eb", justifyContent: "center", alignItems: "center",
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  addBtnText: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: -2 },
  filterBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    position: "relative",
  },
  filterBtnActive: { backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#2563eb" },
  filterIcon: { fontSize: 16 },
  filterDot: {
    position: "absolute", top: -3, right: -3,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#2563eb", borderWidth: 2, borderColor: "#fff",
  },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  cardGradientBorder: {
    borderRadius: 26, padding: 1.5,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
    backgroundColor: "rgba(37,99,235,0.2)",
  },
  card: {
    backgroundColor: "#ffffff", borderRadius: 24, padding: 18,
    borderTopWidth: 3, borderTopColor: "rgba(37,99,235,0.3)",
  },
  cardTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#eff6ff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 2,
  },
  iconText: { fontSize: 24 },
  cardMiddle: { flex: 1 },
  claimNo: { color: "#0f172a", fontSize: 16, fontWeight: "800", marginBottom: 10, letterSpacing: 0.3 },
  infoRows: { gap: 6 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 3,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
  },
  infoLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "500", flex: 1 },
  infoValue: { color: "#475569", fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right" },
  cardRight: { alignItems: "center", gap: 10 },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  arrowBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center", alignItems: "center",
  },
  arrowText: { color: "#2563eb", fontSize: 18, fontWeight: "800" },
  editBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#fffbeb", justifyContent: "center", alignItems: "center",
  },
  editText: { fontSize: 14 },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  filterModal: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100,
    justifyContent: "flex-end",
  },
  filterCard: {
    backgroundColor: "#fff", borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingBottom: 40,
  },
  filterHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  filterTitle: { color: "#0f172a", fontSize: 18, fontWeight: "700" },
  filterClose: { color: "#94a3b8", fontSize: 20, padding: 4 },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  filterOption: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: "#e2e8f0", backgroundColor: "#f8fafc",
  },
  filterOptionActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  filterOptionText: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  filterOptionTextActive: { color: "#2563eb" },
  resetBtn: {
    backgroundColor: "#fee2e2", borderRadius: 14,
    padding: 14, alignItems: "center", marginTop: 8,
  },
  resetBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "700" },
});