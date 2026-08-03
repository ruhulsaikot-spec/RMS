import { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, Animated, Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BackHandler } from "react-native";
import { apiClient } from "../../../src/lib/api-client";
import * as DocumentPicker from "expo-document-picker";

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
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return (
    <View style={dpStyles.overlay}>
      <View style={dpStyles.modal}>
        <View style={dpStyles.header}>
          <TouchableOpacity onPress={prevMonth} style={dpStyles.navBtn}>
            <Text style={dpStyles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={dpStyles.headerText}>{months[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={dpStyles.navBtn}>
            <Text style={dpStyles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={dpStyles.row}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <View key={d} style={dpStyles.cell}>
              <Text style={dpStyles.dayLabel}>{d}</Text>
            </View>
          ))}
        </View>
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
                <Text style={[dpStyles.dayText, day === selectedDay && dpStyles.selectedDayText, !day && { opacity: 0 }]}>
                  {day ?? ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 20, padding: 16,
    width: SCREEN_WIDTH * 0.85,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 20, color: "#2563eb", fontWeight: "700" },
  headerText: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  row: { flexDirection: "row" },
  cell: { width: CELL_SIZE, height: CELL_SIZE, justifyContent: "center", alignItems: "center" },
  dayLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600" },
  dayText: { fontSize: 13, color: "#0f172a" },
  selectedCell: { backgroundColor: "#2563eb", borderRadius: CELL_SIZE / 2 },
  selectedDayText: { color: "#fff", fontWeight: "700" },
  cancelBtn: { marginTop: 12, padding: 10, alignItems: "center" },
  cancelText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
});

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  DRAFT: { text: "#64748b", bg: "#f1f5f9" },
  SUBMITTED: { text: "#2563eb", bg: "#eff6ff" },
  IN_APPROVAL: { text: "#8b5cf6", bg: "#f5f3ff" },
  VERIFIED: { text: "#0891b2", bg: "#ecfeff" },
  PAID: { text: "#10b981", bg: "#f0fdf4" },
  REJECTED: { text: "#ef4444", bg: "#fef2f2" },
  RETURNED: { text: "#f59e0b", bg: "#fffbeb" },
};

function FloatingInput({
  label, value, onChangeText, placeholder, keyboardType, multiline, numberOfLines,
}: {
  label: string; value: string;
  onChangeText: (text: string) => void;
  placeholder?: string; keyboardType?: any;
  multiline?: boolean; numberOfLines?: number;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) Animated.timing(animatedValue, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const labelStyle = {
    position: "absolute" as const, left: 16,
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
  inputFocused: { borderColor: "#2563eb", shadowColor: "#2563eb", shadowOpacity: 0.12, elevation: 4 },
});

const REIMBURSEMENT_TYPE_ID = "3d258f63-1532-4f30-b3e4-4d1331006b0e";

export default function ClaimEditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState<number | null>(null);
  const [showExpenseTypeSheet, setShowExpenseTypeSheet] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [expenseItems, setExpenseItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadToken();
  }, [id]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(app)/claims" as any);
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const loadToken = async () => {
    const SecureStore = await import("expo-secure-store");
    const token = await SecureStore.getItemAsync("access_token");
    setAuthToken(token);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/jpg", "image/png",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = asset.name.split(".").pop()?.toLowerCase() || "";
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg",
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
      // Get fresh token each time
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("access_token");
      console.log("Uploading...", uri, mimeType, name);
      console.log("Token:", !!token);

      const uploadWithRetry = async (retries = 2): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "http://192.168.0.102:8000/api/files/upload");
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error("Upload failed: " + xhr.responseText));
            }
          };
          xhr.onerror = async () => {
            if (retries > 0) {
              console.log("Retrying upload...", retries);
              await new Promise(r => setTimeout(r, 500));
              uploadWithRetry(retries - 1).then(resolve).catch(reject);
            } else {
              reject(new Error("Network error"));
            }
          };
          xhr.ontimeout = () => reject(new Error("Timeout"));
          xhr.timeout = 30000;

          const formData = new FormData();
          formData.append("file", { uri, type: mimeType, name } as any);
          xhr.send(formData);
        });
      };

      const data = await uploadWithRetry();

      setAttachments(prev => [...prev, {
        id: data.id,
        name: data.original_name || name,
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

  useEffect(() => {
    console.log("expenseItems updated:", expenseItems.length);
  }, [expenseItems]);

  const loadData = async () => {
    try {
      console.log("Loading claim ID:", id);
      const claimRes = await apiClient.get(`/reimbursements/${id}`);
      console.log("Claim loaded OK");
      const typesRes = await apiClient.get("/expense-types/");
      console.log("Types loaded OK");
      const projectsRes = await apiClient.get("/projects/");
      console.log("Projects loaded OK");
      
      const claimData = claimRes.data;
      console.log("Step 1: claimData assigned");
      
      setClaim(claimData);
      console.log("Step 2: setClaim done");
      
      setRemarks(claimData?.data?.remarks || "");
      console.log("Step 3: setRemarks done");

      const projectList = projectsRes.data || [];
      setProjects(projectList);
      console.log("Step 4: setProjects done");

      const projectMap: Record<string, string> = {};
      try {
        (projectList || []).forEach((p: any) => {
          if (p && p.id) projectMap[p.id] = p.name;
        });
      } catch (mapErr) {
        console.log("Project map error:", mapErr);
      }
      console.log("Step 5: projectMap done");

      setExpenseTypes(typesRes.data || []);
      console.log("Step 6: setExpenseTypes done");

      if (claimData.expense_items && claimData.expense_items.length > 0) {
        console.log("Step 7: setting expense items");
        setExpenseItems((claimData.expense_items || []).map((item: any, i: number) => {
          const projectName = item?.project ? (projectMap[item.project] || item.project) : "";
          return {
            id: i,
            expense_type_id: item?.claim_type || null,
            amount: String(item?.amount || ""),
            purpose: item?.purpose || "",
            mode: item?.mode || "",
            from_location: item?.from_location || "",
            to_location: item?.to_location || "",
            project_id: null,
            project_name: projectName,
            claim_date: item?.expense_date || new Date().toISOString().split("T")[0],
            claim_date_display: item?.expense_date
              ? item.expense_date.split("-").reverse().join("/") : "",
            attachments: (claimData.attachments || [])
              .filter((att: any) => att.expense_item_order === i)
              .map((att: any) => ({ id: att.id, original_name: att.file_name, storage_path: att.file_url, isExisting: true })),
          };
        }));
        console.log("Step 8: expense items set");
      }

      if (claimData.attachments && Array.isArray(claimData.attachments)) {
        setAttachments(claimData.attachments.map((att: any) => ({
          id: att.id || "", name: att.file_name || "attachment", existing: true,
        })));
        console.log("Step 9: attachments set");
      }

      return; // Skip old code below
    } catch (e: any) {
      console.log("Load error:", JSON.stringify(e?.response?.data), e?.message);
      Alert.alert("Error", e?.response?.data?.detail || e?.message || "Failed to load claim");
    } finally {
      setLoading(false);
    }
  };

  const addExpenseItem = () => {
    setExpenseItems(prev => [...prev, {
      id: Date.now(), expense_type_id: null, amount: "",
      purpose: "", mode: "", from_location: "", to_location: "",
      project_id: null, project_name: "",
      claim_date: new Date().toISOString().split("T")[0], claim_date_display: "",
      attachments: [],
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

  const uploadItemAttachment = async (asset: any, itemId: number) => {
    const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = asset.fileName || `upload.${fileExt}`;
    const mimeType = asset.mimeType || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
    try {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("access_token");
      const currentToken = token || (apiClient.defaults.headers.common?.["Authorization"] as string)?.replace("Bearer ", "");
      const doUpload = () => new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiClient.defaults.baseURL}/files/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${currentToken}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Timeout"));
        xhr.timeout = 30000;
        const fd = new FormData();
        fd.append("file", { uri: asset.uri, type: mimeType, name: fileName } as any);
        xhr.send(fd);
      });
      let uploadData;
      try { uploadData = await doUpload(); }
      catch { await new Promise(r => setTimeout(r, 2000)); uploadData = await doUpload(); }
      if (uploadData.id) {
        setExpenseItems(prev => prev.map(i =>
          i.id === itemId
            ? { ...i, attachments: [...(i.attachments || []), { id: uploadData.id, original_name: fileName, storage_path: uploadData.storage_path }] }
            : i
        ));
      }
    } catch (e: any) {
      Alert.alert("Error", "File upload failed: " + (e?.message || "unknown"));
    }
  };

  const uploadDocumentAttachment = async (doc: any, itemId: number) => {
    const fileName = doc.name || "document";
    const mimeType = doc.mimeType || "application/octet-stream";
    try {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("access_token");
      const currentToken = token || (apiClient.defaults.headers.common?.["Authorization"] as string)?.replace("Bearer ", "");
      const doUpload = () => new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiClient.defaults.baseURL}/files/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${currentToken}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Timeout"));
        xhr.timeout = 30000;
        const fd = new FormData();
        fd.append("file", { uri: doc.uri, type: mimeType, name: fileName } as any);
        xhr.send(fd);
      });
      let uploadData;
      try { uploadData = await doUpload(); }
      catch { await new Promise(r => setTimeout(r, 2000)); uploadData = await doUpload(); }
      if (uploadData.id) {
        setExpenseItems(prev => prev.map(i =>
          i.id === itemId
            ? { ...i, attachments: [...(i.attachments || []), { id: uploadData.id, original_name: fileName, storage_path: uploadData.storage_path }] }
            : i
        ));
      }
    } catch (e: any) {
      Alert.alert("Error", "File upload failed: " + (e?.message || "unknown"));
    }
  };

  const handleSave = async (isDraft: boolean) => {
    const validItems = expenseItems.filter(item => item.expense_type_id && item.amount);
    if (validItems.length === 0) {
      Alert.alert("Error", "Please add at least one expense item");
      return;
    }
    if (!isDraft) {
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const row = i + 1;
        if (!item.claim_date) { Alert.alert("Error", `Item ${row}: Date is required`); return; }
        if (!item.purpose) { Alert.alert("Error", `Item ${row}: Purpose is required`); return; }
        if (!item.attachments || item.attachments.length === 0) { Alert.alert("Error", `Item ${row}: Attachment is required`); return; }
      }
    }
    // Validate amount against workflow
    try {
      const expenseTypeIds = [...new Set(validItems.map((i: any) => i.expense_type_id).filter(Boolean))];
      const wfRes = await apiClient.get(`/workflow/match?amount=0&expense_type_ids=${expenseTypeIds.join(",")}`);
      const wf = wfRes.data;
      if (wf?.max_amount !== null && wf?.max_amount !== undefined && totalAmount > wf.max_amount) {
        Alert.alert("Error", `Total amount ৳${totalAmount.toLocaleString()} exceeds the maximum allowed amount of ৳${wf.max_amount.toLocaleString()} for "${wf.name}" workflow.`);
        return;
      }
    } catch {}

    try {
      setSaving(true);
      const payload = {
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
        attachment_ids: validItems.flatMap((item: any, idx: number) =>
          (item.attachments || [])
            .filter((att: any) => !att.isExisting)
            .map((att: any) => ({ id: att.id, expense_item_order: idx }))
        ),
        existing_attachment_paths: validItems.flatMap((item: any, idx: number) =>
          (item.attachments || [])
            .filter((att: any) => att.isExisting)
            .map((att: any) => ({ file_name: att.original_name, file_path: att.storage_path, expense_item_order: idx }))
        ),
      };

      await apiClient.put(`/reimbursements/${id}`, payload);

      if (!isDraft) {
        await apiClient.post(`/reimbursements/${id}/submit`);
      }

      Alert.alert("Success", isDraft ? "Claim updated" : "Claim resubmitted successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to save claim");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const statusStyle = claim ? STATUS_COLORS[claim.status] || STATUS_COLORS.DRAFT : STATUS_COLORS.DRAFT;
  const canEdit = claim && ["DRAFT", "RETURNED"].includes(claim.status);

  return (
    <View style={styles.container}>
      <View style={styles.topGlow} />
      <View style={styles.topGlow2} />

      {/* Expense Type Bottom Sheet */}
      {showExpenseTypeSheet !== null && (
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 200,
          justifyContent: "flex-end",
        }}>
          <View style={{
            backgroundColor: "#fff", borderRadius: 24, padding: 20,
            maxHeight: "70%",
          }}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
              <Text style={{fontSize: 16, fontWeight: "800", color: "#0f172a"}}>Select Expense Type</Text>
              <TouchableOpacity onPress={() => setShowExpenseTypeSheet(null)}>
                <Text style={{fontSize: 18, color: "#94a3b8"}}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(() => {
                const itemWidth = (Dimensions.get("window").width - 40 - 24) / 4;
                const rows = [];
                for (let i = 0; i < expenseTypes.length; i += 4) {
                  rows.push(expenseTypes.slice(i, i + 4));
                }
                return rows.map((row, rowIdx) => (
                  <View key={rowIdx} style={{flexDirection: "row", gap: 6, marginBottom: 6}}>
                    {row.map((et: any) => {
                      const icons: any = {
                        "Transport": "🚗", "Food": "🍽️", "Medical": "🏥",
                        "Mobile": "📱", "Fuel": "⛽", "Accommodation": "🏨",
                        "Rent": "🏠", "Travel": "✈️", "Birthday Cake": "🎂", "Other": "📋"
                      };
                      const isSelected = expenseItems.find(i => i.id === showExpenseTypeSheet)?.expense_type_id === et.id;
                      return (
                        <TouchableOpacity
                          key={et.id}
                          style={{
                            width: itemWidth, padding: 10, borderRadius: 14,
                            borderWidth: 2,
                            borderColor: isSelected ? "#7c3aed" : "#e2e8f0",
                            backgroundColor: isSelected ? "#f5f3ff" : "#f8fafc",
                            alignItems: "center", gap: 4,
                          }}
                          onPress={() => {
                            updateExpenseItem(showExpenseTypeSheet, "expense_type_id", et.id);
                            setShowExpenseTypeSheet(null);
                          }}
                        >
                          <Text style={{fontSize: 22}}>{icons[et.name] || "📋"}</Text>
                          <Text style={{
                            fontSize: 10, fontWeight: "600",
                            color: isSelected ? "#7c3aed" : "#374151",
                            textAlign: "center"
                          }}>{et.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ));
              })()}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Text style={styles.backIcon}>‹</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{claim?.application_no}</Text>
          <Text style={styles.subtitle}>Edit Claim</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{claim?.status}</Text>
        </View>
      </View>

      {!canEdit ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>This claim cannot be edited</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Expense Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expense Items *</Text>
              <View style={styles.totalBadge}>
                <Text style={styles.totalText}>Total: ৳ {totalAmount.toLocaleString()}</Text>
              </View>
            </View>

            {expenseItems.length === 0 ? (
              <Text style={{ color: "red" }}>No items</Text>
            ) : null}
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
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: item.expense_type_id ? "#7c3aed" : "#e2e8f0",
                    borderRadius: 14, padding: 14, marginBottom: 16,
                    backgroundColor: item.expense_type_id ? "#f5f3ff" : "#f8fafc",
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center"
                  }}
                  onPress={() => setShowExpenseTypeSheet(item.id)}
                >
                  <Text style={{
                    fontSize: 14, fontWeight: item.expense_type_id ? "600" : "400",
                    color: item.expense_type_id ? "#7c3aed" : "#94a3b8"
                  }}>
                    {item.expense_type_id ? expenseTypes.find(et => et.id === item.expense_type_id)?.name : "Select Expense Type"}
                  </Text>
                  <Text style={{fontSize: 16, color: "#7c3aed"}}>▼</Text>
                </TouchableOpacity>

                {/* Amount & Date */}
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <FloatingInput
                      label="Amount *" value={item.amount}
                      onChangeText={(text) => updateExpenseItem(item.id, "amount", text)}
                      placeholder="0.00" keyboardType="decimal-pad"
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
                    <FloatingInput label="Purpose" value={item.purpose}
                      onChangeText={(text) => updateExpenseItem(item.id, "purpose", text)} placeholder="Purpose" />
                  </View>
                  <View style={styles.halfField}>
                    <FloatingInput label="Mode" value={item.mode}
                      onChangeText={(text) => updateExpenseItem(item.id, "mode", text)} placeholder="Mode" />
                  </View>
                </View>

                {/* From & To */}
                <View style={styles.row}>
                  <View style={styles.halfField}>
                    <FloatingInput label="From" value={item.from_location}
                      onChangeText={(text) => updateExpenseItem(item.id, "from_location", text)} placeholder="From" />
                  </View>
                  <View style={styles.halfField}>
                    <FloatingInput label="To" value={item.to_location}
                      onChangeText={(text) => updateExpenseItem(item.id, "to_location", text)} placeholder="To" />
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
                      <TouchableOpacity style={styles.dropdownItem}
                        onPress={() => { updateExpenseItem(item.id, "project_id", null); updateExpenseItem(item.id, "project_name", ""); setShowProjectDropdown(null); }}>
                        <Text style={styles.dropdownItemText}>None</Text>
                      </TouchableOpacity>
                      {projects.map((p: any) => (
                        <TouchableOpacity key={p.id}
                          style={[styles.dropdownItem, item.project_id === p.id && styles.dropdownItemActive]}
                          onPress={() => { updateExpenseItem(item.id, "project_id", p.id); updateExpenseItem(item.id, "project_name", p.name); setShowProjectDropdown(null); }}>
                          <Text style={[styles.dropdownItemText, item.project_id === p.id && styles.dropdownItemTextActive]}>{p.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                {/* Item Attachment */}
                <View style={{marginTop: 8, marginBottom: 8}}>
                  <Text style={styles.fieldLabel}>Attachment *</Text>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: item.attachments?.length > 0 ? "#16a34a" : "#e2e8f0",
                      borderRadius: 14, padding: 14, marginBottom: 8,
                      backgroundColor: item.attachments?.length > 0 ? "#f0fdf4" : "#f8fafc",
                      flexDirection: "row", alignItems: "center", gap: 8,
                    }}
                    onPress={async () => {
                      const ImagePicker = await import("expo-image-picker");
                      Alert.alert(
                        "Upload Attachment",
                        "Choose source",
                        [
                          {
                            text: "Camera",
                            onPress: async () => {
                              const perm = await ImagePicker.requestCameraPermissionsAsync();
                              if (!perm.granted) { Alert.alert("Permission", "Camera permission required"); return; }
                              const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: false });
                              if (!result.canceled && result.assets[0]) {
                                await uploadItemAttachment(result.assets[0], item.id);
                              }
                            }
                          },
                          {
                            text: "Gallery",
                            onPress: async () => {
                              const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.All,
                                quality: 0.5,
                                base64: false,
                              });
                              if (!result.canceled && result.assets[0]) {
                                await uploadItemAttachment(result.assets[0], item.id);
                              }
                            }
                          },
                          {
                            text: "File",
                            onPress: async () => {
                              const DocumentPicker = await import("expo-document-picker");
                              const result = await DocumentPicker.getDocumentAsync({
                                type: ["application/pdf", "image/*", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
                                copyToCacheDirectory: true,
                              });
                              if (!result.canceled && result.assets[0]) {
                                await uploadDocumentAttachment(result.assets[0], item.id);
                              }
                            }
                          },
                          { text: "Cancel", style: "cancel" }
                        ]
                      );
                    }}
                  >
                    <Text style={{fontSize: 16}}>📎</Text>
                    <Text style={{fontSize: 13, color: item.attachments?.length > 0 ? "#16a34a" : "#94a3b8", fontWeight: "500"}}>
                      {item.attachments?.length > 0 ? `${item.attachments.length} file(s) attached` : "Upload Attachment"}
                    </Text>
                  </TouchableOpacity>
                  {item.attachments?.length > 0 && (
                    <View style={{gap: 4}}>
                      {item.attachments.map((att: any, i: number) => (
                        <View key={i} style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10}}>
                          <Text style={{fontSize: 12, color: "#374151", flex: 1}} numberOfLines={1}>{att.original_name}</Text>
                          <TouchableOpacity onPress={() => {
                            const updated = item.attachments.filter((_: any, idx: number) => idx !== i);
                            updateExpenseItem(item.id, "attachments", updated);
                          }}>
                            <Text style={{fontSize: 12, color: "#ef4444", marginLeft: 8}}>✕</Text>
                          </TouchableOpacity>
                        </View>
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

          {/* Attachments - hidden, now item wise */}

          {/* Remarks */}
          <View style={styles.section}>
            <FloatingInput label="Remarks" value={remarks} onChangeText={setRemarks}
              placeholder="Add any remarks..." multiline numberOfLines={4} />
          </View>

          {/* Buttons */}
          <View style={[styles.btnRow, styles.section]}>
            <TouchableOpacity style={styles.draftBtn} onPress={() => handleSave(true)} disabled={saving}>
              <Text style={styles.draftBtnText}>Save Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={() => handleSave(false)} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Resubmit →</Text>}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
      {/* Date Picker Modal */}
      {showDatePicker !== null && (
        <DatePickerModal
          visible={true}
          value={expenseItems.find(i => i.id === showDatePicker)?.claim_date || ""}
          onClose={() => setShowDatePicker(null)}
          onSelect={(date) => {
            updateExpenseItem(showDatePicker, "claim_date", date);
            setShowDatePicker(null);
          }}
        />
      )}
    </View>
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
  backBtn: { shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
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
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: "#0f172a", fontSize: 14, fontWeight: "700", marginBottom: 8 },
  totalBadge: { backgroundColor: "#2563eb", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  totalText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  expenseItem: {
    backgroundColor: "#fff", borderRadius: 20, padding: 18, marginBottom: 12,
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
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
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
    borderWidth: 1.5, borderColor: "#e2e8f0", marginTop: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  dropdownItemActive: { backgroundColor: "#eff6ff" },
  dropdownItemText: { color: "#475569", fontSize: 14 },
  dropdownItemTextActive: { color: "#2563eb", fontWeight: "700" },
  addItemBtn: {
    borderWidth: 2, borderColor: "#2563eb", borderStyle: "dashed",
    borderRadius: 16, padding: 16, alignItems: "center",
    backgroundColor: "rgba(37,99,235,0.03)",
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
    flex: 2, paddingVertical: 16, borderRadius: 14, backgroundColor: "#2563eb",
    alignItems: "center", shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  emptyText: { color: "#94a3b8", fontSize: 14 },
});