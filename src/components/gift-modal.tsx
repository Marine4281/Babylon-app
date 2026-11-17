// src/components/gift-modal.tsx
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BRAND } from "@/constants/brand";
import { GIFT_PRESETS } from "@/constants/gifts";

export type GiftPayload = { amount: number; comment: string };

type Props = {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onSend: (gift: GiftPayload) => Promise<void>;
};

const short = (n: number) => (n >= 1000 ? `${n / 1000}k` : String(n));

export default function GiftModal({ visible, balance, onClose, onSend }: Props) {
  const [selected, setSelected] = useState(GIFT_PRESETS[0].amount);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Start fresh every time the sheet opens
  useEffect(() => {
    if (visible) {
      setSelected(GIFT_PRESETS[0].amount);
      setComment("");
      setError("");
    }
  }, [visible]);

  const send = async () => {
    if (sending) return;
    if (selected > balance) {
      setError("Not enough coins. Top up your wallet to send this gift.");
      return;
    }
    setError("");
    setSending(true);
    try {
      await onSend({ amount: selected, comment: comment.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the gift. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="gift" size={20} color={BRAND.orange} />
              <Text style={styles.title}>Gift Creator</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={BRAND.gray400} />
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>Select coin gift</Text>
            <View style={styles.presetRow}>
              {GIFT_PRESETS.map((p) => {
                const active = p.amount === selected;
                return (
                  <Pressable
                    key={p.amount}
                    onPress={() => setSelected(p.amount)}
                    style={[styles.preset, active && styles.presetActive]}
                  >
                    <Text style={[styles.presetAmount, active && styles.presetAmountActive]}>
                      {short(p.amount)}
                    </Text>
                    <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Attached highlight comment</Text>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Say something nice (optional)"
              placeholderTextColor={BRAND.gray400}
              maxLength={200}
            />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Wallet balance:</Text>
              <View style={styles.balanceValue}>
                <FontAwesome5 name="coins" size={12} color={BRAND.amber500} />
                <Text style={styles.balanceText}>{balance.toLocaleString("en-US")} Coins</Text>
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.sendBtn, sending && { opacity: 0.6 }]}
              onPress={send}
              disabled={sending}
            >
              <Ionicons name="paper-plane" size={16} color={BRAND.white} />
              <Text style={styles.sendText}>
                {sending ? "Sending..." : `Send ${selected.toLocaleString("en-US")} Coins Gift`}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: BRAND.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.gray100,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "800", color: BRAND.gray900 },
  body: { padding: 16 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: BRAND.gray400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetRow: { flexDirection: "row", gap: 8 },
  preset: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BRAND.gray100,
    backgroundColor: BRAND.gray50,
  },
  presetActive: { borderColor: BRAND.amber400, backgroundColor: BRAND.amber50 },
  presetAmount: { fontSize: 14, fontWeight: "900", color: BRAND.gray800 },
  presetAmountActive: { color: BRAND.orange },
  presetLabel: { fontSize: 10, color: BRAND.gray400, marginTop: 2 },
  presetLabelActive: { color: BRAND.amber700, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderColor: BRAND.gray200,
    backgroundColor: BRAND.gray50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: BRAND.gray900,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BRAND.gray50,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  balanceLabel: { fontSize: 12, color: BRAND.gray500 },
  balanceValue: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceText: { fontSize: 12, fontWeight: "800", color: BRAND.gray900 },
  error: { color: "#DC2626", fontSize: 13, marginTop: 10 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND.orange,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  sendText: { color: BRAND.white, fontWeight: "800", fontSize: 15 },
});
