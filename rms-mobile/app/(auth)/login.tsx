import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator, ScrollView, Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/auth-context";

const { width, height } = Dimensions.get("window");

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
      const status = error?.response?.status;
      if (status === 429) {
        Alert.alert("Too Many Attempts", "Please wait 1 minute and try again.");
      } else {
        const msg = error?.response?.data?.error?.detail ||
                    error?.response?.data?.detail ||
                    error?.message || "Invalid email or password";
        Alert.alert("Login Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.bgTop} />
      <View style={styles.bgGlow} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subtitleText}>Sign in to continue to your account</Text>

            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.signInButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <View style={styles.signInButtonInner}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                    <Text style={styles.signInArrow}>→</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerIcon}>🛡️</Text>
            <Text style={styles.footerText}>
              Your expenses.{" "}
              <Text style={styles.footerHighlight}>Organized. </Text>
              <Text style={styles.footerHighlight2}>Controlled.</Text>
            </Text>
            <Text style={styles.devText}>
              Developed by{" "}
              <Text style={styles.devLink}>Wyze Tech Ltd</Text>
              {" "}|{" "}
              <Text style={styles.devLink}>info@wyzetechltd.com</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#0a1628",
  },
  bgTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: height * 0.5,
    backgroundColor: "#0d1f4e",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  bgGlow: {
    position: "absolute",
    top: -100, right: -100,
    width: 400, height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(37,99,235,0.3)",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 100,
  },
  card: {
    backgroundColor: "#f0f4ff",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  welcomeText: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitleText: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 28,
  },
  label: {
    color: "#1e293b",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#0f172a",
    fontSize: 14,
  },
  eyeIcon: { fontSize: 16, padding: 4 },
  forgotButton: { alignSelf: "flex-end", marginTop: -10, marginBottom: 24 },
  forgotText: { color: "#2563eb", fontSize: 13, fontWeight: "600" },
  signInButton: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    overflow: "hidden",
  },
  signInButtonDisabled: { opacity: 0.6 },
  signInButtonInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  signInArrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  footerIcon: { fontSize: 28 },
  footerText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  footerHighlight: { color: "#0891b2", fontWeight: "700" },
  footerHighlight2: { color: "#10b981", fontWeight: "700" },
  devText: { color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center", marginTop: 24 },
  devLink: { color: "rgba(8,145,178,0.7)", fontWeight: "600" },
});