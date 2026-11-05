import { useEffect, useState } from "react";
import { adminApi } from "../../api/cart";
import { formatVND, ORDER_STATUS_LABELS } from "../../utils";
import { StatusPill } from "../../components/Toast";
import Modal from "../../components/Modal";

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS);

export default function OrdersAdmin({ paidOnly = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewing, setViewing] = useState(null);

  function load() {
    setLoading(true);
    const req = paidOnly ? adminApi.paidOrders() : adminApi.listOrders(statusFilter || undefined);
    req.then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, [paidOnly, statusFilter]);

  async function handleStatusChange(order, newStatus) {
    await adminApi.updateOrderStatus(order.id, newStatus);
    load();
    if (viewing?.id === order.id) setViewing({ ...viewing, status: newStatus });
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">{paidOnly ? "Đã thanh toán" : "Quản lý"}</div>
          <h2>{paidOnly ? "Đơn hàng đã thanh toán" : "Tất cả đơn hàng"}</h2>
        </div>
      </div>

      {!paidOnly && (
        <div className="filter-row">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--color-line-strong)" }}>
            <option value="">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><h3>Không có đơn hàng nào</h3></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.order_code}</td>
                <td>{o.user?.name || "—"}<div style={{fontSize:"0.78rem",color:"var(--color-ink-soft)"}}>{o.shipping_phone}</div></td>
                <td>{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                <td>{formatVND(o.total_amount)}</td>
                <td><StatusPill status={o.status} /></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setViewing(o)}>Chi tiết</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {viewing && (
        <Modal title={`Đơn hàng ${viewing.order_code}`} onClose={() => setViewing(null)}>
          <p style={{ color: "var(--color-ink-soft)", fontSize: "0.9rem" }}>
            Khách hàng: <strong>{viewing.shipping_name}</strong> · {viewing.shipping_phone}
            <br />
            Địa chỉ: {viewing.shipping_address}
            {viewing.note && <><br />Ghi chú: {viewing.note}</>}
          </p>
          <div style={{ margin: "16px 0", borderTop: "1px dashed var(--color-line-strong)", paddingTop: 12 }}>
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

          <div className="form-field">
            <label>Duyệt / cập nhật trạng thái đơn hàng</label>
            <select value={viewing.status} onChange={(e) => handleStatusChange(viewing, e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
