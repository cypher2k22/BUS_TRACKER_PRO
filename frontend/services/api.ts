import axios from "axios";
import Constants from "expo-constants";

const extraRaw = Constants.expoConfig?.extra?.apiUrl;
const extraUrl =
  typeof extraRaw === "string" && /^https?:\/\//.test(extraRaw.trim())
    ? extraRaw.trim()
    : undefined;

const API_URL = process.env.EXPO_PUBLIC_API_URL || extraUrl;

if (!API_URL) {
  console.warn(
    "BusTrack API URL is not configured. Set EXPO_PUBLIC_API_URL before starting the app."
  );
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  return config;
});

export default api;
