import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith("http")) {
    return import.meta.env.VITE_API_URL;
  }
  return "/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("skillsphere_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request - clearing token");
      // localStorage.removeItem("skillsphere_token");
    }
    return Promise.reject(error);
  }
);

export default api;
