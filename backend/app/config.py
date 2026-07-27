"""
Cấu hình ứng dụng - đọc toàn bộ giá trị từ biến môi trường (được Docker Compose bơm vào).

LƯU Ý QUAN TRỌNG (rút kinh nghiệm từ các lần triển khai trước):
Mật khẩu PostgreSQL có thể chứa ký tự đặc biệt như '@'. Nếu ta tự nối chuỗi
"postgresql://user:pass@host:port/db" bằng f-string, ký tự '@' trong mật khẩu
sẽ bị hiểu nhầm là dấu phân tách trước phần host và làm sai kết nối.
=> Giải pháp: luôn dùng sqlalchemy.engine.URL.create() để build DATABASE_URL,
   vì hàm này tự động percent-encode các ký tự đặc biệt một cách an toàn.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # PostgreSQL - từng biến riêng lẻ, KHÔNG ghép chuỗi thủ công
    POSTGRES_USER: str = "vuonnha"
    POSTGRES_PASSWORD: str = "vuonnha_password"
    POSTGRES_DB: str = "vuonnha_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    # JWT / bảo mật
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 giờ

    # Tài khoản admin khởi tạo (được seed script sử dụng)
    ADMIN_EMAIL: str = "admin@vuonnha.com"
    ADMIN_PASSWORD: str = "Admin@123"
    ADMIN_NAME: str = "Quản trị viên"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @property
    def database_url(self) -> str:
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        ).render_as_string(hide_password=False)


settings = Settings()
