import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BackHandler } from "react-native";
import { apiClient } from "../../../src/lib/api-client";
import * as Linking from "expo-linking";

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  DRAFT: { text: "#64748b", bg: "#f1f5f9" },
  SUBMITTED: { text: "#2563eb", bg: "#eff6ff" },
  IN_APPROVAL: { text: "#8b5cf6", bg: "#f5f3ff" },
  VERIFIED: { text: "#0891b2", bg: "#ecfeff" },
  PAID: { text: "#10b981", bg: "#f0fdf4" },
  REJECTED: { text: "#ef4444", bg: "#fef2f2" },
  RETURNED: { text: "#f59e0b", bg: "#fffbeb" },
};

const formatDate = (d: string) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function ClaimDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenseTypeMap, setExpenseTypeMap] = useState<Record<string, string>>({});
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(app)/claims" as any);
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const loadData = async () => {
    try {
      const [claimRes, etRes, prRes] = await Promise.all([
        apiClient.get(`/reimbursements/${id}`),
        apiClient.get("/expense-types/"),
        apiClient.get("/projects/"),
      ]);
      setClaim(claimRes.data);
      const etMap: Record<string, string> = {};
      (etRes.data || []).forEach((e: any) => { etMap[e.id] = e.name; });
      setExpenseTypeMap(etMap);
      const prMap: Record<string, string> = {};
      (prRes.data || []).forEach((p: any) => { prMap[p.id] = p.name; });
      setProjectMap(prMap);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  if (!claim) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Claim not found</Text>
    </View>
  );

  const statusStyle = STATUS_COLORS[claim.status] || STATUS_COLORS.DRAFT;
  const totalAmount = (claim.expense_items || []).reduce((s: number, i: any) => s + Number(i.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(app)/claims" as any)}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backIcon}>‹</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Claim Details</Text>
          <Text style={styles.subtitle}>{claim.application_no}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{claim.status}</Text>
        </View>
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => {
            const url = `http://192.168.0.102:3000/admin/reports/claim-pdf/${claim.id}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.reportBtnText}>📄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Claim Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Claim Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Application No</Text>
              <Text style={styles.infoValue}>{claim.application_no || "-"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: statusStyle.text }]}>{claim.status || "-"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Submitted Date</Text>
              <Text style={styles.infoValue}>{formatDate(claim.submitted_at || claim.created_at)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Requested Amount</Text>
              <Text style={[styles.infoValue, { color: "#2563eb", fontWeight: "800" }]}>৳ {Number(claim.requested_amount || 0).toLocaleString()}</Text>
            </View>
            {claim.verified_amount && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Verified Amount</Text>
                <Text style={[styles.infoValue, { color: "#0891b2", fontWeight: "800" }]}>৳ {Number(claim.verified_amount).toLocaleString()}</Text>
              </View>
            )}
            {claim.paid_amount > 0 && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Paid Amount</Text>
                <Text style={[styles.infoValue, { color: "#10b981", fontWeight: "800" }]}>৳ {Number(claim.paid_amount).toLocaleString()}</Text>
              </View>
            )}
          </View>
          {claim.data?.remarks && (
            <View style={styles.remarksBox}>
              <Text style={styles.infoLabel}>Remarks</Text>
              <Text style={styles.remarksText}>{claim.data.remarks}</Text>
            </View>
          )}
        </View>

        {/* Expense Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Expense Items</Text>
          {(claim.expense_items || []).map((item: any, idx: number) => (
            <View key={idx} style={styles.expenseItem}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseNum}>
                  <Text style={styles.expenseNumText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseType}>{expenseTypeMap[item.claim_type] || item.claim_type || "-"}</Text>
                  <Text style={styles.expenseDate}>{formatDate(item.expense_date)}</Text>
                </View>
                <Text style={styles.expenseAmount}>৳ {Number(item.amount || 0).toLocaleString()}</Text>
              </View>
              <View style={styles.expenseDetails}>
                {item.purpose && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Purpose</Text>
                    <Text style={styles.detailValue}>{item.purpose}</Text>
                  </View>
                )}
                {item.mode && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mode</Text>
                    <Text style={styles.detailValue}>{item.mode}</Text>
                  </View>
                )}
                {item.project && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Project</Text>
                    <Text style={styles.detailValue}>{projectMap[item.project] || item.project}</Text>
                  </View>
                )}
                {item.from_location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From</Text>
                    <Text style={styles.detailValue}>{item.from_location}</Text>
                  </View>
                )}
                {item.to_location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To</Text>
                    <Text style={styles.detailValue}>{item.to_location}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>৳ {totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Attachments */}
        {claim.attachments && claim.attachments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attachments</Text>
            {claim.attachments.map((att: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.attachmentItem}
                onPress={() => {
                  const url = `http://192.168.0.102:8000/${att.file_url || att.storage_path}`;
                  console.log("Opening URL:", url);
                  require("expo-linking").openURL(url);
                }}
              >
                <Text style={styles.attachmentIcon}>📄</Text>
                <Text style={styles.attachmentName} numberOfLines={1}>{att.file_name || att.original_name || att.name || "Attachment"}</Text>
                <Text style={styles.attachmentArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Approval History */}
        {claim.approval_history && claim.approval_history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Approval History</Text>
            {claim.approval_history.map((h: any, idx: number) => (
              <View key={idx} style={styles.historyItem}>
                <View style={[styles.historyDot, {
                  backgroundColor: ["APPROVED", "VERIFIED", "PAID"].includes(h.action) ? "#10b981" :
                    h.action === "REJECTED" ? "#ef4444" :
                    ["RETURNED", "BACK"].includes(h.action) ? "#f59e0b" : "#2563eb"
                }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.historyTop}>
                    <Text style={styles.historyAction}>{h.action}</Text>
                    <Text style={styles.historyDate}>{formatDate(h.action_date)}</Text>
                  </View>
                  <Text style={styles.historyUser}>{h.user_name}</Text>
                  {h.comments && <Text style={styles.historyComments}>{h.comments}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#64748b", fontSize: 14 },
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
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  backBtnInner: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(37,99,235,0.1)",
  },
  backIcon: { fontSize: 22, color: "#2563eb", fontWeight: "600", marginLeft: -2 },
  title: { color: "#0f172a", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  scroll: { flex: 1 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, marginHorizontal: 16,
    marginBottom: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardTitle: { color: "#0f172a", fontSize: 15, fontWeight: "800", marginBottom: 14 },
  infoGrid: { gap: 10 },
  infoItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { color: "#64748b", fontSize: 12, fontWeight: "500" },
  infoValue: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  remarksBox: { marginTop: 12, padding: 12, backgroundColor: "#f8fafc", borderRadius: 12 },
  remarksText: { color: "#334155", fontSize: 13, marginTop: 4 },
  expenseItem: {
    marginBottom: 12, padding: 12,
    backgroundColor: "#f8fafc", borderRadius: 14,
    borderLeftWidth: 3, borderLeftColor: "#2563eb",
  },
  expenseHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  expenseNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center",
  },
  expenseNumText: { color: "#2563eb", fontSize: 12, fontWeight: "800" },
  expenseType: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  expenseDate: { color: "#64748b", fontSize: 11, marginTop: 2 },
  expenseAmount: { color: "#2563eb", fontSize: 14, fontWeight: "800" },
  expenseDetails: { gap: 4, paddingLeft: 38 },
  detailRow: { flexDirection: "row", gap: 8 },
  detailLabel: { color: "#94a3b8", fontSize: 11, width: 60 },
  detailValue: { color: "#334155", fontSize: 11, flex: 1 },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#e2e8f0",
  },
  totalLabel: { color: "#0f172a", fontSize: 14, fontWeight: "700" },
  totalValue: { color: "#2563eb", fontSize: 16, fontWeight: "800" },
  historyItem: { flexDirection: "row", gap: 12, marginBottom: 14 },
  historyDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  historyTop: { flexDirection: "row", justifyContent: "space-between" },
  historyAction: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  historyDate: { color: "#94a3b8", fontSize: 11 },
  historyUser: { color: "#64748b", fontSize: 12, marginTop: 2 },
  historyComments: { color: "#334155", fontSize: 11, marginTop: 4, fontStyle: "italic" },
  attachmentItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 12, backgroundColor: "#f8fafc", borderRadius: 12,
    marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0",
  },
  attachmentIcon: { fontSize: 20 },
  attachmentName: { flex: 1, color: "#0f172a", fontSize: 13, fontWeight: "600" },
  attachmentArrow: { color: "#94a3b8", fontSize: 18 },
  reportBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(37,99,235,0.2)",
  },
  reportBtnText: { fontSize: 18 },
});