// src/app/(tabs)/index.tsx
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { sendGift } from "@/api/endpoints";
import AppHeader from "@/components/app-header";
import GiftModal, { type GiftPayload } from "@/components/gift-modal";
import PostCard from "@/components/post-card";
import { BRAND } from "@/constants/brand";
import { useFeed } from "@/hooks/use-feed";
import { useWallet } from "@/hooks/use-wallet";
import type { ApiPost } from "@/types/api";
import { getErrorMessage } from "@/utils/helpers";

export default function HomeScreen() {
  const feed = useFeed();
  const wallet = useWallet();

  const [giftPost, setGiftPost] = useState<ApiPost | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  // The feed and balance only change after the server confirms the gift
  const handleGift = async ({ amount, comment }: GiftPayload) => {
    if (!giftPost) return;
    try {
      const created = await sendGift(giftPost._id, amount, comment);
      feed.applyGift(giftPost._id, created);
      await wallet.refresh();
      showToast(`Gift sent: ${amount} coins 🎁`);
    } catch (err) {
      throw new Error(getErrorMessage(err, "Could not send the gift. Try again."));
    }
  };

  const onRefresh = () => {
    void feed.refresh();
    void wallet.refresh();
  };

  return (
    <View style={styles.screen}>
      <AppHeader balance={wallet.balance ?? 0} />

      {feed.loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BRAND.orange} />
        </View>
      ) : (
        <FlatList
          data={feed.posts}
          keyExtractor={(p) => p._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={() => feed.toggleLike(item)}
              onSave={() => feed.toggleSave(item)}
              onFollow={() => feed.toggleFollow(item.author._id, !!item.author.isFollowing)}
              onGift={() => setGiftPost(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={feed.refreshing}
              onRefresh={onRefresh}
              tintColor={BRAND.orange}
              colors={[BRAND.orange]}
            />
          }
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.6}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            feed.loadingMore ? (
              <ActivityIndicator color={BRAND.orange} style={styles.footer} />
            ) : (
              <View style={styles.footer} />
            )
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                {feed.error ? "Couldn't load your feed" : "No posts yet"}
              </Text>
              <Text style={styles.emptyText}>
                {feed.error || "When people share posts, they will show up here."}
              </Text>
              {feed.error ? (
                <Pressable style={styles.retryBtn} onPress={feed.retry}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          }
        />
      )}

      <GiftModal
        visible={giftPost !== null}
        balance={wallet.balance ?? 0}
        onClose={() => setGiftPost(null)}
        onSend={handleGift}
      />

      {toast ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BRAND.gray100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  footer: { height: 40, justifyContent: "center" },
  empty: { alignItems: "center", paddingHorizontal: 32, paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: BRAND.gray900 },
  emptyText: { fontSize: 14, color: BRAND.gray500, textAlign: "center" },
  retryBtn: {
    marginTop: 12,
    backgroundColor: BRAND.orange,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: BRAND.white, fontWeight: "800" },
  toast: {
    position: "absolute",
    alignSelf: "center",
    bottom: 24,
    backgroundColor: BRAND.gray900,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  toastText: { color: BRAND.white, fontSize: 12, fontWeight: "600" },
});
