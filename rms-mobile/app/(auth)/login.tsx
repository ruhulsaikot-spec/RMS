import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/auth-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      await login(email.toLowerCase().trim(), password);
      router.replace("/(app)/dashboard");
    } catch (error: any) {
      console.log("Login error full:", JSON.stringify(error));
      const msg = error?.response?.data?.error?.detail || 
                  error?.response?.data?.detail ||
                  error?.message ||
                  error?.code ||
                  "Network Error";
      Alert.alert("Login Failed", `${msg}\n\nCode: ${error?.code || 'unknown'}`);
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RMS</Text>
          </View>
          <Text style={styles.title}>Reimbursement Management</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#4a6080"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030B1F" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: "#0891b2", justifyContent: "center",
    alignItems: "center", marginBottom: 16,
    shadowColor: "#0891b2", shadowOpacity: 0.5, shadowRadius: 20,
  },
  logoText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 6 },
  subtitle: { color: "#4a6080", fontSize: 14 },
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
  passwordContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12, marginBottom: 12,
  },
  passwordInput: { flex: 1, padding: 14, color: "#fff", fontSize: 14 },
  eyeButton: { padding: 14 },
  eyeText: { color: "#0891b2", fontSize: 12, fontWeight: "600" },
  forgotButton: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { color: "#0891b2", fontSize: 12 },
  loginButton: {
    backgroundColor: "#0891b2", borderRadius: 12,
    padding: 16, alignItems: "center",
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});