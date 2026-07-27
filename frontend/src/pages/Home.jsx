import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsApi, categoriesApi } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const CATEGORY_ICONS = ["🥭", "🍊", "🍇", "🍍", "🍎", "🍌"];

const WHY_CHOOSE = [
  { icon: "💰", title: "Giá cả phù hợp", desc: "Thu mua trực tiếp từ nhà vườn, cắt giảm khâu trung gian để có giá tốt nhất." },
  { icon: "🍃", title: "Tươi ngon mỗi ngày", desc: "Trái cây được hái và đóng gói trong ngày, giữ trọn vị ngọt tự nhiên." },
  { icon: "🚚", title: "Giao hàng nhanh chóng", desc: "Giao trong 2-4 giờ tại nội thành, đảm bảo trái cây đến tay vẫn tươi mới." },
];

const TRUST_BADGES = [
  { icon: "🌿", label: "VietGAP" },
  { icon: "✅", label: "An toàn thực phẩm" },
  { icon: "🔬", label: "Kiểm định chất lượng" },
  { icon: "↩️", label: "Đổi trả trong 24h" },
];

const NEWEST_COUNT = 10;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ limit: NEWEST_COUNT })
      .then((res) => setProducts(res.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">🌱 Tươi hái mỗi ngày</span>
          <h1>Trái cây sạch, ngọt lành từ vườn nhà đến tận bếp bạn</h1>
          <p>
            Vườn Nhà tuyển chọn trái cây tươi ngon từ các nhà vườn khắp Việt Nam, giao nhanh trong ngày
            và cam kết đổi trả nếu không hài lòng.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 30 }}>
        <div className="icon-cat-row">
          {categories.map((c, i) => (
            <div className="icon-cat" key={c.id} onClick={() => navigate(`/products?category_id=${c.id}`)}>
              <div className="icon-cat-circle">{CATEGORY_ICONS[i % CATEGORY_ICONS.length]}</div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>
        <div className="section-title-row">
          <div>
            <div className="section-eyebrow">Sản phẩm mới</div>
            <h2>{NEWEST_COUNT} sản phẩm mới nhất</h2>
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            Xem tất cả sản phẩm →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải sản phẩm...</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(prod) => addToCart(prod, 1)} />
            ))}
          </div>
        )}

        <div className="promo-banner">
          <div>
            <h3>Ưu đãi 10% cho đơn hàng đầu tiên</h3>
            <p>Đăng ký tài khoản ngay hôm nay để nhận ưu đãi dành riêng cho thành viên mới.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Đăng ký ngay</Link>
        </div>
      </div>

      <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-line)" }}>
        <div className="container why-choose">
          <div className="why-choose-media">
            <img
              src="https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&q=60"
              alt="Trái cây tươi Vườn Nhà"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div>
            <div className="section-eyebrow">Vì sao chọn chúng tôi</div>
            <h2 style={{ marginBottom: 20 }}>Tại sao chọn Vườn Nhà</h2>
            {WHY_CHOOSE.map((w) => (
              <div className="why-item" key={w.title}>
                <div className="why-item-icon">{w.icon}</div>
                <div>
                  <h4>{w.title}</h4>
                  <p>{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="trust-strip">
          {TRUST_BADGES.map((b) => (
            <div className="trust-badge" key={b.label}>
              <div className="trust-badge-icon">{b.icon}</div>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
