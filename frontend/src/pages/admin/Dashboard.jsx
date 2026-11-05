import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { adminApi } from "../../api/cart";
import ExportExcel from "./ExportExcel";
import { formatVND, ORDER_STATUS_LABELS } from "../../utils";

const PERIODS = [7, 30, 90];

// Màu cho từng trạng thái đơn hàng (khớp với .status-pill trong global.css)
const STATUS_COLORS = {
  pending: "#e8a825",
  confirmed: "#2f6fd0",
  paid: "#1c5c37",
  shipping: "#7a45d0",
  completed: "#34a853",
  cancelled: "#e1352e",
};
const CATEGORY_COLORS = ["#1c5c37", "#e8a825", "#e1352e", "#2f6fd0", "#7a45d0", "#8a8a8a"];

// 1.250.000 -> "1,3tr" | 85.000 -> "85k" (dùng cho trục biểu đồ cho gọn)
function formatShort(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(".0", "").replace(".", ",") + "tr";
  if (v >= 1_000) return Math.round(v / 1_000) + "k";
  return String(v);
}

function ChangeBadge({ pct }) {
  if (pct === null || pct === undefined) return <span className="stat-delta flat">Chưa có kỳ trước để so sánh</span>;
  if (pct === 0) return <span className="stat-delta flat">Không đổi so với kỳ trước</span>;
  const up = pct > 0;
  return (
    <span className={`stat-delta ${up ? "up" : "down"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toLocaleString("vi-VN")}% so với kỳ trước
    </span>
  );
}

function KpiCard({ label, value, pct, to }) {
  const body = (
    <>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {pct !== undefined && <ChangeBadge pct={pct} />}
    </>
  );
  return to ? (
    <Link to={to} className="stat-card stat-card-link">{body}</Link>
  ) : (
    <div className="stat-card">{body}</div>
  );
}

function Card({ title, action, children }) {
  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ text = "Chưa có dữ liệu trong khoảng thời gian này." }) => (
  <div className="dash-empty">{text}</div>
);

function Stars({ n }) {
  return <span className="dash-stars">{"★".repeat(n)}<span>{"★".repeat(5 - n)}</span></span>;
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .dashboard(days)
      .then((res) => { if (!cancelled) { setData(res.data); setError(""); } })
      .catch(() => { if (!cancelled) setError("Không tải được số liệu. Vui lòng thử lại."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (!data && !error) return <div className="loading-state">Đang tải số liệu...</div>;
  if (!data) return <div className="loading-state">{error}</div>;

  const { kpis, totals } = data;
  const statusTotal = data.orders_by_status.reduce((s, x) => s + x.count, 0);
  const maxCat = Math.max(1, ...data.revenue_by_category.map((c) => c.revenue));
  const hasRevenue = data.revenue_by_day.some((d) => d.revenue > 0);

  return (
    <div className={loading ? "dash-loading" : ""}>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Tổng quan</div>
          <h2>Chào mừng trở lại 👋</h2>
          <p className="dash-sub">
            Số liệu từ {new Date(data.from_date).toLocaleDateString("vi-VN")} đến{" "}
            {new Date(data.to_date).toLocaleDateString("vi-VN")}. Doanh thu chỉ tính đơn đã thanh toán và hoàn tất.
          </p>
        </div>
        <div className="dash-actions">
          <ExportExcel key={days} defaultDays={days} />
          <div className="period-switch" role="group" aria-label="Khoảng thời gian">
            {PERIODS.map((p) => (
              <button key={p} className={`period-btn${days === p ? " active" : ""}`} onClick={() => setDays(p)}>
                {p} ngày
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Hàng 1: KPI ---- */}
      <div className="stat-grid">
        <KpiCard label="Doanh thu" value={formatVND(kpis.revenue.value)} pct={kpis.revenue.change_pct} />
        <KpiCard label="Số đơn hàng" value={kpis.orders.value} pct={kpis.orders.change_pct} />
        <KpiCard label="Giá trị đơn trung bình" value={formatVND(kpis.avg_order_value.value)} pct={kpis.avg_order_value.change_pct} />
        <KpiCard label="Khách hàng mới" value={kpis.new_customers.value} pct={kpis.new_customers.change_pct} />
        <KpiCard label="Đơn chờ xử lý" value={kpis.pending_orders.value} to="/admin/orders" />
      </div>

      {/* ---- Hàng 2: doanh thu theo ngày + đơn theo trạng thái ---- */}
      <div className="dash-grid dash-grid-2-1">
        <Card title="Doanh thu theo ngày">
          {!hasRevenue ? <Empty /> : (
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenue_by_day} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1c5c37" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#1c5c37" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e3d8" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatShort} width={44} />
                  <Tooltip
                    formatter={(v, name) => (name === "revenue" ? [formatVND(v), "Doanh thu"] : [v, "Số đơn"])}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1c5c37" strokeWidth={2} fill="url(#revFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Đơn hàng theo trạng thái">
          {statusTotal === 0 ? <Empty /> : (
            <>
              <div className="dash-chart dash-chart-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.orders_by_status.filter((x) => x.count > 0)} dataKey="count" nameKey="status"
                         innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {data.orders_by_status.filter((x) => x.count > 0).map((x) => (
                        <Cell key={x.status} fill={STATUS_COLORS[x.status]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, ORDER_STATUS_LABELS[n]]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dash-donut-center"><strong>{statusTotal}</strong><span>đơn</span></div>
              </div>
              <ul className="dash-legend">
                {data.orders_by_status.map((x) => (
                  <li key={x.status}>
                    <i style={{ background: STATUS_COLORS[x.status] }} />
                    <span>{ORDER_STATUS_LABELS[x.status]}</span>
                    <b>{x.count}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* ---- Hàng 3: top sản phẩm + doanh thu theo danh mục ---- */}
      <div className="dash-grid dash-grid-1-1">
        <Card title="Top 5 sản phẩm bán chạy">
          {data.top_products.length === 0 ? <Empty /> : (
            <div className="dash-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_products} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e3d8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatShort} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v, n, item) => [formatVND(v) + ` (${item.payload.quantity} đã bán)`, "Doanh thu"]} />
                  <Bar dataKey="revenue" fill="#e8a825" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Doanh thu theo danh mục">
          {data.revenue_by_category.length === 0 ? <Empty /> : (
            <ul className="dash-bars">
              {data.revenue_by_category.map((c, i) => (
                <li key={c.name}>
                  <div className="dash-bar-top"><span>{c.name}</span><b>{formatVND(c.revenue)}</b></div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill"
                         style={{ width: `${(c.revenue / maxCat) * 100}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ---- Hàng 4: sắp hết hàng + đơn mới nhất ---- */}
      <div className="dash-grid dash-grid-1-2">
        <Card title="Sản phẩm sắp hết hàng" action={<Link className="dash-link" to="/admin/products">Quản lý →</Link>}>
          {data.low_stock.length === 0 ? <Empty text={`Không có sản phẩm nào có tồn kho từ ${data.low_stock_threshold} trở xuống.`} /> : (
            <table className="data-table dash-table">
              <thead><tr><th>Sản phẩm</th><th>Tồn kho</th></tr></thead>
              <tbody>
                {data.low_stock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className={`dash-stock ${p.stock === 0 ? "out" : "low"}`}>{p.stock === 0 ? "Hết hàng" : `${p.stock} ${p.unit}`}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Đơn hàng mới nhất" action={<Link className="dash-link" to="/admin/orders">Xem tất cả →</Link>}>
          {data.recent_orders.length === 0 ? <Empty text="Chưa có đơn hàng nào." /> : (
            <table className="data-table dash-table">
              <thead><tr><th>Mã đơn</th><th>Khách</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
              <tbody>
                {data.recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.order_code}</b></td>
                    <td>{o.customer}</td>
                    <td>{formatVND(o.total_amount)}</td>
                    <td><span className={`status-pill status-${o.status}`}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                    <td>{new Date(o.created_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* ---- Hàng 5: đánh giá ---- */}
      <div className="dash-grid dash-grid-1-2">
        <Card title="Điểm đánh giá">
          {data.ratings.total === 0 ? <Empty text="Chưa có đánh giá nào." /> : (
            <>
              <div className="dash-rating-head">
                <strong>{data.ratings.average.toLocaleString("vi-VN")}</strong>
                <div><Stars n={Math.round(data.ratings.average)} /><span>{data.ratings.total} đánh giá</span></div>
              </div>
              <ul className="dash-bars dash-bars-compact">
                {data.ratings.distribution.map((r) => (
                  <li key={r.stars}>
                    <div className="dash-bar-top"><span>{r.stars} sao</span><b>{r.count}</b></div>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width: `${(r.count / data.ratings.total) * 100}%`, background: "#e8a825" }} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="Đánh giá mới nhất" action={<Link className="dash-link" to="/admin/reviews">Kiểm duyệt →</Link>}>
          {data.ratings.latest.length === 0 ? <Empty text="Chưa có đánh giá nào." /> : (
            <ul className="dash-reviews">
              {data.ratings.latest.map((r) => (
                <li key={r.id}>
                  <div className="dash-review-top">
                    <Stars n={r.rating} />
                    <b>{r.user_name}</b>
                    <span>về {r.product_name}</span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ---- Tổng quan toàn hệ thống (không phụ thuộc kỳ lọc) ---- */}
      <div className="dash-totals">
        <span><b>{totals.total_products}</b> sản phẩm</span>
        <span><b>{totals.total_categories}</b> danh mục</span>
        <span><b>{totals.total_users}</b> khách hàng</span>
        <span><b>{totals.total_orders}</b> đơn hàng</span>
        <span>Tổng doanh thu từ trước đến nay: <b>{formatVND(totals.total_revenue)}</b></span>
      </div>
    </div>
  );
}
