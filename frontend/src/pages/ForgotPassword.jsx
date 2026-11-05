import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Không gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Quên mật khẩu</h2>
      <p style={{ color: "var(--color-ink-soft)", marginTop: -8, marginBottom: 20 }}>
        Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt mật khẩu mới.
      </p>

      {message ? (
        <div className="form-success">
          {message}
          <p style={{ margin: "8px 0 0", fontSize: "0.82rem" }}>
            Không thấy email? Kiểm tra mục Spam, hoặc đợi 1 phút rồi gửi lại.
          </p>
        </div>
      ) : (
        <>
          {error && <div className="form-error">{String(error)}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
            </button>
          </form>
        </>
      )}

      <p className="auth-switch">
        <Link to="/login">← Quay lại đăng nhập</Link>
      </p>
    </div>
  );
}
