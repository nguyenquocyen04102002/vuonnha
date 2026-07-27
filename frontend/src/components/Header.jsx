import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/logovuonnha.png"; // thêm import logo nếu bạn muốn sử dụng hình ảnh logo từ thư mục assets

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div style={{ display: "flex", gap: 18 }}>
            <span className="topbar-item">☎ Hotline: 1900 6750</span>
            <span className="topbar-item">✉ hotro@vuonnha.vn</span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <span className="topbar-item">Giao hàng toàn quốc</span>
            <span className="topbar-item">Cam kết trái cây tươi 100%</span>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/" className="brand">
            <img
              src={logo}
              alt="Vườn Nhà"
              style={{
                width: "200px",
                height: "65px",
                objectFit: "contain",
              }}
            />
          </Link>

          <nav className="nav-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/gioi-thieu">Giới thiệu</Link>
            <Link to="/products">Sản phẩm</Link>
            {user && <Link to="/orders">Đơn hàng của tôi</Link>}
            {isAdmin && <Link to="/admin">Quản trị</Link>}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link to="/cart" className="nav-icon-link" aria-label="Giỏ hàng">
              🧺
              {cart.total_items > 0 && <span className="cart-badge">{cart.total_items}</span>}
            </Link>

            {user ? (
              <div className="user-chip">
                <Link to="/tai-khoan" style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit" }}>
                  <span className="user-chip-avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    {user.name.split(" ").slice(-1)[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-sm"
                  style={{ background: "none", border: "none", color: "var(--color-primary-dark)", opacity: 0.75, cursor: "pointer", fontWeight: 700 }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
