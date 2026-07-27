export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand-mark">VN</span>
            Vườn Nhà
          </div>
          <p style={{ maxWidth: "40ch", fontSize: "0.86rem", lineHeight: 1.6, opacity: 0.75 }}>
            Trái cây tươi hái từ vườn, tuyển chọn kỹ lưỡng và giao tận tay khách hàng trên toàn quốc.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Zalo">Z</a>
            <a href="#" aria-label="Youtube">▶</a>
          </div>
        </div>

        <div>
          <div className="footer-title">Liên hệ với chúng tôi</div>
          <div className="footer-line">📍 68 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM</div>
          <div className="footer-line">☎ Hotline: 1900 6750</div>
          <div className="footer-line">✉ hotro@vuonnha.vn</div>
          <div className="footer-line">🕐 7:00 - 21:00 tất cả các ngày trong tuần</div>
        </div>

        <div>
          <div className="footer-title">Đăng ký nhận khuyến mãi</div>
          <p style={{ fontSize: "0.84rem", opacity: 0.75, marginTop: 0, marginBottom: 14 }}>
            Nhận ưu đãi và tin tức trái cây theo mùa sớm nhất.
          </p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email của bạn" required />
            <button className="btn btn-primary btn-sm" type="submit">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        © {new Date().getFullYear()} Vườn Nhà. Dự án demo phục vụ mục đích học tập full-stack.
      </div>
    </footer>
  );
}
