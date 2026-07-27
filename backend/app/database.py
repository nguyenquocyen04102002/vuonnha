"""
File kết nối database riêng biệt cho toàn bộ dự án.
Mọi module khác (models, routers, crud...) đều import engine / SessionLocal / get_db từ đây.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency cấp phát 1 session DB cho mỗi request, tự đóng khi xong."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
