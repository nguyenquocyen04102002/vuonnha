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
  listOrders: (status) => api.get("/admin/orders", { params: status ? { status } : {} }),
  paidOrders: () => api.get("/admin/orders/paid"),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status }),
  listUsers: () => api.get("/admin/users"),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
};
