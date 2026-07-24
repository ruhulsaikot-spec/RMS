import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Linking, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { apiClient } from "../../../src/lib/api-client";

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  DRAFT: { text: "#64748b", bg: "#f1f5f9" },
  SUBMITTED: { text: "#2563eb", bg: "#eff6ff" },
  IN_APPROVAL: { text: "#8b5cf6", bg: "#f5f3ff" },
  VERIFIED: { text: "#0891b2", bg: "#ecfeff" },
  PAID: { text: "#10b981", bg: "#f0fdf4" },
  REJECTED: { text: "#ef4444", bg: "#fef2f2" },
  RETURNED: { text: "#f59e0b", bg: "#fffbeb" },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  console.log("Approval detail ID:", id);
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClaim();
    loadProjects();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setRemarks("");
      setSelectedAction("");
      setShowActionDropdown(false);
      setVerifiedAmount("");
      setPaymentMethodId("");
      loadClaim();
      loadPaymentMethods();
    }, [id])
  );

  const loadPaymentMethods = async () => {
    try {
      const res = await apiClient.get("/payment-methods/");
      setPaymentMethods(res.data || []);
    } catch (e) {}
  };

  const loadProjects = async () => {
    try {
      const res = await apiClient.get("/projects/");
      const map: Record<string, string> = {};
      (res.data || []).forEach((p: any) => { map[p.id] = p.name; });
      setProjectMap(map);
    } catch (e) {}
  };

  const loadClaim = async () => {
    try {
      const res = await apiClient.get(`/reimbursements/${id}`);
      console.log("Attachments:", JSON.stringify(res.data?.attachments));
      console.log("Remarks:", res.data?.remarks, res.data?.data?.remarks);
      console.log("Workflow actions:", JSON.stringify(res.data?.workflow_actions));
      setClaim(res.data);
    } catch (e) {
      console.log("Claim detail error:", e);
    } finally {
      setLoading(false);
    }
  };

  const pendingActionType = claim?.workflow_actions?.find((a: any) => a.action_code === "VERIFY")
    ? "Amount Verification"
    : claim?.workflow_actions?.find((a: any) => a.action_code === "PAY")
    ? "Payment Processing"
    : null;

  const ACTION_MAP: Record<string, { endpoint: string; color: string }> = {
    APPROVE: { endpoint: "approve", color: "#10b981" },
    BACK: { endpoint: "back-to-previous-stage", color: "#8b5cf6" },
    RETURN: { endpoint: "return-to-applicant", color: "#f59e0b" },
    REJECT: { endpoint: "reject", color: "#ef4444" },
    VERIFY: { endpoint: "finance-review", color: "#0891b2" },
    PAY: { endpoint: "pay", color: "#10b981" },
  };

  const handleAction = async () => {
    if (!selectedAction) {
      Alert.alert("Error", "Please select an action");
      return;
    }
    const actionConfig = ACTION_MAP[selectedAction];
    if (!actionConfig) return;

    // Remarks mandatory for REJECT and RETURN
    if (["REJECT", "RETURN", "BACK"].includes(selectedAction) && !remarks.trim()) {
      Alert.alert("Remarks Required", `Please add remarks for ${selectedAction} action.`);
      return;
    }

    try {
      setActionLoading(true);
      console.log("Action URL:", `/reimbursements/${id}/${actionConfig.endpoint}`);
      let payload: any = { remarks: remarks || "" };
      
      if (selectedAction === "VERIFY") {
        if (!verifiedAmount) {
          Alert.alert("Error", "Please enter verified amount");
          setActionLoading(false);
          return;
        }
        const verifiedNum = Number(verifiedAmount);
        const requestedNum = Number(claim?.requested_amount || 0);
        if (verifiedNum > requestedNum) {
          Alert.alert("Error", `Verified amount cannot exceed requested amount (৳ ${requestedNum.toLocaleString()})`);
          setActionLoading(false);
          return;
        }
        payload = { verified_amount: verifiedNum, remarks: remarks || "" };
      }
      
      if (selectedAction === "PAY") {
        payload = {
          payment_method_id: "51d6e773-0e4b-4de9-8f84-d3333e6574f0",
          payment_amount: Number(claim?.verified_amount || claim?.requested_amount || 0),
          remarks: remarks || "",
        };
      }

      await apiClient.post(`/reimbursements/${id}/${actionConfig.endpoint}`, payload);
      Alert.alert("Success", "Action completed successfully", [
        { text: "OK", onPress: () => router.replace("/(app)/approvals" as any) }
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!claim) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Claim not found</Text>
      </View>
    );
  }

  const statusStyle = STATUS_COLORS[claim.status] || STATUS_COLORS.DRAFT;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(app)/approvals" as any)}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backIcon}>‹</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{claim.application_no}</Text>
          <Text style={styles.subtitle}>Approval Details</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{claim.status}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Applicant Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Applicant Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{claim.employee_name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{claim.department_name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Designation</Text>
            <Text style={styles.infoValue}>{claim.designation_name || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted</Text>
            <Text style={styles.infoValue}>{formatDate(claim.submitted_at || claim.created_at)}</Text>
          </View>
        </View>

        {/* Amount Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Amount Details</Text>
          <View style={styles.amountRow}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Requested</Text>
              <Text style={[styles.amountValue, { color: "#2563eb" }]}>
                {`৳ ${Number(claim.requested_amount || 0).toLocaleString()}`}
              </Text>
            </View>
            {pendingActionType === "Amount Verification" && selectedAction === "VERIFY" ? (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Verified Amount *</Text>
                <TextInput
                  style={styles.verifyInput}
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  value={verifiedAmount}
                  onChangeText={setVerifiedAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            ) : !!claim.verified_amount ? (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Verified</Text>
                <Text style={[styles.amountValue, { color: "#0891b2" }]}>
                  {`৳ ${Number(claim.verified_amount || 0).toLocaleString()}`}
                </Text>
              </View>
            ) : null}
            {pendingActionType === "Payment Processing" && selectedAction === "PAY" ? (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Payment</Text>
                <Text style={[styles.amountValue, { color: "#10b981" }]}>
                  {`৳ ${Number(claim?.verified_amount || claim?.requested_amount || 0).toLocaleString()}`}
                </Text>
              </View>
            ) : !!claim.paid_amount ? (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Paid</Text>
                <Text style={[styles.amountValue, { color: "#10b981" }]}>
                  {`৳ ${Number(claim.paid_amount || 0).toLocaleString()}`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Expense Items */}
        {claim.expense_items && claim.expense_items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📄 Expense Items</Text>
            {claim.expense_items.map((item: any, index: number) => (
              <View key={index} style={styles.expenseItem}>
                <View style={styles.expenseItemHeader}>
                  <Text style={styles.expenseItemNo}>Item {index + 1}</Text>
                  <Text style={styles.expenseItemAmount}>
                    ৳ {Number(item.amount || 0).toLocaleString()}
                  </Text>
                </View>
                {item.purpose && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Purpose</Text>
                    <Text style={styles.infoValue}>{item.purpose}</Text>
                  </View>
                )}
                {item.mode && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mode</Text>
                    <Text style={styles.infoValue}>{item.mode}</Text>
                  </View>
                )}
                {item.from_location && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>From</Text>
                    <Text style={styles.infoValue}>{item.from_location}</Text>
                  </View>
                )}
                {item.to_location && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>To</Text>
                    <Text style={styles.infoValue}>{item.to_location}</Text>
                  </View>
                )}
                {!!item.project && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Project</Text>
                    <Text style={styles.infoValue}>
                      {projectMap[item.project] || String(item.project)}
                    </Text>
                  </View>
                )}
                {!!item.expense_date && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{formatDate(item.expense_date)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Remarks */}
        {!!(claim.data?.remarks) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💬 Remarks</Text>
            <Text style={styles.remarksText}>{String(claim.data?.remarks)}</Text>
          </View>
        )}

        {/* Attachments */}
        {claim.attachments && claim.attachments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📎 Attachments</Text>
            {claim.attachments.map((att: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItem}
                onPress={() => {
                  const url = `http://192.168.0.102:8000/${att.file_url}`;
                  Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open file"));
                }}
              >
                <Text style={styles.attachmentIcon}>📄</Text>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.file_name || `Attachment ${index + 1}`}
                </Text>
                <Text style={styles.attachmentPreview}>👁️</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Workflow Action */}
        {claim.workflow_actions && claim.workflow_actions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚡ Workflow Action</Text>

            {/* Action Dropdown */}
            <Text style={styles.fieldLabel}>Select Action</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowActionDropdown(!showActionDropdown)}
            >
              <Text style={[styles.dropdownBtnText, !selectedAction && styles.dropdownPlaceholder]}>
                {selectedAction
                  ? claim.workflow_actions.find((a: any) => a.action_code === selectedAction)?.action_name
                  : "Select Action"}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

            {showActionDropdown && (
              <View style={styles.dropdownList}>
                {claim.workflow_actions
                  .filter((a: any) => ["APPROVE", "REJECT", "BACK", "RETURN", "VERIFY", "PAY"].includes(a.action_code))
                  .map((action: any) => {
                    const config = ACTION_MAP[action.action_code];
                    return (
                      <TouchableOpacity
                        key={action.action_code}
                        style={[styles.dropdownItem, selectedAction === action.action_code && styles.dropdownItemActive]}
                        onPress={() => {
                          setSelectedAction(action.action_code);
                          setShowActionDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          config && { color: config.color },
                          selectedAction === action.action_code && { fontWeight: "700" },
                        ]}>
                          {action.action_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            )}
         

        
            {/* Remarks */}
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
              Remarks{["REJECT", "RETURN", "BACK"].includes(selectedAction) ? " *" : ""}
            </Text>
            <View style={styles.remarksInput}>
              <TextInput
                style={styles.remarksInputText}
                placeholder="Add comments..."
                placeholderTextColor="#94a3b8"
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                !selectedAction && styles.confirmBtnDisabled,
                selectedAction === "REJECT" && { backgroundColor: "#ef4444" },
              ]}
              onPress={handleAction}
              disabled={actionLoading || !selectedAction}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {selectedAction
                    ? `Confirm ${claim.workflow_actions.find((a: any) => a.action_code === selectedAction)?.action_name}`
                    : "Select an Action"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#eef2ff" },
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
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, gap: 12,
  },
  backBtn: {
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 6,
  },
  backBtnInner: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "rgba(37,99,235,0.1)",
  },
  backIcon: { fontSize: 22, color: "#2563eb", fontWeight: "600", marginLeft: -2 },
  title: { color: "#0f172a", fontSize: 18, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "800" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    borderTopWidth: 3, borderTopColor: "rgba(37,99,235,0.2)",
  },
  cardTitle: { color: "#0f172a", fontSize: 14, fontWeight: "800", marginBottom: 12 },
  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9", gap: 8,
  },
  infoLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "500", width: 90 },
  infoValue: { color: "#475569", fontSize: 12, fontWeight: "600", flex: 1, textAlign: "right" },
  amountRow: { flexDirection: "row", gap: 12 },
  amountBox: {
    flex: 1, backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, alignItems: "center",
  },
  amountLabel: { color: "#94a3b8", fontSize: 11, fontWeight: "600", marginBottom: 4 },
  amountValue: { fontSize: 18, fontWeight: "800" },
  expenseItem: {
    backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: "#2563eb",
  },
  expenseItemHeader: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 8,
  },
  expenseItemNo: { color: "#0f172a", fontSize: 13, fontWeight: "700" },
  expenseItemAmount: { color: "#10b981", fontSize: 13, fontWeight: "800" },
  remarksText: { color: "#475569", fontSize: 13, lineHeight: 20 },
  actionSection: { flexDirection: "row", gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: "center", borderWidth: 1.5,
  },
  approveBtn: { backgroundColor: "#f0fdf4", borderColor: "#10b981" },
  returnBtn: { backgroundColor: "#fffbeb", borderColor: "#f59e0b" },
  rejectBtn: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  actionBtnText: { fontSize: 13, fontWeight: "700" },
  emptyText: { color: "#94a3b8", fontSize: 14 },
  attachmentItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  attachmentIcon: { fontSize: 16 },
  attachmentName: { flex: 1, color: "#475569", fontSize: 13, fontWeight: "600" },
  attachmentPreview: { fontSize: 16 },
  fieldLabel: { color: "#64748b", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  dropdownBtn: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#f8fafc",
  },
  dropdownBtnText: { color: "#0f172a", fontSize: 14, fontWeight: "600" },
  dropdownPlaceholder: { color: "#94a3b8", fontWeight: "400" },
  dropdownArrow: { color: "#64748b", fontSize: 14 },
  dropdownList: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    marginTop: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemActive: { backgroundColor: "#eff6ff" },
  dropdownItemText: { color: "#475569", fontSize: 14 },
  dropdownItemTextActive: { color: "#2563eb", fontWeight: "700" as const },
  remarksInput: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12,
    padding: 12, backgroundColor: "#f8fafc", minHeight: 100,
  },
  remarksInputText: { color: "#0f172a", fontSize: 14, lineHeight: 20 },
  confirmBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#2563eb", alignItems: "center",
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  confirmBtnDisabled: { backgroundColor: "#94a3b8" },
  confirmBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  amountDisplay: {
    backgroundColor: "#eff6ff", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(37,99,235,0.2)",
  },
  amountDisplayText: { color: "#2563eb", fontSize: 16, fontWeight: "800" },
  verifyInput: {
    borderWidth: 1.5, borderColor: "#0891b2", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    color: "#0891b2", fontSize: 16, fontWeight: "800",
    backgroundColor: "#ecfeff", marginTop: 4,
  },
});