// src/api/endpoints.ts
import API from "./axios";
import type { ApiComment, FeedResponse } from "@/types/api";

export const fetchFeed = async (page: number, limit = 10) => {
  const { data } = await API.get<FeedResponse>("/posts", { params: { page, limit } });
  return data;
};

export const likePost = async (postId: string) => {
  const { data } = await API.post<{ isLiked: boolean; likesCount: number }>(
    `/posts/${postId}/like`
  );
  return data;
};

export const savePost = async (postId: string) => {
  const { data } = await API.post<{ isSaved: boolean }>(`/posts/${postId}/save`);
  return data;
};

export const followUser = async (userId: string) => {
  const { data } = await API.post<{ isFollowing: boolean }>(`/users/${userId}/follow`);
  return data;
};

export const sendGift = async (postId: string, amount: number, text: string) => {
  const { data } = await API.post<ApiComment>(`/posts/${postId}/comments/gift`, {
    amount,
    text,
  });
  return data;
};

export const fetchWallet = async () => {
  const { data } = await API.get<{ balance: number }>("/wallet/me");
  return data;
};
