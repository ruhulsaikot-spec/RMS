import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, BackHandler,
} from "react-native";
import { apiClient } from "../../src/lib/api-client";
import { useRouter, useFocusEffect } from "expo-router";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const FILTER_OPTIONS = ["ALL", "TODAY", "THIS_WEEK", "THIS_MONTH"];
const FILTER_LABELS: Record<string, string> = {
  ALL: "All", TODAY: "Today", THIS_WEEK: "This Week", THIS_MONTH: "This Month",
};

export default function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => { loadApprovals(); }, []);

  useFocusEffect(
    useCallback(() => {
      loadApprovals();
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        router.replace("/(app)/dashboard" as any);
        return true;
      });
      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    applyFilter(approvals, selectedFilter, searchQuery);
  }, [selectedFilter, approvals, searchQuery]);

  const applyFilter = (data: any[], filter: string, search: string = searchQuery) => {
    const now = new Date();
    let filtered = data;
    if (filter !== "ALL") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.submitted_at || item.created_at || "");
        if (filter === "TODAY") return date.toDateString() === now.toDateString();
        if (filter === "THIS_WEEK") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return date >= weekAgo;
        }
        if (filter === "THIS_MONTH") {
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(item =>
        (item.application_no || "").toLowerCase().includes(q)
      );
    }
    setFilteredApprovals(filtered);
  };

  const loadApprovals = async () => {
    try {
      const res = await apiClient.get("/reimbursements/pending-approvals");
      setApprovals(res.data || []);
    } catch (e) {
      console.log("Approvals error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadApprovals(); };

  const handleAction = async (applicationId: string, action: "approve" | "reject" | "return") => {
    Alert.prompt(
      action === "approve" ? "Approve Claim" : action === "reject" ? "Reject Claim" : "Return Claim",
      "Add remarks (optional):",
      async (remarks) => {
        try {
          setActionLoading(applicationId);
          await apiClient.post(`/reimbursements/${applicationId}/${action}`, {
            remarks: remarks || "",
          });
          Alert.alert("Success", `Claim ${action}d successfully`);
          loadApprovals();
        } catch (e: any) {
          Alert.alert("Error", e?.response?.data?.detail || "Action failed");
        } finally {
          setActionLoading(null);
        }
      },
      "plain-text"
    );
  };

  const renderApproval = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.85} 
      style={styles.cardGradientBorder}
      onPress={() => router.push(`/(app)/approvals/${item.application_id || item.id}` as any)}
    >
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {/* Icon */}
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>✅</Text>
          </View>

          {/* Info */}
          <View style={styles.cardMiddle}>
            <Text style={styles.claimNo}>{item.application_no}</Text>
            <View style={styles.infoRows}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Applicant</Text>
                <Text style={[styles.infoValue, { color: "#2563eb", fontWeight: "700" }]}>{item.employee_name || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Amount</Text>
                <Text style={[styles.infoValue, { color: "#10b981", fontWeight: "800" }]}>
                  ৳ {Number(item.requested_amount || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{item.department_name || "-"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted</Text>
                <Text style={styles.infoValue}>{formatDate(item.submitted_at || item.created_at)}</Text>
              </View>
            </View>
          </View>

          {/* Stage Badge */}
          <View style={styles.cardRight}>
            <View style={styles.stageBadge}>
              <Text style={styles.stageText}>Pending</Text>
            </View>
            <View style={styles.arrowBox}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background effects */}
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
          <Text style={styles.title}>Pending Approvals</Text>
          <Text style={styles.subtitle}>{filteredApprovals.length} pending</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter !== "ALL" && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={styles.filterIcon}>🔽</Text>
          {selectedFilter !== "ALL" && <View style={styles.filterDot} />}
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
              <Text style={styles.filterTitle}>Filter by Date</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Text style={styles.filterClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filterOptions}>
              {FILTER_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterOption, selectedFilter === f && styles.filterOptionActive]}
                  onPress={() => { setSelectedFilter(f); setShowFilter(false); }}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === f && styles.filterOptionTextActive]}>
                    {FILTER_LABELS[f]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedFilter !== "ALL" && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { setSelectedFilter("ALL"); setShowFilter(false); }}
              >
                <Text style={styles.resetBtnText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <FlatList
        data={filteredApprovals}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderApproval}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
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
    gap: 16,
  },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 12,
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
  subtitle: { color: "#f59e0b", fontSize: 13, fontWeight: "600" },
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
    backgroundColor: "#f0fdf4",
    justifyContent: "center", alignItems: "center",
  },
  iconText: { fontSize: 24 },
  cardMiddle: { flex: 1 },
  claimNo: { color: "#0f172a", fontSize: 16, fontWeight: "800", marginBottom: 10, letterSpacing: 0.3 },
  infoRows: { gap: 6 },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
    gap: 8,
  },
  infoLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "500", width: 80 },
  infoValue: { color: "#475569", fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right", flexWrap: "wrap" },
  cardRight: { alignItems: "center", gap: 10 },
  stageBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, backgroundColor: "#fffbeb",
    borderWidth: 1, borderColor: "#f59e0b",
  },
  stageText: { fontSize: 10, fontWeight: "800", color: "#f59e0b" },
  arrowBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center", alignItems: "center",
  },
  arrowText: { color: "#2563eb", fontSize: 18, fontWeight: "800" },
  actions: {
    flexDirection: "row", gap: 8, marginTop: 14,
    paddingTop: 14, borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  actionBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 12, alignItems: "center",
    borderWidth: 1.5,
  },
  approveBtn: { backgroundColor: "#f0fdf4", borderColor: "#10b981" },
  returnBtn: { backgroundColor: "#fffbeb", borderColor: "#f59e0b" },
  rejectBtn: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  actionBtnText: { fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#94a3b8", fontSize: 14 },
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