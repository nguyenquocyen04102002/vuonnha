import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Tự động đính kèm JWT token (nếu người dùng đã đăng nhập) vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vuonnha_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nếu token hết hạn / không hợp lệ -> tự động đăng xuất phía client
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("vuonnha_token");
      localStorage.removeItem("vuonnha_user");
    }
    return Promise.reject(error);
  }
);

// ---- Session giỏ hàng (dành cho khách chưa đăng nhập vẫn có thể thêm vào giỏ) ----
export function getSessionId() {
  let sessionId = localStorage.getItem("vuonnha_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("vuonnha_session_id", sessionId);
  }
  return sessionId;
}

export default api;
