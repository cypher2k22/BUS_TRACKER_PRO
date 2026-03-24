import axios from 'axios';

// change to your ip address and port number where the backend server is running
const API_URL = 'http://10.11.242.103:3000'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
