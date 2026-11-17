// src/types/api.ts
export type ApiAuthor = {
  _id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  countryCode: string;
  isVerified: boolean;
  isFollowing?: boolean;
};

export type ApiComment = {
  _id: string;
  post: string;
  author: ApiAuthor | null;
  text: string;
  isGift: boolean;
  giftAmount: number;
  createdAt: string;
};

export type ApiPost = {
  _id: string;
  author: ApiAuthor;
  caption: string;
  media: string[];
  likesCount: number;
  commentsCount: number;
  giftTotal: number;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  isOwn: boolean;
  topGiftComment: ApiComment | null;
};

export type FeedResponse = {
  page: number;
  limit: number;
  posts: ApiPost[];
};
