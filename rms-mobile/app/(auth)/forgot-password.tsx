import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../src/services/auth.service";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) { Alert.alert("Error", "Please enter your email"); return; }
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setStep("reset");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields"); return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match"); return;
    }
    try {
      setLoading(true);
      await authService.resetPassword(otp, newPassword, confirmPassword);
      Alert.alert("Success", "Password reset successfully", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          {step === "email" ? "Enter your email to receive OTP" : "Enter OTP and new password"}
        </Text>

        <View style={styles.form}>
          {step === "email" ? (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#4a6080"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>OTP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor="#4a6080"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#4a6080"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#4a6080"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030B1F" },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  backButton: { marginBottom: 24 },
  backText: { color: "#0891b2", fontSize: 14 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#4a6080", fontSize: 14, marginBottom: 32 },
  form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  label: { color: "#94a3b8", fontSize: 12, marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, padding: 14, color: "#fff",
    fontSize: 14, marginBottom: 16,
  },
  button: {
    backgroundColor: "#0891b2", borderRadius: 12,
    padding: 16, alignItems: "center", marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});