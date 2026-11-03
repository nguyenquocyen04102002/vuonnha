#!/bin/sh
set -e

echo ">> Cho backend chờ PostgreSQL sẵn sàng..."
python -c "
import time, sys
from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.database_url)
for i in range(30):
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        print('>> PostgreSQL da san sang')
        sys.exit(0)
    except Exception as e:
        print(f'>> Cho PostgreSQL... ({i+1}/30)')
        time.sleep(2)
print('>> Khong the ket noi PostgreSQL')
sys.exit(1)
"

echo ">> Chạy Alembic migration (alembic upgrade head)..."
alembic upgrade head

echo ">> Nạp dữ liệu mẫu (nếu database còn trống)..."
python -m app.seed

echo ">> Khởi động FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
