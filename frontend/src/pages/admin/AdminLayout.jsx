import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "📊 Tổng quan", end: true },
  { to: "/admin/products", label: "🍉 Sản phẩm" },
  { to: "/admin/categories", label: "🗂️ Danh mục" },
  { to: "/admin/orders", label: "🧾 Đơn hàng" },
  { to: "/admin/orders/paid", label: "💰 Đơn đã thanh toán" },
  { to: "/admin/users", label: "👥 Người dùng" },
  { to: "/admin/reviews", label: "⭐ Đánh giá" },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h4>Quản trị Vườn Nhà</h4>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
          >
            {l.label}
          </NavLink>
        ))}
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
