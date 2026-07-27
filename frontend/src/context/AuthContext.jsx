import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vuonnha_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vuonnha_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Xác thực lại token với server để chắc chắn thông tin user còn mới
    authApi
      .me()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("vuonnha_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("vuonnha_token");
        localStorage.removeItem("vuonnha_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function loginSuccess(data) {
    localStorage.setItem("vuonnha_token", data.access_token);
    localStorage.setItem("vuonnha_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function login(email, password) {
    const res = await authApi.login({ email, password });
    loginSuccess(res.data);
    return res.data.user;
  }

  async function register(payload) {
    const res = await authApi.register(payload);
    loginSuccess(res.data);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("vuonnha_token");
    localStorage.removeItem("vuonnha_user");
    setUser(null);
    authApi.logout().catch(() => {});
  }

  // Cập nhật thông tin user trong context + localStorage (không cần đăng nhập lại)
  // - dùng sau khi sửa thông tin cá nhân thành công
  function updateUser(newUserData) {
    setUser(newUserData);
    localStorage.setItem("vuonnha_user", JSON.stringify(newUserData));
  }

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
