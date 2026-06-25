import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const playerToken = localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken');
  
  // Use a more permissive check for player-related routes
  const isPlayerRoute = /pauth|play/.test(config.url);

  if (isPlayerRoute && playerToken) {
    config.headers.Authorization = `Bearer ${playerToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (playerToken) {
    config.headers.Authorization = `Bearer ${playerToken}`;
  }
  
  return config;
});

// Handle 401 & 403 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const isAuthError = status === 401 || status === 403;
    
    // Don't redirect if we are already on the login page or trying to login
    const isLoginPath = window.location.pathname.includes('/login');
    const isVerifyOtp = err.config?.url?.includes('verify-otp');
    // Don't redirect for player/game API routes — anonymous players need them
    const isPlayerApiRoute = /pauth|play|bejeweled|space|bounce|2048|snake|catch|reaction|simon|flappy|connect4|tetris|stack/.test(err.config?.url || '');

    if (isAuthError && !isLoginPath && !isVerifyOtp && !isPlayerApiRoute) {
      console.error(`AUTH FAILURE: [${status}] URL: ${err.config?.url}`);
      
      // Clear all auth-related keys
      const keys = ['token', 'user', 'playerToken', 'playerUser'];
      keys.forEach(k => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });
      
      // Force redirect
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
