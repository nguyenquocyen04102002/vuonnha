from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import OrderStatus, UserRole


# ---------- AUTH / USER ----------

class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdateMe(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserRoleUpdate(BaseModel):
    role: UserRole


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=100)


# ---------- CATEGORY ----------

class CategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    product_count: Optional[int] = 0


# ---------- PRODUCT ----------

class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(gt=0)
    unit: str = "kg"
    image_url: Optional[str] = None
    stock: int = Field(ge=0, default=0)
    is_active: bool = True
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    unit: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryOut] = None


class ProductListOut(BaseModel):
    """Danh sách sản phẩm kèm tổng số bản ghi khớp bộ lọc - dùng để tính số trang phân trang."""
    items: list[ProductOut]
    total: int


# ---------- CART ----------

class CartItemCreate(BaseModel):
    session_id: str
    product_id: int
    quantity: int = Field(gt=0, default=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: ProductOut


class CartOut(BaseModel):
    items: list[CartItemOut]
    total_items: int
    total_amount: Decimal


# ---------- ORDER ----------

class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: Optional[int]
    product_name: str
    price: Decimal
    quantity: int


class CheckoutRequest(BaseModel):
    session_id: str
    shipping_name: str = Field(min_length=2, max_length=255)
    shipping_phone: str = Field(min_length=8, max_length=30)
    shipping_address: str = Field(min_length=5, max_length=500)
    note: Optional[str] = None
    payment_method: str = "cod"


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_code: str
    status: OrderStatus
    total_amount: Decimal
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    note: Optional[str] = None
    payment_method: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]
    user: Optional[UserOut] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ---------- ĐÁNH GIÁ SẢN PHẨM ----------

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ReviewAuthorOut(BaseModel):
    """Thông tin tối giản về người đánh giá - KHÔNG lộ email/sđt/địa chỉ ra công khai."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ReviewProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user: ReviewAuthorOut
    product: Optional[ReviewProductOut] = None


class ReviewSummary(BaseModel):
    average_rating: float
    total_reviews: int
