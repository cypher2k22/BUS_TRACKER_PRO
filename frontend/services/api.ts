import axios from 'axios';
import Constants from 'expo-constants';

const extraRaw = Constants.expoConfig?.extra?.apiUrl;
const extraUrl =
  typeof extraRaw === 'string' && /^https?:\/\//.test(extraRaw.trim())
    ? extraRaw.trim()
    : undefined;

// Prefer .env at build time; fallback to app.json expo.extra.apiUrl (useful when .env is missing).
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || extraUrl || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;