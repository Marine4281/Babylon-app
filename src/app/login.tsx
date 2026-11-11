// src/app/login.tsx
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "@/context/auth-context";

const ORANGE = "#FF6B00";

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await login({ identifier: identifier.trim(), password });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Could not reach the server. Check your connection."
        );
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.brand}>Babylon</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>

          <TextInput
            style={styles.input}
            placeholder="Email or phone number"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />
            <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={10}>
              <Text style={styles.showText}>{showPw ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, (busy || !identifier || !password) && styles.buttonDisabled]}
            onPress={submit}
            disabled={busy || !identifier || !password}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  brand: {
    fontSize: 40,
    fontWeight: "900",
    color: ORANGE,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  passwordInput: { flex: 1 },
  showText: { color: ORANGE, fontWeight: "700", fontSize: 13, marginBottom: 12 },
  error: { color: "#DC2626", fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
