import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { apiClient } from "../../src/lib/api-client";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#64748b",
  SUBMITTED: "#0891b2",
  IN_APPROVAL: "#8b5cf6",
  VERIFIED: "#3b82f6",
  PAID: "#10b981",
  REJECTED: "#ef4444",
  RETURNED: "#f59e0b",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

export default function ClaimsScreen() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const res = await apiClient.get("/reimbursements");
      setClaims(res.data || []);
    } catch (e) {
      console.log("Claims error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClaims();
  };

  const renderClaim = ({ item }: { item: any }) => (
    <View style={styles.claimCard}>
      <View style={styles.claimHeader}>
        <Text style={styles.claimNo}>{item.application_no}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status] || "#64748b"}20` }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || "#64748b" }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.claimInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expense Type</Text>
          <Text style={styles.infoValue}>{item.expense_type_name || "-"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Requested Amount</Text>
          <Text style={styles.amountValue}>৳ {Number(item.requested_amount || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Submitted</Text>
          <Text style={styles.infoValue}>{formatDate(item.submitted_at)}</Text>
        </View>
      </View>
    </View>
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
        <Text style={styles.title}>My Claims</Text>
        <Text style={styles.count}>{claims.length} claims</Text>
      </View>

      <FlatList
        data={claims}
        keyExtractor={(item) => item.id}
        renderItem={renderClaim}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2" />
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
  container: { flex: 1, backgroundColor: "#030B1F" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#030B1F" },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 24, paddingTop: 60,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  count: { color: "#4a6080", fontSize: 13 },
  list: { padding: 16, gap: 12 },
  claimCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  claimHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  claimNo: { color: "#0891b2", fontSize: 14, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  claimInfo: { gap: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { color: "#4a6080", fontSize: 12 },
  infoValue: { color: "#fff", fontSize: 12 },
  amountValue: { color: "#10b981", fontSize: 12, fontWeight: "700" },
  emptyText: { color: "#4a6080", fontSize: 14 },
});