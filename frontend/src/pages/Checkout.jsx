import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/cart";
import { formatVND } from "../utils";

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: user?.address || "",
    note: "",
    payment_method: "cod",
  });
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
      const res = await ordersApi.checkout(form);
      await refreshCart();
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="container empty-state">
        <h3>Giỏ hàng trống, không có gì để thanh toán</h3>
      </div>
    );
  }

  return (
    <div className="container cart-layout">
      <div>
        <h2>Thông tin giao hàng</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Họ và tên người nhận</label>
            <input name="shipping_name" value={form.shipping_name} onChange={handleChange} required />
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label>Số điện thoại</label>
              <input name="shipping_phone" value={form.shipping_phone} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Phương thức thanh toán</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange}>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Địa chỉ giao hàng</label>
            <input name="shipping_address" value={form.shipping_address} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Ghi chú (tuỳ chọn)</label>
            <textarea name="note" rows={3} value={form.note} onChange={handleChange} />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Đang xử lý..." : `Đặt hàng · ${formatVND(cart.total_amount)}`}
          </button>
        </form>
      </div>

      <div className="summary-card">
        <h3>Đơn hàng của bạn</h3>
        {cart.items.map((item) => (
          <div className="summary-line" key={item.id}>
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>{formatVND(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-line total">
          <span>Tổng cộng</span>
          <span>{formatVND(cart.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}
