import axios from "axios";

// Central API instance for backend communication
const api = axios.create({
  baseURL: "http://172.20.10.5:3000/api",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
