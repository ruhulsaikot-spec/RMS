import { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Animated, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { apiClient } from "../../../src/lib/api-client";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

// Floating Label Input Component
function FloatingInput({
  label, value, onChangeText, placeholder, keyboardType, multiline, numberOfLines,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const labelStyle = {
    position: "absolute" as const,
    left: 16,
    top: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [16, -8] }),
    fontSize: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [14, 11] }),
    color: animatedValue.interpolate({ inputRange: [0, 1], outputRange: ["#94a3b8", "#2563eb"] }),
    backgroundColor: "#fff",
    paddingHorizontal: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }),
    zIndex: 1,
  };

  return (
    <View style={floatStyles.wrapper}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          floatStyles.input,
          multiline && { height: numberOfLines ? numberOfLines * 24 + 28 : 100, textAlignVertical: "top" },
          isFocused && floatStyles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholder={isFocused ? placeholder : ""}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

const floatStyles = StyleSheet.create({
  wrapper: { position: "relative", marginBottom: 16 },
  input: {
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14,
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14,
    fontSize: 14, color: "#0f172a", backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  inputFocused: {
    borderColor: "#2563eb",
    shadowColor: "#2563eb", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
});

// Custom Date Picker
const SCREEN_WIDTH = Dimensions.get("window").width;
const MODAL_PADDING = 20;
const CELL_SIZE = Math.floor((SCREEN_WIDTH * 0.75 - 24) / 7);

function DatePickerModal({
  visible, value, onClose, onSelect,
}: {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(value ? parseInt(value.split("-")[0]) : today.getFullYear());
  const [month, setMonth] = useState(value ? parseInt(value.split("-")[1]) - 1 : today.getMonth());

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const selectedDay = value && parseInt(value.split("-")[0]) === year && parseInt(value.split("-")[1]) - 1 === month
    ? parseInt(value.split("-")[2]) : null;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (!visible) return null;

  // Build calendar rows
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={dpStyles.overlay}>
      <View style={dpStyles.modal}>
        {/* Month/Year Header */}
        <View style={dpStyles.header}>
          <TouchableOpacity onPress={prevMonth} style={dpStyles.navBtn}>
            <Text style={dpStyles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={dpStyles.headerText}>{months[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={dpStyles.navBtn}>
            <Text style={dpStyles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Labels */}
        <View style={dpStyles.row}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <View key={d} style={dpStyles.cell}>
              <Text style={dpStyles.dayLabel}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Rows */}
        {rows.map((row, ri) => (
          <View key={ri} style={dpStyles.row}>
            {row.map((day, di) => (
              <TouchableOpacity
                key={di}
                style={[dpStyles.cell, day === selectedDay && dpStyles.selectedCell]}
                onPress={() => {
                  if (day) {
                    const d = String(day).padStart(2, "0");
                    const m = String(month + 1).padStart(2, "0");
                    onSelect(`${year}-${m}-${d}`);
                    onClose();
                  }
                }}
                disabled={!day}
              >
                <Text style={[
                  dpStyles.dayText,
                  day === selectedDay && dpStyles.selectedDayText,
                  !day && { opacity: 0 },
                ]}>
                  {day ?? ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Cancel */}
        <TouchableOpacity style={dpStyles.cancelBtn} onPress={onClose}>
          <Text style={dpStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const dpStyles = StyleSheet.create({
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 24,
    padding: 12,
    width: SCREEN_WIDTH * 0.75,
    shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
  },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
    overflow: "visible",
  },
  headerText: { color: "#0f172a", fontSize: 16, fontWeight: "800" },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center",
  },
  navBtnText: { color: "#2563eb", fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "space-around" },
  cell: {
    flex: 1, height: 40,
    justifyContent: "center", alignItems: "center",
  },
  selectedCell: { backgroundColor: "#2563eb", borderRadius: 19 },
  dayLabel: { color: "#2563eb", fontSize: 10, fontWeight: "700" },
  dayText: { color: "#0f172a", fontSize: 14, fontWeight: "500" },
  selectedDayText: { color: "#fff", fontWeight: "800" },
  cancelBtn: {
    marginTop: 12, padding: 12, alignItems: "center",
    backgroundColor: "#f8fafc", borderRadius: 12,
  },
  cancelText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
});

const REIMBURSEMENT_TYPE_ID = "3d258f63-1532-4f30-b3e4-4d1331006b0e";

export default function NewClaimScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [expenseItems, setExpenseItems] = useState<any[]>([{
    id: Date.now(), expense_type_id: null, expense_type_name: "",
    amount: "", purpose: "", claim_date: new Date().toISOString().split("T")[0],
    mode: "", project_id: null, project_name: "", from_location: "", to_location: "",
  }]);

  useEffect(() => {
    loadExpenseTypes();
    loadProjects();
  }, []);

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, {
      id: Date.now(), expense_type_id: null, expense_type_name: "",
      amount: "", purpose: "", claim_date: new Date().toISOString().split("T")[0],
      mode: "", project_id: null, project_name: "", from_location: "", to_location: "",
    }]);
  };

  const removeExpenseItem = (id: number) => {
    if (expenseItems.length === 1) return;
    setExpenseItems(prev => prev.filter(item => item.id !== id));
  };

  const updateExpenseItem = (id: number, field: string, value: any) => {
    setExpenseItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = expenseItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const loadExpenseTypes = async () => {
    try {
      const res = await apiClient.get("/expense-types/");
      setExpenseTypes(res.data || []);
    } catch (e) {}
  };

  const loadProjects = async () => {
    try {
      const res = await apiClient.get("/projects/");
      setProjects(res.data || []);
    } catch (e) {}
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Camera roll permission is required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadAttachment(result.assets[0].uri, result.assets[0].fileName || "image.jpg", "image/jpeg");
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.name.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
      const mimeType = mimeMap[ext] || asset.mimeType || "application/octet-stream";
      await uploadAttachment(asset.uri, asset.name, mimeType);
    }
  };

  const uploadAttachment = async (uri: string, name: string, mimeType: string) => {
    try {
      setUploadingAttachment(true);
      const token = await (await import("expo-secure-store")).getItemAsync("access_token");
      
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        type: mimeType,
        name: name,
      } as any);

      const response = await fetch("http://192.168.0.102:8000/api/files/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.detail || "Upload failed");
      }

      const data = await response.json();
      setAttachments(prev => [...prev, {
        id: data.id,
        name: data.original_name,
        storage_path: data.storage_path,
      }]);
    } catch (e: any) {
      console.log("Upload error:", e?.message);
      Alert.alert("Error", e?.message || "Failed to upload attachment");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter((a: any) => a.id !== id));
  };

  const handleSubmit = async (isDraft: boolean) => {
    const validItems = expenseItems.filter(item => item.expense_type_id && item.amount);
    if (validItems.length === 0) {
      Alert.alert("Error", "Please add at least one expense item with type and amount");
      return;
    }
    try {
      setSaving(true);
      const payload: any = {
        reimbursement_type_id: REIMBURSEMENT_TYPE_ID,
        requested_amount: totalAmount,
        remarks: remarks,
        expense_items: validItems.map((item: any) => ({
          claim_type: item.expense_type_id,
          amount: Number(item.amount),
          purpose: item.purpose,
          expense_date: item.claim_date,
          mode: item.mode || null,
          from_location: item.from_location || null,
          to_location: item.to_location || null,
          project: item.project_name || null,
        })),
        attachment_ids: attachments.map((a: any) => a.id),
      };
      const res = await apiClient.post("/reimbursements", payload);
      if (!isDraft) {
        await apiClient.post(`/reimbursements/${res.data.id}/submit`);
      }
      setExpenseItems([{
        id: Date.now(), expense_type_id: null, expense_type_name: "",
        amount: "", purpose: "", claim_date: new Date().toISOString().split("T")[0],
        mode: "", project_id: null, project_name: "", from_location: "", to_location: "",
      }]);
      setRemarks("");
      setAttachments([]);
      Alert.alert(
        "Success",
        isDraft ? "Claim saved as draft" : "Claim submitted successfully",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e: any) {
      console.log("Claim error:", JSON.stringify(e?.response?.data));
      Alert.alert("Error", e?.response?.data?.detail || e?.message || "Failed to save claim");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backIcon}>‹</Text>
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>New Claim</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>
      </View>

      {expenseItems.map(item => (
        <DatePickerModal
          key={item.id}
          visible={showDatePicker === item.id}
          value={item.claim_date}
          onClose={() => setShowDatePicker(null)}
          onSelect={(date) => updateExpenseItem(item.id, "claim_date", date)}
        />
      ))}

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Expense Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expense Items *</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>Total: ৳ {totalAmount.toLocaleString()}</Text>
            </View>
          </View>

          {expenseItems.map((item, index) => (
            <View key={item.id} style={styles.expenseItem}>
              <View style={styles.expenseItemHeader}>
                <Text style={styles.expenseItemNo}>Item {index + 1}</Text>
                {expenseItems.length > 1 && (
                  <TouchableOpacity onPress={() => removeExpenseItem(item.id)} style={styles.removeBtn}>
                    <Text style={styles.removeBtnText}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Expense Type */}
              <Text style={styles.fieldLabel}>Expense Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {expenseTypes.map((et) => (
                  <TouchableOpacity
                    key={et.id}
                    style={[styles.typeChip, item.expense_type_id === et.id && styles.typeChipActive]}
                    onPress={() => updateExpenseItem(item.id, "expense_type_id", et.id)}
                  >
                    <Text style={[styles.typeChipText, item.expense_type_id === et.id && styles.typeChipTextActive]}>
                      {et.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Amount & Date */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <FloatingInput
                    label="Amount *"
                    value={item.amount}
                    onChangeText={(text) => updateExpenseItem(item.id, "amount", text)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.halfField}>
                  <TouchableOpacity
                    style={styles.dateWrapper}
                    onPress={() => setShowDatePicker(item.id)}
                  >
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={[styles.dateInput, { paddingVertical: 0, color: item.claim_date ? "#0f172a" : "#94a3b8" }]}>
                      {item.claim_date
                        ? item.claim_date.split("-").reverse().join("-")
                        : "DD-MM-YYYY"}
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>

              {/* Purpose & Mode */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <FloatingInput
                    label="Purpose"
                    value={item.purpose}
                    onChangeText={(text) => updateExpenseItem(item.id, "purpose", text)}
                    placeholder="Purpose"
                  />
                </View>
                <View style={styles.halfField}>
                  <FloatingInput
                    label="Mode"
                    value={item.mode}
                    onChangeText={(text) => updateExpenseItem(item.id, "mode", text)}
                    placeholder="Mode"
                  />
                </View>
              </View>

              {/* From & To */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <FloatingInput
                    label="From"
                    value={item.from_location}
                    onChangeText={(text) => updateExpenseItem(item.id, "from_location", text)}
                    placeholder="From"
                  />
                </View>
                <View style={styles.halfField}>
                  <FloatingInput
                    label="To"
                    value={item.to_location}
                    onChangeText={(text) => updateExpenseItem(item.id, "to_location", text)}
                    placeholder="To"
                  />
                </View>
              </View>

              {/* Project Dropdown */}
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={styles.dropdownBtn}
                  onPress={() => setShowProjectDropdown(showProjectDropdown === item.id ? null : item.id)}
                >
                  <Text style={[styles.dropdownBtnText, !item.project_name && styles.dropdownPlaceholder]}>
                    {item.project_name || "Select Project (Optional)"}
                  </Text>
                  <Text style={styles.dropdownArrow}>▾</Text>
                </TouchableOpacity>
                {showProjectDropdown === item.id && (
                  <View style={styles.dropdownList}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateExpenseItem(item.id, "project_id", null);
                        updateExpenseItem(item.id, "project_name", "");
                        setShowProjectDropdown(null);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>None</Text>
                    </TouchableOpacity>
                    {projects.map((p: any) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.dropdownItem, item.project_id === p.id && styles.dropdownItemActive]}
                        onPress={() => {
                          updateExpenseItem(item.id, "project_id", p.id);
                          updateExpenseItem(item.id, "project_name", p.name);
                          setShowProjectDropdown(null);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, item.project_id === p.id && styles.dropdownItemTextActive]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addItemBtn} onPress={addExpenseItem}>
            <Text style={styles.addItemBtnText}>+ Add Another Item</Text>
          </TouchableOpacity>
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <View style={styles.attachmentBtns}>
            <TouchableOpacity style={styles.attachBtn} onPress={pickDocument} disabled={uploadingAttachment}>
              <Text style={styles.attachBtnIcon}>📎</Text>
              <Text style={styles.attachBtnText}>Add Document</Text>
            </TouchableOpacity>
            {uploadingAttachment && <ActivityIndicator color="#2563eb" />}
          </View>
          {attachments.length > 0 && (
            <View style={styles.attachmentList}>
              {attachments.map((att: any) => (
                <View key={att.id} style={styles.attachmentItem}>
                  <Text style={styles.attachmentIcon}>📄</Text>
                  <Text style={styles.attachmentName} numberOfLines={1}>{att.name}</Text>
                  <TouchableOpacity onPress={() => removeAttachment(att.id)}>
                    <Text style={styles.attachmentRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Remarks */}
        <View style={styles.section}>
          <FloatingInput
            label="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add any remarks..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Buttons */}
        <View style={[styles.btnRow, styles.section]}>
          <TouchableOpacity style={styles.draftBtn} onPress={() => handleSubmit(true)} disabled={saving}>
            <Text style={styles.draftBtnText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit →</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, gap: 16,
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
  title: { color: "#0f172a", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#64748b", fontSize: 13 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: "#0f172a", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  totalBadge: { 
    backgroundColor: "#2563eb", paddingHorizontal: 14, paddingVertical: 6, 
    borderRadius: 20, shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  totalText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  expenseItem: {
    backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 12,
    borderWidth: 0, 
    shadowColor: "#2563eb", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
    borderTopWidth: 3, borderTopColor: "#2563eb",
  },
  expenseItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  expenseItemNo: { color: "#0f172a", fontSize: 14, fontWeight: "700" },
  removeBtn: { backgroundColor: "#fef2f2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  removeBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  fieldLabel: { color: "#64748b", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "rgba(37,99,235,0.1)",
  },
  typeChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  typeChipText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  typeChipTextActive: { color: "#fff" },
  row: { flexDirection: "row", gap: 10 },
  halfField: { flex: 1 },
  dateWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: "#e2e8f0", gap: 8, marginBottom: 16,
  },
  dateIcon: { fontSize: 16 },
  dateInput: { flex: 1, color: "#0f172a", fontSize: 13, fontWeight: "600" },
  dropdownWrapper: { marginBottom: 16 },
  dropdownBtn: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff",
  },
  dropdownBtnText: { color: "#0f172a", fontSize: 14, fontWeight: "600" },
  dropdownPlaceholder: { color: "#94a3b8", fontWeight: "400" },
  dropdownArrow: { color: "#64748b", fontSize: 14 },
  dropdownList: {
    backgroundColor: "#fff", borderRadius: 14,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 10, marginTop: 4,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemActive: { backgroundColor: "#eff6ff" },
  dropdownItemText: { color: "#475569", fontSize: 14 },
  dropdownItemTextActive: { color: "#2563eb", fontWeight: "700" },
  addItemBtn: {
    borderWidth: 2, borderColor: "#2563eb", borderStyle: "dashed",
    borderRadius: 16, padding: 16, alignItems: "center",
    backgroundColor: "rgba(37,99,235,0.03)",
    flexDirection: "row", justifyContent: "center", gap: 8,
  },
  addItemBtnText: { color: "#2563eb", fontSize: 14, fontWeight: "700" },
  attachmentBtns: { flexDirection: "row", gap: 12, marginBottom: 12 },
  attachBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: "rgba(37,99,235,0.15)",
  },
  attachBtnIcon: { fontSize: 20 },
  attachBtnText: { color: "#2563eb", fontSize: 13, fontWeight: "700" },
  attachmentList: { gap: 8 },
  attachmentItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "rgba(37,99,235,0.1)",
  },
  attachmentIcon: { fontSize: 16 },
  attachmentName: { flex: 1, color: "#0f172a", fontSize: 13, fontWeight: "600" },
  attachmentRemove: { color: "#ef4444", fontSize: 16, fontWeight: "700", padding: 4 },
  btnRow: { flexDirection: "row", gap: 12 },
  draftBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: "#fff",
    alignItems: "center", borderWidth: 1.5, borderColor: "#2563eb",
  },
  draftBtnText: { color: "#2563eb", fontSize: 15, fontWeight: "700" },
  submitBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 16, backgroundColor: "#2563eb",
    alignItems: "center", shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
    flexDirection: "row", justifyContent: "center", gap: 8,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
});