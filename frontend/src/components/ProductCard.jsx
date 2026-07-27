import { Link } from "react-router-dom";
import { formatVND, resolveImageUrl } from "../utils";

function isNew(createdAt) {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 10;

  return (
    <div className="crate-card">
      <Link to={`/products/${product.id}`}>
        <div className="crate-card-media">
          {outOfStock ? (
            <span className="stock-badge">Hết hàng</span>
          ) : lowStock ? (
            <span className="stock-badge">Sắp hết</span>
          ) : isNew(product.created_at) ? (
            <span className="stock-badge">Mới</span>
          ) : null}
          <img src={resolveImageUrl(product.image_url)} alt={product.name} loading="lazy" />
        </div>
      </Link>
      {product.category && <div className="crate-card-cat">{product.category.name}</div>}
      <Link to={`/products/${product.id}`}>
        <h3>{product.name}</h3>
      </Link>
      <div className="crate-card-price">
        {formatVND(product.price)} <span>/ {product.unit}</span>
      </div>
      <div className="crate-card-actions">
        <button
          className="btn btn-primary btn-sm btn-block"
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
        >
          {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
}
