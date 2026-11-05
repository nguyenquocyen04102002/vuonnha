import api from "./client";

export const productsApi = {
  list: (params) => api.get("/products", { params }),
  get: (id) => api.get(`/products/${id}`),
  adminList: (params) => api.get("/products/admin/all", { params }),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  list: () => api.get("/categories"),
  get: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
