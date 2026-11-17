// src/utils/helpers.ts
import axios from "axios";

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// "KE" -> 🇰🇪
export function flagEmoji(countryCode?: string): string {
  if (!countryCode || !/^[a-zA-Z]{2}$/.test(countryCode)) return "";
  const base = 0x1f1e6;
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    base + code.charCodeAt(0) - 65,
    base + code.charCodeAt(1) - 65
  );
}

const VIDEO_EXT = /\.(mp4|mov|m4v|webm)(\?.*)?$/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXT.test(url) || url.includes("/video/upload/");
}

// Cloudinary returns a still frame when a video URL ends in .jpg
export function videoThumb(url: string): string {
  return url.replace(VIDEO_EXT, ".jpg");
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Could not reach the server. Check your connection.";
    return error.response.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
