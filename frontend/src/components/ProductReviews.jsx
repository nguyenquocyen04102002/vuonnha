import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewsApi } from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average_rating: 0, total_reviews: 0 });
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function loadAll() {
    setLoading(true);
    Promise.all([
      reviewsApi.list(productId),
      reviewsApi.summary(productId),
      user ? reviewsApi.mine(productId).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
    ])
      .then(([listRes, summaryRes, mineRes]) => {
        setReviews(listRes.data);
        setSummary(summaryRes.data);
        setMyReview(mineRes.data);
        if (mineRes.data) {
          setFormRating(mineRes.data.rating);
          setFormComment(mineRes.data.comment || "");
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, [productId, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (formRating < 1) {
      setError("Vui lòng chọn số sao đánh giá.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await reviewsApi.submit(productId, { rating: formRating, comment: formComment || null });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Gửi đánh giá thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMine() {
    if (!confirm("Xoá đánh giá của bạn cho sản phẩm này?")) return;
    await reviewsApi.removeMine(productId);
    setFormRating(0);
    setFormComment("");
    loadAll();
  }

  if (loading) return <div className="loading-state">Đang tải đánh giá...</div>;

  return (
    <div className="reviews-section">
      <h2 style={{ marginBottom: 20 }}>Đánh giá sản phẩm</h2>

      <div className="reviews-summary">
        <div className="reviews-summary-score">{summary.average_rating.toFixed(1)}</div>
        <div>
          <StarRating value={Math.round(summary.average_rating)} readOnly size={20} />
          <div className="reviews-summary-count">{summary.total_reviews} đánh giá</div>
        </div>
      </div>

      {user ? (
        <div className="review-form">
          <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", marginBottom: 8 }}>
            {myReview ? "Sửa đánh giá của bạn" : "Viết đánh giá của bạn"}
          </label>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <StarRating value={formRating} onChange={setFormRating} readOnly={false} size={26} />
            </div>
            <div className="form-field">
              <textarea
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (không bắt buộc)..."
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? "Đang gửi..." : myReview ? "Cập nhật đánh giá" : "Gửi đánh giá"}
              </button>
              {myReview && (
                <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteMine}>
                  Xoá đánh giá
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="review-form" style={{ textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
            Đăng nhập
          </Link>{" "}
          <span style={{ color: "var(--color-ink-soft)" }}>để viết đánh giá cho sản phẩm này.</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: "var(--color-ink-soft)", fontSize: "0.9rem" }}>
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      ) : (
        <div>
          {reviews.map((r) => (
            <div className="review-item" key={r.id}>
              <div className="review-item-header">
                <div className="review-item-author">
                  <span className="user-chip-avatar" style={{ background: "var(--color-primary-tint)", color: "var(--color-primary-dark)" }}>
                    {r.user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                  <strong style={{ fontSize: "0.9rem" }}>{r.user.name}</strong>
                  <StarRating value={r.rating} readOnly size={14} />
                </div>
                <span className="review-item-date">{new Date(r.created_at).toLocaleDateString("vi-VN")}</span>
              </div>
              {r.comment && <p className="review-item-comment">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
