import { useCart } from "../context/CartContext";
import { ORDER_STATUS_LABELS } from "../utils";

export function ToastHost() {
  const { toast } = useCart();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

export function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{ORDER_STATUS_LABELS[status] || status}</span>;
}
