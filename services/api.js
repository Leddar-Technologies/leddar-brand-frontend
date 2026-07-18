import axios from "axios";
import { getSession, updateSessionTokens, logout } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// ─── Response interceptor — refresh-and-retry on 401 ────────────────────────
// Mirrors the artisan/admin frontends: on an expired access token, exchange
// the refresh token for a new one (queuing concurrent 401s behind a single
// in-flight refresh), retry the original request, and log out cleanly if the
// refresh token itself is invalid/expired.
let _refreshing = false;
let _queue = [];

function processQueue(error, token = null) {
  _queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  _queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    _refreshing = true;

    try {
      const session = getSession();
      if (!session?.refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: session.refreshToken,
      });

      const newToken        = data.data.token;
      const newRefreshToken = data.data.refreshToken;

      updateSessionTokens(newToken, newRefreshToken);
      processQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout(); // clears the session and redirects to /login
      return Promise.reject(refreshError);
    } finally {
      _refreshing = false;
    }
  }
);

export default api;
