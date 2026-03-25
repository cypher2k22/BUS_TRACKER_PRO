import axios from "axios";
import { auth } from "../firebaseConfig";

const api = axios.create({
  baseURL: "http://172.20.10.5:3000/api",
  timeout: 10000000, 
});

// Interceptor to automatically add the Firebase Token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
