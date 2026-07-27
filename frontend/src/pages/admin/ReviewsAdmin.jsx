import { useEffect, useState } from "react";
import { adminReviewsApi } from "../../api/reviews";
import StarRating from "../../components/StarRating";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    adminReviewsApi.list().then((res) => setReviews(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(r) {
    if (!confirm(`Xoá đánh giá của "${r.user.name}" cho sản phẩm "${r.product?.name}"?`)) return;
    await adminReviewsApi.remove(r.id);
    load();
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Quản lý</div>
          <h2>Đánh giá sản phẩm</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state"><h3>Chưa có đánh giá nào</h3></div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Người đánh giá</th>
              <th>Số sao</th>
              <th>Bình luận</th>
              <th>Ngày</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.product?.name || "—"}</td>
                <td>{r.user.name}</td>
                <td><StarRating value={r.rating} readOnly size={14} /></td>
                <td style={{ maxWidth: 320 }}>{r.comment || <span style={{ color: "var(--color-ink-soft)" }}>—</span>}</td>
                <td>{new Date(r.created_at).toLocaleDateString("vi-VN")}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
