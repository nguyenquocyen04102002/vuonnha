"""
LƯU Ý QUAN TRỌNG (rút kinh nghiệm từ các lần triển khai trước):
Alembic's Config object dùng configparser bên dưới. Nếu ta percent-encode mật khẩu
(vd '@' -> '%40') rồi gọi config.set_main_option("sqlalchemy.url", url), configparser
sẽ hiểu ký tự '%' là cú pháp interpolation và ném lỗi.
=> Giải pháp: KHÔNG bao giờ đi qua config.set_main_option(). Thay vào đó, import thẳng
   biến DATABASE_URL (dạng chuỗi Python, không qua configparser) và truyền trực tiếp
   vào create_engine().
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine

from app.database import Base
from app.config import settings
from app import models  # noqa: F401  (import để Alembic thấy hết các model khi autogenerate)

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Lấy URL trực tiếp từ Python, không đi qua configparser của alembic.ini
DATABASE_URL = settings.database_url


def run_migrations_offline() -> None:
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(DATABASE_URL, pool_pre_ping=True)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
