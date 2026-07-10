import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const playerToken = localStorage.getItem('playerToken') || sessionStorage.getItem('playerToken');
  const bdToken = localStorage.getItem('bdToken');
  const itToken = localStorage.getItem('itToken');
  const businessToken = localStorage.getItem('businessToken');
  
  // Use a more permissive check for player-related routes
  const isPlayerRoute = /pauth|play/.test(config.url);
  const isBdRoute = /^\/bd/.test(config.url);
  const isITRoute = /^\/internal-team/.test(config.url);
  const isBusinessRoute = /^\/business/.test(config.url);

  if (isITRoute && itToken) {
    config.headers.Authorization = `Bearer ${itToken}`;
  } else if (isBusinessRoute && businessToken) {
    config.headers.Authorization = `Bearer ${businessToken}`;
  } else if (isBdRoute && bdToken) {
    config.headers.Authorization = `Bearer ${bdToken}`;
  } else if (isPlayerRoute && playerToken) {
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

    if (isAuthError && !isLoginPath && !isVerifyOtp) {
      console.error(`AUTH FAILURE: [${status}] URL: ${err.config?.url}`);
      
      // Clear all auth-related keys
      const keys = ['token', 'user', 'playerToken', 'playerUser', 'bdToken', 'bdUser', 'itToken', 'itUser', 'businessToken', 'businessUser'];
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
