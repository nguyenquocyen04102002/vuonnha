import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/cart";
import { formatVND, getFruitIcon, PAYMENT_METHOD_LABELS, resolveImageUrl } from "../utils";
import { StatusPill } from "../components/Toast";
import Modal from "../components/Modal";

function OrderItemRow({ item }) {
  const icon = getFruitIcon(item.product_name);
  return (
    <div className="order-item-row">
      {item.product_image_url ? (
        <img
          src={resolveImageUrl(item.product_image_url)}
          alt={item.product_name}
          className="fruit-thumb"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            // Ảnh lỗi (vd link ngoài đã hỏng) -> tự chuyển sang icon màu dự phòng
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "grid";
          }}
        />
      ) : null}
      <div
        className="fruit-thumb"
        style={{ background: icon.bg, color: icon.fg, display: item.product_image_url ? "none" : "grid" }}
      >
        {icon.emoji}
      </div>
      <div className="order-item-info">
        <div className="order-item-name">{item.product_name}</div>
        <div className="order-item-qty">× {item.quantity}</div>
      </div>
      <div className="order-item-price">{formatVND(item.price * item.quantity)}</div>
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    ordersApi
      .myOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Đang tải đơn hàng...</div>;

  if (orders.length === 0) {
    return (
      <div className="container empty-state">
        <h3>Bạn chưa có đơn hàng nào</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Bắt đầu mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "36px 20px 64px" }}>
      <h2>Đơn hàng của tôi</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            className="summary-card"
            style={{ position: "static", cursor: "pointer" }}
            onClick={() => setViewing(order)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <strong>{order.order_code}</strong>
                <div style={{ fontSize: "0.82rem", color: "var(--color-ink-soft)" }}>
                  {new Date(order.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
              <StatusPill status={order.status} />
            </div>
            <div style={{ marginTop: 8 }}>
              {order.items.map((it) => (
                <OrderItemRow item={it} key={it.id} />
              ))}
              <div className="summary-line total">
                <span>Tổng cộng</span>
                <span style={{ color: "var(--color-primary)" }}>{formatVND(order.total_amount)}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", marginTop: 10 }}>
              <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.86rem" }}>
                Xem chi tiết →
              </span>
            </div>
          </div>
        ))}
      </div>

      {viewing && (
        <Modal title={<span>Chi tiết đơn hàng <span style={{ color: "var(--color-primary)" }}>{viewing.order_code}</span></span>} onClose={() => setViewing(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--color-ink-soft)" }}>
              Đặt lúc {new Date(viewing.created_at).toLocaleString("vi-VN")}
            </span>
            <StatusPill status={viewing.status} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="detail-info-row">
              <div className="detail-info-icon">👤</div>
              <div>
                <div className="detail-info-label">Người nhận</div>
                <div className="detail-info-value">{viewing.shipping_name}</div>
              </div>
            </div>
            <div className="detail-info-row">
              <div className="detail-info-icon">📞</div>
              <div>
                <div className="detail-info-label">Điện thoại</div>
                <div className="detail-info-value">{viewing.shipping_phone}</div>
              </div>
            </div>
            <div className="detail-info-row">
              <div className="detail-info-icon">📍</div>
              <div>
                <div className="detail-info-label">Địa chỉ</div>
                <div className="detail-info-value">{viewing.shipping_address}</div>
              </div>
            </div>
            <div className="detail-info-row">
              <div className="detail-info-icon">💳</div>
              <div>
                <div className="detail-info-label">Thanh toán</div>
                <div className="detail-info-value">{PAYMENT_METHOD_LABELS[viewing.payment_method] || viewing.payment_method}</div>
              </div>
            </div>
            {viewing.note && (
              <div className="detail-info-row">
                <div className="detail-info-icon">📝</div>
                <div>
                  <div className="detail-info-label">Ghi chú</div>
                  <div className="detail-info-value">{viewing.note}</div>
                </div>
              </div>
            )}
          </div>

          <div className="order-items-header">
            <span>Sản phẩm</span>
            <span>Thành tiền</span>
          </div>
          {viewing.items.map((it) => (
            <OrderItemRow item={it} key={it.id} />
          ))}
          <div className="summary-line total">
            <span>Tổng cộng</span>
            <span style={{ color: "var(--color-primary)" }}>{formatVND(viewing.total_amount)}</span>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={() => setViewing(null)}>
            Đóng
          </button>
        </Modal>
      )}
    </div>
  );
}
