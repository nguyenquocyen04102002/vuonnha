export function formatVND(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("vi-VN") + "đ";
}

// Ảnh do admin upload được backend trả về dưới dạng đường dẫn tương đối,
// ví dụ "/uploads/xxxx.jpg" - cần ghép với địa chỉ gốc của backend (không phải
// frontend) mới hiển thị đúng. Ảnh dán URL ngoài (http://...) thì giữ nguyên.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;
  return url;
}

export const ORDER_STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
  shipping: "Đang giao hàng",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

export const ORDER_STATUS_FLOW = ["pending", "confirmed", "paid", "shipping", "completed"];

export const PAYMENT_METHOD_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
};
