import axios from "axios";

// Central API instance for backend communication
const api = axios.create({
  baseURL: "http://10.11.242.103:3000/api",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
