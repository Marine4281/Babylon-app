// src/hooks/use-feed.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFeed, followUser, likePost, savePost } from "@/api/endpoints";
import type { ApiComment, ApiPost } from "@/types/api";
import { getErrorMessage } from "@/utils/helpers";

const PAGE_SIZE = 10;

type LoadMode = "initial" | "refresh" | "more";

export function useFeed() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const page = useRef(1);
  const hasMore = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async (mode: LoadMode) => {
    if (busy.current) return;
    if (mode === "more" && !hasMore.current) return;

    busy.current = true;
    if (mode === "refresh") setRefreshing(true);
    if (mode === "more") setLoadingMore(true);

    try {
      const nextPage = mode === "more" ? page.current + 1 : 1;
      const data = await fetchFeed(nextPage, PAGE_SIZE);
      page.current = nextPage;
      hasMore.current = data.posts.length > 0;

      setPosts((prev) =>
        mode === "more"
          ? [...prev, ...data.posts.filter((p) => !prev.some((x) => x._id === p._id))]
          : data.posts
      );
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your feed."));
    } finally {
      busy.current = false;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  const patch = useCallback((id: string, fn: (p: ApiPost) => ApiPost) => {
    setPosts((prev) => prev.map((p) => (p._id === id ? fn(p) : p)));
  }, []);

  const toggleLike = useCallback(
    async (post: ApiPost) => {
      const next = !post.isLiked;
      patch(post._id, (p) => ({
        ...p,
        isLiked: next,
        likesCount: Math.max(0, p.likesCount + (next ? 1 : -1)),
      }));
      try {
        const res = await likePost(post._id);
        patch(post._id, (p) => ({ ...p, isLiked: res.isLiked, likesCount: res.likesCount }));
      } catch {
        patch(post._id, (p) => ({
          ...p,
          isLiked: post.isLiked,
          likesCount: post.likesCount,
        }));
      }
    },
    [patch]
  );

  const toggleSave = useCallback(
    async (post: ApiPost) => {
      patch(post._id, (p) => ({ ...p, isSaved: !post.isSaved }));
      try {
        const res = await savePost(post._id);
        patch(post._id, (p) => ({ ...p, isSaved: res.isSaved }));
      } catch {
        patch(post._id, (p) => ({ ...p, isSaved: post.isSaved }));
      }
    },
    [patch]
  );

  const toggleFollow = useCallback(async (authorId: string, current: boolean) => {
    const setAll = (value: boolean) =>
      setPosts((prev) =>
        prev.map((p) =>
          p.author._id === authorId ? { ...p, author: { ...p.author, isFollowing: value } } : p
        )
      );
    setAll(!current);
    try {
      const res = await followUser(authorId);
      setAll(res.isFollowing);
    } catch {
      setAll(current);
    }
  }, []);

  // Called only after the server has confirmed the gift
  const applyGift = useCallback(
    (postId: string, comment: ApiComment) => {
      patch(postId, (p) => ({
        ...p,
        giftTotal: p.giftTotal + comment.giftAmount,
        commentsCount: p.commentsCount + 1,
        topGiftComment:
          !p.topGiftComment || comment.giftAmount > p.topGiftComment.giftAmount
            ? comment
            : p.topGiftComment,
      }));
    },
    [patch]
  );

  const refresh = useCallback(() => load("refresh"), [load]);
  const loadMore = useCallback(() => load("more"), [load]);
  const retry = useCallback(() => {
    setLoading(true);
    void load("initial");
  }, [load]);

  return {
    posts,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    retry,
    toggleLike,
    toggleSave,
    toggleFollow,
    applyGift,
  };
                           }
