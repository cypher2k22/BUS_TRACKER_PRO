import axios from "axios";

// Central API instance for backend communication
const api = axios.create({
  baseURL: "http://bakeerathans-macbook-air.local:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
