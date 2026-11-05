import api from "./client";

export const reviewsApi = {
  list: (productId) => api.get(`/products/${productId}/reviews`),
  summary: (productId) => api.get(`/products/${productId}/reviews/summary`),
  mine: (productId) => api.get(`/products/${productId}/reviews/me`),
  submit: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  removeMine: (productId) => api.delete(`/products/${productId}/reviews/me`),
};

export const adminReviewsApi = {
  list: () => api.get("/admin/reviews"),
  remove: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
};
