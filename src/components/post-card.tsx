// src/components/post-card.tsx
import { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { BRAND } from "@/constants/brand";
import type { ApiPost } from "@/types/api";
import { flagEmoji, formatCount, isVideoUrl, timeAgo, videoThumb } from "@/utils/helpers";

type Props = {
  post: ApiPost;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onGift: () => void;
};

function Avatar({ uri, name, size }: { uri?: string; name: string; size: number }) {
  const round = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={round} />;
  return (
    <View style={[round, styles.avatarFallback]}>
      <Text style={{ color: BRAND.orange, fontWeight: "800", fontSize: size * 0.42 }}>
        {name.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

export default function PostCard({ post, onLike, onSave, onFollow, onGift }: Props) {
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);

  const lastTap = useRef(0);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const popHeart = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 400,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Double-tap only ever likes, it never unlikes
  const onMediaPress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!post.isLiked) onLike();
      popHeart();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  const author = post.author;
  const gift = post.topGiftComment;
  const longCaption = post.caption.length > 90;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Avatar uri={author.avatarUrl} name={author.username} size={40} />
          <View style={styles.flexShrink}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{author.username}</Text>
              {flagEmoji(author.countryCode) ? (
                <Text style={styles.flag}>{flagEmoji(author.countryCode)}</Text>
              ) : null}
              {author.isVerified ? (
                <Ionicons name="checkmark-circle" size={14} color={BRAND.orange} />
              ) : null}
            </View>
            <Text style={styles.meta}>{timeAgo(post.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {!post.isOwn ? (
            <Pressable
              onPress={onFollow}
              style={[styles.followBtn, author.isFollowing && styles.followingBtn]}
            >
              <Text style={[styles.followText, author.isFollowing && styles.followingText]}>
                {author.isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
          ) : null}
          <Pressable hitSlop={8} style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={BRAND.gray400} />
          </Pressable>
        </View>
      </View>

      {/* Media carousel */}
      {post.media.length > 0 ? (
        <View>
          <FlatList
            data={post.media}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(url, i) => `${url}-${i}`}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) =>
              setMediaIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => {
              const video = isVideoUrl(item);
              return (
                <Pressable onPress={onMediaPress}>
                  <Image
                    source={{ uri: video ? videoThumb(item) : item }}
                    style={{ width, aspectRatio: 1, backgroundColor: BRAND.gray100 }}
                    contentFit="cover"
                  />
                  {video ? (
                    <View style={styles.playBadge}>
                      <Ionicons name="play" size={26} color={BRAND.gray900} />
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />

          {post.media.length > 1 ? (
            <View style={styles.pager}>
              <Text style={styles.pagerText}>
                {mediaIndex + 1}/{post.media.length}
              </Text>
            </View>
          ) : null}

          {post.giftTotal > 0 ? (
            <View style={styles.giftChip}>
              <FontAwesome5 name="coins" size={11} color="#FCD34D" />
              <Text style={styles.giftChipText}>{formatCount(post.giftTotal)} gifted</Text>
            </View>
          ) : null}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.bigHeart,
              { opacity: heartOpacity, transform: [{ scale: heartScale }] },
            ]}
          >
            <Ionicons name="heart" size={96} color={BRAND.white} />
          </Animated.View>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Pressable style={styles.actionBtn} onPress={onLike}>
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={26}
              color={post.isLiked ? BRAND.red : BRAND.gray700}
            />
            <Text style={styles.actionCount}>{formatCount(post.likesCount)}</Text>
          </Pressable>
          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={24} color={BRAND.gray700} />
            <Text style={styles.actionCount}>{formatCount(post.commentsCount)}</Text>
          </View>
        </View>

        <View style={styles.actionsRight}>
          {!post.isOwn ? (
            <Pressable style={styles.giftBtn} onPress={onGift}>
              <Ionicons name="gift" size={15} color={BRAND.white} />
              <Text style={styles.giftBtnText}>Gift</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.actionBtn} onPress={onSave}>
            <Ionicons
              name={post.isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={BRAND.gray900}
            />
          </Pressable>
        </View>
      </View>

      {/* Caption + top gift */}
      <View style={styles.footer}>
        {post.caption ? (
          <>
            <Text style={styles.caption} numberOfLines={expanded ? undefined : 2}>
              <Text style={styles.captionUser}>{author.username} </Text>
              {post.caption}
            </Text>
            {longCaption ? (
              <Pressable onPress={() => setExpanded((v) => !v)}>
                <Text style={styles.more}>{expanded ? "less" : "more"}</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}

        {gift ? (
          <View style={styles.giftRow}>
            <Avatar uri={gift.author?.avatarUrl} name={gift.author?.username ?? "?"} size={28} />
            <View style={styles.flexOne}>
              <View style={styles.nameRow}>
                <Text style={styles.giftUser}>{gift.author?.username ?? "someone"}</Text>
                {flagEmoji(gift.author?.countryCode) ? (
                  <Text style={styles.giftFlag}>{flagEmoji(gift.author?.countryCode)}</Text>
                ) : null}
                <View style={styles.amountPill}>
                  <FontAwesome5 name="coins" size={9} color={BRAND.orange} />
                  <Text style={styles.amountText}>{formatCount(gift.giftAmount)} Coins</Text>
                </View>
              </View>
              <Text style={styles.giftText}>{gift.text}</Text>
            </View>
            <Text style={styles.topTag}>👑 Top Gift</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BRAND.gray100,
    marginTop: 8,
  },
  flexShrink: { flexShrink: 1 },
  flexOne: { flex: 1 },
  avatarFallback: {
    backgroundColor: BRAND.orangeTint,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  username: { fontSize: 14, fontWeight: "800", color: BRAND.gray900 },
  flag: { fontSize: 12 },
  meta: { fontSize: 12, color: BRAND.gray400 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BRAND.orange,
  },
  followingBtn: { backgroundColor: BRAND.gray100, borderColor: BRAND.gray100 },
  followText: { fontSize: 12, fontWeight: "800", color: BRAND.orange },
  followingText: { color: BRAND.gray500, fontWeight: "600" },
  moreBtn: { padding: 6 },
  playBadge: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  pager: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pagerText: { color: BRAND.white, fontSize: 11, fontWeight: "700" },
  giftChip: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  giftChipText: { color: "#FCD34D", fontSize: 11, fontWeight: "800" },
  bigHeart: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  actionsLeft: { flexDirection: "row", alignItems: "center" },
  actionsRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, padding: 6 },
  actionCount: { fontSize: 12, fontWeight: "700", color: BRAND.gray700 },
  giftBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BRAND.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  giftBtnText: { color: BRAND.white, fontSize: 12, fontWeight: "800" },
  footer: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 16 },
  caption: { fontSize: 14, color: BRAND.gray900, lineHeight: 20 },
  captionUser: { fontWeight: "800" },
  more: { fontSize: 12, color: BRAND.gray400, fontWeight: "600", marginTop: 2 },
  giftRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    backgroundColor: BRAND.amber50,
    borderWidth: 1,
    borderColor: BRAND.amber400,
    shadowColor: BRAND.amber400,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  giftUser: { fontSize: 12, fontWeight: "800", color: BRAND.gray900 },
  giftFlag: { fontSize: 10 },
  amountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: BRAND.amber100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  amountText: { fontSize: 10, fontWeight: "900", color: BRAND.orange },
  giftText: { fontSize: 12, color: BRAND.gray800, marginTop: 2 },
  topTag: { fontSize: 10, color: BRAND.amber700, fontWeight: "700" },
});
