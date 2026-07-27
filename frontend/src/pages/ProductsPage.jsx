import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi, categoriesApi } from "../api/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Toàn bộ trạng thái lọc/trang được lưu ngay trên URL (?search=&category_id=&page=)
  // -> có thể copy link chia sẻ, bấm Back/Forward của trình duyệt hoạt động đúng.
  const search = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category_id") ? Number(searchParams.get("category_id")) : null;
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    categoriesApi.list().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE };
    if (activeCategory) params.category_id = activeCategory;
    if (search) params.search = search;
    productsApi
      .list(params)
      .then((res) => {
        setProducts(res.data.items);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, search, page]);

  function updateParams(next) {
    const merged = { search, category_id: activeCategory || "", page: 1, ...next };
    const cleaned = {};
    if (merged.search) cleaned.search = merged.search;
    if (merged.category_id) cleaned.category_id = merged.category_id;
    if (merged.page && merged.page !== 1) cleaned.page = merged.page;
    setSearchParams(cleaned);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div className="section-title-row">
        <div>
          <div className="section-eyebrow">Sản phẩm</div>
          <h2>Tất cả sản phẩm</h2>
        </div>
        <input
          type="text"
          placeholder="Tìm trái cây..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value, page: 1 })}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1.5px solid var(--color-line-strong)",
            minWidth: 220,
          }}
        />
      </div>

      <CategoryFilter
        categories={categories}
        activeId={activeCategory}
        onChange={(id) => updateParams({ category_id: id || "", page: 1 })}
      />

      {loading ? (
        <div className="loading-state">Đang tải sản phẩm...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>Không tìm thấy sản phẩm phù hợp</h3>
          <p>Thử chọn danh mục khác hoặc từ khoá tìm kiếm khác.</p>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--color-ink-soft)", fontSize: "0.88rem", margin: "-8px 0 4px" }}>
            {total} sản phẩm
          </p>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={(prod) => addToCart(prod, 1)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 })}
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`pagination-page ${p === page ? "active" : ""}`}
                  onClick={() => updateParams({ page: p })}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 })}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
