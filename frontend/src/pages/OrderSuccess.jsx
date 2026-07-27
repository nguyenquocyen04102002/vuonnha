import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../api/cart";
import { formatVND } from "../utils";
import { StatusPill } from "../components/Toast";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    ordersApi.get(id).then((res) => setOrder(res.data));
  }, [id]);

  if (!order) return <div className="loading-state">Đang tải...</div>;

  return (
    <div className="container" style={{ maxWidth: 640, padding: "56px 20px" }}>
      <div className="auth-card" style={{ margin: 0, textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🎉</div>
        <h2>Đặt hàng thành công!</h2>
        <p style={{ color: "var(--color-ink-soft)" }}>
          Cảm ơn bạn đã mua sắm tại Vườn Nhà. Mã đơn hàng của bạn là:
        </p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", margin: "8px 0 18px" }}>
          {order.order_code}
        </p>
        <StatusPill status={order.status} />

        <div style={{ textAlign: "left", marginTop: 28, borderTop: "1px dashed var(--color-line-strong)", paddingTop: 18 }}>
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

        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
