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

// Ánh xạ tên sản phẩm -> icon + màu nền riêng, dùng làm thumbnail màu sắc cho
// từng dòng sản phẩm trong đơn hàng (đơn hàng chỉ lưu tên sản phẩm dạng snapshot,
// không lưu ảnh, nên dùng icon suy ra từ tên thay vì gọi thêm API lấy ảnh thật).
const FRUIT_ICON_MAP = [
  { keywords: ["xoài"], emoji: "🥭", bg: "#fdead2", fg: "#b9670a" },
  { keywords: ["cam", "quýt"], emoji: "🍊", bg: "#ffe6cc", fg: "#c25c00" },
  { keywords: ["dưa hấu"], emoji: "🍉", bg: "#e3f6e1", fg: "#227a2f" },
  { keywords: ["nho"], emoji: "🍇", bg: "#f1e4fb", fg: "#6a2fa8" },
  { keywords: ["thanh long"], emoji: "🍈", bg: "#fbe3ef", fg: "#c22a78" },
  { keywords: ["bơ"], emoji: "🥑", bg: "#e8f3df", fg: "#3f7a1f" },
  { keywords: ["chuối"], emoji: "🍌", bg: "#fdf3cf", fg: "#a3830a" },
  { keywords: ["bưởi"], emoji: "🍈", bg: "#fdeed0", fg: "#b9760a" },
  { keywords: ["chanh"], emoji: "🍋", bg: "#f8f6cf", fg: "#8a8a0a" },
  { keywords: ["sầu riêng"], emoji: "🟡", bg: "#fdf3cf", fg: "#a3830a" },
  { keywords: ["chôm chôm", "vải", "nhãn"], emoji: "🍒", bg: "#fbe1e1", fg: "#c22a2a" },
  { keywords: ["mận"], emoji: "🍑", bg: "#fbe3ef", fg: "#c22a78" },
  { keywords: ["dứa", "thơm"], emoji: "🍍", bg: "#fdf3cf", fg: "#a3830a" },
  { keywords: ["ổi"], emoji: "🍏", bg: "#e8f3df", fg: "#3f7a1f" },
];
const DEFAULT_FRUIT_ICON = { emoji: "🍓", bg: "#fbe3e3", fg: "#c2352a" };

export function getFruitIcon(productName = "") {
  const lower = productName.toLowerCase();
  const match = FRUIT_ICON_MAP.find((f) => f.keywords.some((k) => lower.includes(k)));
  return match || DEFAULT_FRUIT_ICON;
}
