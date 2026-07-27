import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer,
    Numeric, String, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    pending = "pending"        # Chờ xác nhận
    confirmed = "confirmed"    # Đã duyệt / xác nhận
    paid = "paid"               # Đã thanh toán
    shipping = "shipping"       # Đang giao hàng
    completed = "completed"     # Hoàn tất
    cancelled = "cancelled"     # Đã hủy


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    address = Column(String(500), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    orders = relationship("Order", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(12, 0), nullable=False)  # VNĐ, không thập phân
    unit = Column(String(50), default="kg", nullable=False)  # kg, hộp, trái...
    image_url = Column(String(1000), nullable=True)
    stock = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    cart_items = relationship("CartItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("session_id", "product_id", name="uq_cart_session_product"),)

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)  # UUID phía frontend (localStorage)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(30), unique=True, index=True, default=lambda: f"VN{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)
    total_amount = Column(Numeric(14, 0), nullable=False)

    shipping_name = Column(String(255), nullable=False)
    shipping_phone = Column(String(30), nullable=False)
    shipping_address = Column(String(500), nullable=False)
    note = Column(String(500), nullable=True)
    payment_method = Column(String(50), default="cod", nullable=False)  # cod | bank_transfer

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)

    # Snapshot lại thông tin sản phẩm tại thời điểm mua, tránh vỡ dữ liệu khi sản phẩm bị sửa/xoá sau này
    product_name = Column(String(255), nullable=False)
    price = Column(Numeric(12, 0), nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")


class Review(Base):
    __tablename__ = "reviews"
    # Mỗi người dùng chỉ được đánh giá 1 sản phẩm 1 lần - gửi lại sẽ cập nhật đánh giá cũ
    __table_args__ = (UniqueConstraint("product_id", "user_id", name="uq_review_product_user"),)

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 đến 5 sao
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User")
