import { useEffect, useState } from "react";
import { categoriesApi } from "../../api/products";
import Modal from "../../components/Modal";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    categoriesApi.list().then((res) => setCategories(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setForm({ name: "", description: "" });
    setError("");
    setEditing({});
  }

  function openEdit(c) {
    setForm({ name: c.name, description: c.description || "" });
    setError("");
    setEditing(c);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing?.id) {
        await categoriesApi.update(editing.id, form);
      } else {
        await categoriesApi.create(form);
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  async function handleDelete(c) {
    if (!confirm(`Xoá danh mục "${c.name}"? Các sản phẩm thuộc danh mục sẽ chuyển về "Không có".`)) return;
    await categoriesApi.remove(c.id);
    load();
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Quản lý</div>
          <h2>Danh mục sản phẩm</h2>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Số sản phẩm</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ color: "var(--color-ink-soft)" }}>{c.slug}</td>
                <td>{c.product_count}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Xoá</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing !== null && (
        <Modal title={editing?.id ? "Sửa danh mục" : "Thêm danh mục mới"} onClose={() => setEditing(null)}>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Tên danh mục</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Mô tả</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block">{editing?.id ? "Lưu thay đổi" : "Thêm danh mục"}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
