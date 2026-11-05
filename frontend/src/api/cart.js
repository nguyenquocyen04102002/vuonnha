import api from "./client";
import { getSessionId } from "./client";

export const cartApi = {
  get: () => api.get(`/cart/${getSessionId()}`),
  addItem: (productId, quantity = 1) =>
    api.post("/cart/items", { session_id: getSessionId(), product_id: productId, quantity }),
  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }, { params: { session_id: getSessionId() } }),
  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`, { params: { session_id: getSessionId() } }),
  clear: () => api.delete(`/cart/${getSessionId()}`),
};

export const ordersApi = {
  checkout: (data) => api.post("/orders", { ...data, session_id: getSessionId() }),
  myOrders: () => api.get("/orders/my"),
  get: (id) => api.get(`/orders/${id}`),
};

export const adminApi = {
  stats: () => api.get("/admin/stats"),
  dashboard: (days = 30) => api.get("/admin/dashboard", { params: { days } }),
  listOrders: (status) => api.get("/admin/orders", { params: status ? { status } : {} }),
  paidOrders: () => api.get("/admin/orders/paid"),
  // Xuất đơn hàng ra Excel: responseType "blob" để nhận file nhị phân
  exportOrders: (days = 30, status) =>
    api.get("/admin/orders/export", { params: { days, ...(status ? { status } : {}) }, responseType: "blob" }),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),
  listUsers: () => api.get("/admin/users"),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
};
