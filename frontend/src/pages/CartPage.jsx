import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatVND, resolveImageUrl } from "../utils";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="loading-state">Đang tải giỏ hàng...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="container empty-state">
        <h3>Giỏ hàng của bạn đang trống</h3>
        <p>Hãy chọn thêm vài loại trái cây tươi ngon nhé!</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-layout">
      <div>
        <h2>Giỏ hàng của bạn</h2>
        {cart.items.map((item) => (
          <div className="cart-row" key={item.id}>
            {item.product.image_url ? (
              <img src={resolveImageUrl(item.product.image_url)} alt={item.product.name} />
            ) : (
              <div className="cart-thumb-placeholder" />
            )}
            <div>
              <div style={{ fontWeight: 700 }}>{item.product.name}</div>
              <div style={{ color: "var(--color-ink-soft)", fontSize: "0.88rem" }}>
                {formatVND(item.product.price)} / {item.product.unit}
              </div>
            </div>
            <div className="qty-picker">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
              >
                +
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <strong>{formatVND(item.product.price * item.quantity)}</strong>
              <button
                onClick={() => removeItem(item.id)}
                style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-card">
        <h3>Tóm tắt đơn hàng</h3>
        <div className="summary-line">
          <span>Số lượng sản phẩm</span>
          <span>{cart.total_items}</span>
        </div>
        <div className="summary-line total">
          <span>Tổng cộng</span>
          <span>{formatVND(cart.total_amount)}</span>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate("/checkout")}>
          Tiến hành thanh toán
        </button>
        <Link to="/" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: "0.88rem", color: "var(--color-primary)" }}>
          ← Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
