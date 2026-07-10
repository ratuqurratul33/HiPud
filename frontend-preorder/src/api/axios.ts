import axios from 'axios';

// Ini adalah alamat server backend Anda
const api = axios.create({
  baseURL: 'https://hi-pud.vercel.app/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if ((status === 401 || status === 403) && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminSessionUnlocked');

      if (window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
