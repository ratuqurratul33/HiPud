import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    const isAdminPage =
      window.location.pathname.startsWith('/admin');

    const isLoginPage =
      window.location.pathname === '/admin/login';

    if (
      (status === 401 || status === 403) &&
      isAdminPage
    ) {
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminSessionUnlocked');

      if (!isLoginPage) {
        window.location.replace('/admin/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;