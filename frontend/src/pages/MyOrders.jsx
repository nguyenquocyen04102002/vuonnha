import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/cart";
import { formatVND, PAYMENT_METHOD_LABELS } from "../utils";
import { StatusPill } from "../components/Toast";
import Modal from "../components/Modal";

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
            <div style={{ marginTop: 14 }}>
              {order.items.map((it) => (
                <div className="summary-line" key={it.id}>
                  <span>
                    {it.product_name} × {it.quantity}
                  </span>
                  <span>{formatVND(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="summary-line total">
                <span>Tổng cộng</span>
                <span>{formatVND(order.total_amount)}</span>
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
        <Modal title={`Chi tiết đơn hàng ${viewing.order_code}`} onClose={() => setViewing(null)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--color-ink-soft)" }}>
              Đặt lúc {new Date(viewing.created_at).toLocaleString("vi-VN")}
            </span>
            <StatusPill status={viewing.status} />
          </div>

          <div style={{ fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 16 }}>
            <div><strong>Người nhận:</strong> {viewing.shipping_name}</div>
            <div><strong>Điện thoại:</strong> {viewing.shipping_phone}</div>
            <div><strong>Địa chỉ:</strong> {viewing.shipping_address}</div>
            <div><strong>Thanh toán:</strong> {PAYMENT_METHOD_LABELS[viewing.payment_method] || viewing.payment_method}</div>
            {viewing.note && <div><strong>Ghi chú:</strong> {viewing.note}</div>}
          </div>

          <div style={{ borderTop: "1px dashed var(--color-line-strong)", paddingTop: 12 }}>
            {viewing.items.map((it) => (
              <div className="summary-line" key={it.id}>
                <span>{it.product_name} × {it.quantity}</span>
                <span>{formatVND(it.price * it.quantity)}</span>
              </div>
            ))}
            <div className="summary-line total">
              <span>Tổng cộng</span>
              <span>{formatVND(viewing.total_amount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
