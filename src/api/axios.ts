// src/api/axios.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api",
  timeout: 10000,
});

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) onUnauthorized?.();
    return Promise.reject(error);
  }
);

export default API;
