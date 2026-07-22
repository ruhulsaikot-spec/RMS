import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { apiClient } from "../../src/lib/api-client";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

export default function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadApprovals();
  };

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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.claimNo}>{item.application_no}</Text>
        <Text style={styles.date}>{formatDate(item.submitted_at)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Applicant</Text>
        <Text style={styles.value}>{item.employee_name || "-"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Department</Text>
        <Text style={styles.value}>{item.department_name || "-"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amount}>৳ {Number(item.requested_amount || 0).toLocaleString()}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Stage</Text>
        <Text style={styles.value}>{item.current_stage || "-"}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleAction(item.application_id || item.id, "approve")}
          disabled={actionLoading === (item.application_id || item.id)}
        >
          <Text style={styles.actionBtnText}>✓ Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.returnBtn]}
          onPress={() => handleAction(item.application_id || item.id, "return")}
          disabled={actionLoading === (item.application_id || item.id)}
        >
          <Text style={styles.actionBtnText}>↩ Return</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleAction(item.application_id || item.id, "reject")}
          disabled={actionLoading === (item.application_id || item.id)}
        >
          <Text style={styles.actionBtnText}>✕ Reject</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.count}>{approvals.length} pending</Text>
      </View>

      <FlatList
        data={approvals}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderApproval}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2" />
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
  container: { flex: 1, backgroundColor: "#030B1F" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#030B1F" },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 24, paddingTop: 60,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  count: { color: "#f59e0b", fontSize: 13 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  claimNo: { color: "#0891b2", fontSize: 14, fontWeight: "700" },
  date: { color: "#4a6080", fontSize: 12 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { color: "#4a6080", fontSize: 12 },
  value: { color: "#fff", fontSize: 12 },
  amount: { color: "#10b981", fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1, paddingVertical: 8,
    borderRadius: 10, alignItems: "center",
  },
  approveBtn: { backgroundColor: "rgba(16,185,129,0.2)", borderWidth: 1, borderColor: "#10b981" },
  returnBtn: { backgroundColor: "rgba(245,158,11,0.2)", borderWidth: 1, borderColor: "#f59e0b" },
  rejectBtn: { backgroundColor: "rgba(239,68,68,0.2)", borderWidth: 1, borderColor: "#ef4444" },
  actionBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  emptyText: { color: "#4a6080", fontSize: 14 },
});