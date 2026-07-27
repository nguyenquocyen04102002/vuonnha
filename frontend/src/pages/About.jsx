import { Link } from "react-router-dom";

const STATS = [
  { label: "Nhà vườn liên kết", value: "50+" },
  { label: "Loại trái cây", value: "14+" },
  { label: "Khách hàng tin dùng", value: "1.000+" },
  { label: "Tỉ lệ trái cây tươi", value: "100%" },
];

const VALUES = [
  { icon: "🌱", title: "Nguồn gốc rõ ràng", desc: "Mỗi loại trái cây đều có thông tin nhà vườn cụ thể, thu mua trực tiếp không qua trung gian." },
  { icon: "🍃", title: "Tươi mới mỗi ngày", desc: "Trái cây được hái, đóng gói và giao trong ngày - không lưu kho lâu, không dùng chất bảo quản." },
  { icon: "🤝", title: "Đồng hành cùng nhà vườn", desc: "Cam kết thu mua giá ổn định, hỗ trợ kỹ thuật canh tác bền vững cho các hộ nông dân đối tác." },
  { icon: "💚", title: "Vì sức khoẻ cộng đồng", desc: "Ưu tiên sản phẩm đạt chuẩn VietGAP, kiểm định an toàn thực phẩm trước khi đến tay khách hàng." },
];

const TIMELINE = [
  { step: "1", title: "Thu hoạch", desc: "Trái cây được hái đúng độ chín từ vườn liên kết mỗi sáng sớm." },
  { step: "2", title: "Kiểm định", desc: "Phân loại, kiểm tra chất lượng và loại bỏ sản phẩm không đạt chuẩn." },
  { step: "3", title: "Đóng gói", desc: "Đóng gói cẩn thận, giữ độ tươi trong suốt quá trình vận chuyển." },
  { step: "4", title: "Giao hàng", desc: "Giao tận tay khách hàng trong 2-4 giờ tại nội thành." },
];

export default function About() {
  return (
    <div>
      <section className="hero">
        <div className="container">
          <span className="hero-eyebrow">🍃 Về chúng tôi</span>
          <h1>Vườn Nhà - Trái cây sạch từ tâm huyết người trồng</h1>
          <p>
            Chúng tôi kết nối trực tiếp các nhà vườn Việt Nam với bàn ăn của bạn, mang đến trái cây
            tươi ngon, an toàn và minh bạch về nguồn gốc.
          </p>
        </div>
      </section>

      {/* Câu chuyện */}
      <div className="container why-choose">
        <div className="why-choose-media">
          <img
            src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=60"
            alt="Vườn trái cây"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
        <div>
          <div className="section-eyebrow">Câu chuyện của chúng tôi</div>
          <h2 style={{ marginBottom: 16 }}>Bắt đầu từ một khu vườn nhỏ</h2>
          <p style={{ color: "var(--color-ink-soft)", lineHeight: 1.7, marginBottom: 14 }}>
            Vườn Nhà ra đời từ mong muốn đơn giản: giúp mọi gia đình Việt Nam tiếp cận được trái cây
            tươi ngon, sạch và đúng giá - không phải qua nhiều tầng trung gian như cách mua bán truyền thống.
          </p>
          <p style={{ color: "var(--color-ink-soft)", lineHeight: 1.7 }}>
            Từ vài nhà vườn quen thuộc ở miền Tây và Tây Nguyên, đến nay Vườn Nhà đã liên kết với hàng
            chục nhà vườn trên khắp cả nước, mỗi ngày mang hàng trăm phần trái cây tươi đến tay khách hàng.
          </p>
        </div>
      </div>

      {/* Số liệu */}
      <div className="container">
        <div className="stat-grid">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label} style={{ textAlign: "center" }}>
              <div className="stat-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
              <div className="stat-label" style={{ marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Giá trị cốt lõi */}
      <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)" }}>
        <div className="container" style={{ padding: "48px 20px" }}>
          <div className="section-center">
            <div className="section-eyebrow">Giá trị cốt lõi</div>
            <h2>Điều làm nên Vườn Nhà</h2>
          </div>
          <div className="product-grid" style={{ marginTop: 28 }}>
            {VALUES.map((v) => (
              <div className="crate-card" key={v.title} style={{ padding: "24px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>{v.icon}</div>
                <h3 style={{ marginBottom: 8 }}>{v.title}</h3>
                <p style={{ color: "var(--color-ink-soft)", fontSize: "0.88rem", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quy trình */}
      <div className="container" style={{ padding: "48px 20px" }}>
        <div className="section-center">
          <div className="section-eyebrow">Quy trình</div>
          <h2>Từ vườn tới bàn ăn</h2>
        </div>
        <div className="product-grid" style={{ marginTop: 28 }}>
          {TIMELINE.map((t) => (
            <div key={t.step} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: "50%", background: "var(--color-primary)",
                  color: "#fff", display: "grid", placeItems: "center", fontWeight: 800,
                  margin: "0 auto 14px", fontSize: "1.1rem",
                }}
              >
                {t.step}
              </div>
              <h4 style={{ marginBottom: 6 }}>{t.title}</h4>
              <p style={{ color: "var(--color-ink-soft)", fontSize: "0.86rem", lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container" style={{ paddingBottom: 56 }}>
        <div className="promo-banner">
          <div>
            <h3>Sẵn sàng thưởng thức trái cây tươi?</h3>
            <p>Khám phá ngay hơn chục loại trái cây đang có sẵn tại Vườn Nhà.</p>
          </div>
          <Link to="/products" className="btn btn-primary">Xem sản phẩm</Link>
        </div>
      </div>
    </div>
  );
}
