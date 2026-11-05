import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productsApi } from "../api/products";
import { useCart } from "../context/CartContext";
import { formatVND, resolveImageUrl } from "../utils";
import ProductReviews from "../components/ProductReviews";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    productsApi
      .get(id)
      .then((res) => setProduct(res.data))
      .finally(() => setLoading(false));
    setQty(1);
  }, [id]);

  if (loading) return <div className="loading-state">Đang tải...</div>;
  if (!product)
    return (
      <div className="empty-state">
        <h3>Không tìm thấy sản phẩm</h3>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: 12 }}>
          Về trang chủ
        </Link>
      </div>
    );

  const outOfStock = product.stock <= 0;

  return (
    <>
      <div className="container product-detail">
        <div className="product-detail-media">
          <img src={resolveImageUrl(product.image_url)} alt={product.name} />
        </div>
        <div>
          {product.category && <span className="stamp">{product.category.name}</span>}
          <h1 style={{ fontFamily: "var(--font-body)", fontSize: "1.8rem", fontWeight: 800 }}>{product.name}</h1>
          <div className="crate-card-price" style={{ fontSize: "1.6rem" }}>
            {formatVND(product.price)} <span>/ {product.unit}</span>
          </div>
          <p style={{ color: "var(--color-ink-soft)", lineHeight: 1.7, margin: "18px 0" }}>
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>
          <p style={{ fontSize: "0.9rem", color: outOfStock ? "var(--color-danger)" : "var(--color-primary-dark)", fontWeight: 600 }}>
            {outOfStock ? "Hiện đã hết hàng" : `Còn ${product.stock} ${product.unit} trong kho`}
          </p>

          {!outOfStock && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
              <div className="qty-picker">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={() => addToCart(product, qty)}>
                Thêm vào giỏ hàng
              </button>
            </div>
          )}

          <Link to="/" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
            ← Tiếp tục xem sản phẩm khác
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 780, paddingBottom: 56 }}>
        <ProductReviews productId={product.id} />
      </div>
    </>
  );
}
