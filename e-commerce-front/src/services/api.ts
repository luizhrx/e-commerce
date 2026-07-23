import axios from 'axios';

const api = axios.create({
  // O Vite vai procurar a URL no arquivo .env, se não achar, usa o localhost como segurança
  baseURL: import.meta.env.VITE_API_URL ?? 'https://corex-api-6xid.onrender.com',
});

// Interceptor — adiciona o token em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;