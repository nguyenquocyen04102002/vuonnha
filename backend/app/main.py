from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers import admin, auth, cart, categories, orders, products, reviews, upload

app = FastAPI(
    title="Vườn Nhà API",
    description="API cho website bán trái cây Vườn Nhà - xem sản phẩm, giỏ hàng, đặt hàng, xác thực và quản trị.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ ảnh đã upload tại địa chỉ /uploads/<tên file>
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(upload.router)
app.include_router(reviews.router)


@app.get("/api/health", tags=["Hệ thống"])
def health_check():
    return {"status": "ok", "service": "vuon-nha-api"}


@app.get("/", tags=["Hệ thống"])
def root():
    return {"message": "Chào mừng đến với API của Vườn Nhà 🍉", "docs": "/docs"}
