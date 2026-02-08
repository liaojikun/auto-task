import axios from 'axios';

// Use relative path for production (Nginx proxy) or fallback to env var/localhost for dev
const baseURL = import.meta.env.PROD ? '/api/v1' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1');

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for generic error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
