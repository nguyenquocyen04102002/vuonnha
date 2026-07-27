import { useState } from "react";
import { authApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, updateUser } = useAuth();

  // ---- Form thông tin cá nhân ----
  const [profileForm, setProfileForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      const res = await authApi.updateMe(profileForm);
      updateUser(res.data);
      setProfileSuccess("Đã lưu thông tin thành công.");
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ---- Form đổi mật khẩu ----
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("Mật khẩu mới nhập lại không khớp.");
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess("Đổi mật khẩu thành công.");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwError(err.response?.data?.detail || "Đổi mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640, padding: "40px 20px 64px" }}>
      <h2 style={{ marginBottom: 4 }}>Tài khoản của tôi</h2>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: 28 }}>{user.email}</p>

      {/* ---- Thông tin cá nhân ---- */}
      <div className="auth-card" style={{ margin: "0 0 24px", maxWidth: "none" }}>
        <h3 style={{ marginBottom: 16 }}>Thông tin cá nhân</h3>
        {profileError && <div className="form-error">{profileError}</div>}
        {profileSuccess && (
          <div style={{ background: "var(--color-primary-tint)", color: "var(--color-primary-dark)", padding: "10px 14px", borderRadius: 8, fontSize: "0.88rem", marginBottom: 16 }}>
            {profileSuccess}
          </div>
        )}
        <form onSubmit={handleProfileSubmit}>
          <div className="form-field">
            <label>Họ và tên</label>
            <input
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Số điện thoại</label>
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Chưa cập nhật"
            />
          </div>
          <div className="form-field">
            <label>Địa chỉ</label>
            <input
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              placeholder="Chưa cập nhật"
            />
          </div>
          <button className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>

      {/* ---- Đổi mật khẩu ---- */}
      <div className="auth-card" style={{ margin: 0, maxWidth: "none" }}>
        <h3 style={{ marginBottom: 16 }}>Đổi mật khẩu</h3>
        {pwError && <div className="form-error">{pwError}</div>}
        {pwSuccess && (
          <div style={{ background: "var(--color-primary-tint)", color: "var(--color-primary-dark)", padding: "10px 14px", borderRadius: 8, fontSize: "0.88rem", marginBottom: 16 }}>
            {pwSuccess}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-field">
            <label>Mật khẩu hiện tại</label>
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Mật khẩu mới (tối thiểu 6 ký tự)</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Nhập lại mật khẩu mới</label>
            <input
              type="password"
              required
              minLength={6}
              value={pwForm.confirm_password}
              onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
            />
          </div>
          <button className="btn btn-secondary" disabled={savingPw}>
            {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
