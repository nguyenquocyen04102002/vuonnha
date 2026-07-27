import { useEffect, useState } from "react";
import { adminApi } from "../../api/cart";
import { formatVND } from "../../utils";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.stats().then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="loading-state">Đang tải số liệu...</div>;

  const cards = [
    { label: "Tổng doanh thu (đã thanh toán)", value: formatVND(stats.total_revenue) },
    { label: "Tổng đơn hàng", value: stats.total_orders },
    { label: "Đơn chờ xử lý", value: stats.pending_orders },
    { label: "Đơn đã thanh toán", value: stats.paid_orders },
    { label: "Sản phẩm", value: stats.total_products },
    { label: "Danh mục", value: stats.total_categories },
    { label: "Khách hàng", value: stats.total_users },
  ];

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Tổng quan</div>
          <h2>Chào mừng trở lại 👋</h2>
        </div>
      </div>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
