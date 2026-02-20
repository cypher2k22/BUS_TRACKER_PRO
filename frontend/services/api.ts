import axios from 'axios';

// change to your ip address and port number where the backend server is running
const API_URL = 'http://172.20.10.5:3000'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
