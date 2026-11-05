import logo from "../assets/logovuonnha.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
                              <div>
                                <div className="footer-brand" style={{ textAlign: "center" }}>
                      <img
                      src={logo}
                      alt="Vườn Nhà"
                      style={{
                      width: "150px",
                      height: "65px",
                      objectFit: "contain",
                      }}
                      />
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
          <div className="footer-line">📍 82 Đường 47, Phường Tân Tạo, Quận Bình Tân, Thành Phố Hồ Chí Minh</div>
          <div className="footer-line">☎ Hotline: 0376704405</div>
          <div className="footer-line">✉ yennguyen04102002@gmail.com</div>
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
