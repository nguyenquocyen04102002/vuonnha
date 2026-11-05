import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Đặt lại thành công -> tự chuyển về trang đăng nhập sau 2 giây
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate("/login", { replace: true }), 2000);
    return () => clearTimeout(t);
  }, [done, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (form.password !== form.confirm) return setError("Mật khẩu nhập lại không khớp.");
    setSubmitting(true);
    try {
      await authApi.resetPassword({ token, new_password: form.password });
      setDone(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Không đặt lại được mật khẩu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-card">
        <h2>Liên kết không hợp lệ</h2>
        <div className="form-error">Liên kết đặt lại mật khẩu thiếu mã xác thực.</div>
        <p className="auth-switch"><Link to="/quen-mat-khau">Yêu cầu liên kết mới</Link></p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Đặt mật khẩu mới</h2>
      {done ? (
        <div className="form-success">Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...</div>
      ) : (
        <>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Mật khẩu mới</label>
              <input type="password" required minLength={6} autoFocus value={form.password}
                     onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Nhập lại mật khẩu mới</label>
              <input type="password" required minLength={6} value={form.confirm}
                     onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Đặt lại mật khẩu"}
            </button>
          </form>
          {error.includes("hết hạn") && (
            <p className="auth-switch"><Link to="/quen-mat-khau">Yêu cầu liên kết mới</Link></p>
          )}
        </>
      )}
    </div>
  );
}
