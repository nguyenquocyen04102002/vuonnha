import { useEffect, useRef, useState } from "react";
import { productsApi, categoriesApi, uploadApi } from "../../api/products";
import { formatVND, resolveImageUrl } from "../../utils";
import Modal from "../../components/Modal";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  unit: "kg",
  image_url: "",
  stock: 0,
  is_active: true,
  category_id: "",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = đóng modal, {} = thêm mới, {...} = sửa
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  function loadProducts() {
    setLoading(true);
    productsApi
      .adminList(search ? { search } : {})
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setForm(emptyForm);
    setError("");
    setEditing({});
  }

  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      unit: p.unit,
      image_url: p.image_url || "",
      stock: p.stock,
      is_active: p.is_active,
      category_id: p.category_id || "",
    });
    setError("");
    setEditing(p);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.detail || "Tải ảnh lên thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
      e.target.value = ""; // cho phép chọn lại cùng 1 file nếu cần
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    try {
      if (editing?.id) {
        await productsApi.update(editing.id, payload);
      } else {
        await productsApi.create(payload);
      }
      setEditing(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Xoá sản phẩm "${p.name}"? Hành động này không thể hoàn tác.`)) return;
    await productsApi.remove(p.id);
    loadProducts();
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Quản lý</div>
          <h2>Sản phẩm</h2>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Thêm sản phẩm
        </button>
      </div>

      <div className="filter-row">
        <input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid var(--color-line-strong)", minWidth: 240 }}
        />
      </div>

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={resolveImageUrl(p.image_url)}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "var(--color-primary-tint)" }}
                  />
                  {p.name}
                </td>
                <td>{p.category?.name || "—"}</td>
                <td>{formatVND(p.price)} / {p.unit}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`badge-role ${p.is_active ? "customer" : "admin"}`}>
                    {p.is_active ? "Đang bán" : "Ngừng bán"}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing !== null && (
        <Modal title={editing?.id ? "Sửa sản phẩm" : "Thêm sản phẩm mới"} onClose={() => setEditing(null)}>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Tên sản phẩm</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Giá (đ)</label>
                <input type="number" min="1" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Đơn vị</label>
                <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Tồn kho</label>
                <input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Danh mục</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— Không có —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Ảnh sản phẩm</label>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  style={{
                    width: 84, height: 84, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                    background: "var(--color-primary-tint)", border: "1.5px solid var(--color-line-strong)",
                    display: "grid", placeItems: "center",
                  }}
                >
                  {form.image_url ? (
                    <img src={resolveImageUrl(form.image_url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1.4rem", opacity: 0.4 }}>🍎</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Đang tải lên..." : form.image_url ? "Đổi ảnh khác" : "Chọn ảnh từ máy"}
                  </button>
                  <p style={{ fontSize: "0.76rem", color: "var(--color-ink-soft)", margin: "6px 0 0" }}>
                    JPG, PNG, WEBP hoặc GIF, tối đa 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label>Mô tả</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-field">
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                Đang bán (hiển thị cho khách)
              </label>
            </div>
            <button className="btn btn-primary btn-block" disabled={uploading}>
              {editing?.id ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
