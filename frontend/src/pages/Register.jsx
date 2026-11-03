import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Đăng ký thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Tạo tài khoản</h2>
      <p style={{ color: "var(--color-ink-soft)", marginTop: -8, marginBottom: 20 }}>
        Đăng ký để bắt đầu mua sắm tại Vườn Nhà.
      </p>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Họ và tên</label>
          <input name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Email</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Mật khẩu (tối thiểu 6 ký tự)</label>
          <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Số điện thoại</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label>Địa chỉ</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
      <p className="auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}
