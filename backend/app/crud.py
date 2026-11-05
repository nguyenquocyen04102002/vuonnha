from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
from typing import Optional
from zoneinfo import ZoneInfo

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.auth import hash_password
from app.utils import slugify


# ---------- USERS ----------

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, data: schemas.UserRegister, role: models.UserRole = models.UserRole.customer) -> models.User:
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        phone=data.phone,
        address=data.address,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.User)
        .order_by(models.User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_reset_token_hash(db: Session, token_hash: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.reset_token_hash == token_hash).first()


def update_user_role(db: Session, user: models.User, role: models.UserRole) -> models.User:
    user.role = role
    db.commit()
    db.refresh(user)
    return user


# ---------- CATEGORIES ----------

def _unique_slug(db: Session, name: str, model, exclude_id: Optional[int] = None) -> str:
    base = slugify(name) or "danh-muc"
    slug = base
    counter = 1
    query = db.query(model).filter(model.slug == slug)
    if exclude_id:
        query = query.filter(model.id != exclude_id)
    while query.first() is not None:
        counter += 1
        slug = f"{base}-{counter}"
        query = db.query(model).filter(model.slug == slug)
        if exclude_id:
            query = query.filter(model.id != exclude_id)
    return slug


def list_categories(db: Session):
    categories = db.query(models.Category).order_by(models.Category.name).all()
    counts = dict(
        db.query(models.Product.category_id, func.count(models.Product.id))
        .group_by(models.Product.category_id)
        .all()
    )
    result = []
    for c in categories:
        c.product_count = counts.get(c.id, 0)
        result.append(c)
    return result


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def create_category(db: Session, data: schemas.CategoryCreate) -> models.Category:
    category = models.Category(
        name=data.name,
        description=data.description,
        slug=_unique_slug(db, data.name, models.Category),
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category: models.Category, data: schemas.CategoryUpdate) -> models.Category:
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        category.slug = _unique_slug(db, update_data["name"], models.Category, exclude_id=category.id)
    for field, value in update_data.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: models.Category):
    db.delete(category)
    db.commit()


# ---------- PRODUCTS ----------

def list_products(
    db: Session,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    only_active: bool = True,
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(models.Product).options(joinedload(models.Product.category))
    if only_active:
        query = query.filter(models.Product.is_active.is_(True))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()


def count_products(
    db: Session,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    only_active: bool = True,
) -> int:
    """Đếm tổng số sản phẩm khớp cùng bộ lọc với list_products - dùng để tính số trang."""
    query = db.query(models.Product)
    if only_active:
        query = query.filter(models.Product.is_active.is_(True))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    return query.count()


def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return (
        db.query(models.Product)
        .options(joinedload(models.Product.category))
        .filter(models.Product.id == product_id)
        .first()
    )


def create_product(db: Session, data: schemas.ProductCreate) -> models.Product:
    product = models.Product(
        **data.model_dump(),
        slug=_unique_slug(db, data.name, models.Product),
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: models.Product, data: schemas.ProductUpdate) -> models.Product:
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        product.slug = _unique_slug(db, update_data["name"], models.Product, exclude_id=product.id)
    for field, value in update_data.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: models.Product):
    db.delete(product)
    db.commit()


# ---------- CART ----------

def get_cart_items(db: Session, session_id: str):
    return (
        db.query(models.CartItem)
        .options(joinedload(models.CartItem.product).joinedload(models.Product.category))
        .filter(models.CartItem.session_id == session_id)
        .order_by(models.CartItem.created_at.desc())
        .all()
    )


def add_to_cart(db: Session, data: schemas.CartItemCreate, user_id: Optional[int] = None) -> models.CartItem:
    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.session_id == data.session_id,
            models.CartItem.product_id == data.product_id,
        )
        .first()
    )
    if existing:
        existing.quantity += data.quantity
        db.commit()
        db.refresh(existing)
        return existing

    item = models.CartItem(
        session_id=data.session_id,
        product_id=data.product_id,
        quantity=data.quantity,
        user_id=user_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_cart_item(db: Session, item_id: int, session_id: str) -> Optional[models.CartItem]:
    return (
        db.query(models.CartItem)
        .filter(models.CartItem.id == item_id, models.CartItem.session_id == session_id)
        .first()
    )


def update_cart_item_quantity(db: Session, item: models.CartItem, quantity: int) -> models.CartItem:
    item.quantity = quantity
    db.commit()
    db.refresh(item)
    return item


def remove_cart_item(db: Session, item: models.CartItem):
    db.delete(item)
    db.commit()


def clear_cart(db: Session, session_id: str):
    db.query(models.CartItem).filter(models.CartItem.session_id == session_id).delete()
    db.commit()


# ---------- ORDERS ----------

def create_order_from_cart(
    db: Session,
    data: schemas.CheckoutRequest,
    user: models.User,
) -> models.Order:
    cart_items = get_cart_items(db, data.session_id)
    if not cart_items:
        raise ValueError("Giỏ hàng đang trống, không thể đặt hàng.")

    total = Decimal(0)
    order_items = []
    for ci in cart_items:
        if not ci.product or not ci.product.is_active:
            raise ValueError(f"Sản phẩm '{ci.product.name if ci.product else ci.product_id}' hiện không khả dụng.")
        if ci.product.stock < ci.quantity:
            raise ValueError(f"Sản phẩm '{ci.product.name}' không đủ tồn kho ({ci.product.stock} còn lại).")
        subtotal = Decimal(ci.product.price) * ci.quantity
        total += subtotal
        order_items.append(
            models.OrderItem(
                product_id=ci.product.id,
                product_name=ci.product.name,
                product_image_url=ci.product.image_url,
                price=ci.product.price,
                quantity=ci.quantity,
            )
        )
        ci.product.stock -= ci.quantity

    order = models.Order(
        user_id=user.id,
        total_amount=total,
        shipping_name=data.shipping_name,
        shipping_phone=data.shipping_phone,
        shipping_address=data.shipping_address,
        note=data.note,
        payment_method=data.payment_method,
        items=order_items,
    )
    db.add(order)
    clear_cart(db, data.session_id)
    db.commit()
    db.refresh(order)
    return order


def list_orders_by_user(db: Session, user_id: int):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


def get_order(db: Session, order_id: int) -> Optional[models.Order]:
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.items), joinedload(models.Order.user))
        .filter(models.Order.id == order_id)
        .first()
    )


def list_all_orders(db: Session, status: Optional[models.OrderStatus] = None, skip: int = 0, limit: int = 200):
    query = db.query(models.Order).options(joinedload(models.Order.items), joinedload(models.Order.user))
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


def update_order_status(db: Session, order: models.Order, status: models.OrderStatus) -> models.Order:
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def admin_stats(db: Session) -> dict:
    total_revenue = (
        db.query(func.coalesce(func.sum(models.Order.total_amount), 0))
        .filter(models.Order.status.in_([models.OrderStatus.paid, models.OrderStatus.completed]))
        .scalar()
    )
    return {
        "total_products": db.query(func.count(models.Product.id)).scalar(),
        "total_categories": db.query(func.count(models.Category.id)).scalar(),
        "total_users": db.query(func.count(models.User.id)).filter(models.User.role == models.UserRole.customer).scalar(),
        "total_orders": db.query(func.count(models.Order.id)).scalar(),
        "pending_orders": db.query(func.count(models.Order.id)).filter(models.Order.status == models.OrderStatus.pending).scalar(),
        "paid_orders": db.query(func.count(models.Order.id)).filter(models.Order.status.in_([models.OrderStatus.paid, models.OrderStatus.completed])).scalar(),
        "total_revenue": total_revenue,
    }


# ---------- DASHBOARD CHI TIẾT ----------

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
PAID_STATUSES = [models.OrderStatus.paid, models.OrderStatus.completed]
LOW_STOCK_THRESHOLD = 10


def _vn_day_start_utc(day) -> datetime:
    """0h sáng (giờ Việt Nam) của ngày `day`, quy ra UTC dạng naive - khớp với cột created_at (lưu UTC)."""
    local = datetime.combine(day, time.min, tzinfo=VN_TZ)
    return local.astimezone(timezone.utc).replace(tzinfo=None)


def _pct_change(current, previous):
    """% thay đổi so với kỳ trước; None nếu kỳ trước bằng 0 (không so sánh được)."""
    if not previous:
        return None
    return round((float(current) - float(previous)) / float(previous) * 100, 1)


def _period_kpis(db: Session, start: datetime, end: datetime) -> dict:
    O = models.Order
    in_range = (O.created_at >= start, O.created_at < end)
    revenue = (
        db.query(func.coalesce(func.sum(O.total_amount), 0))
        .filter(*in_range, O.status.in_(PAID_STATUSES))
        .scalar()
    )
    paid_orders = db.query(func.count(O.id)).filter(*in_range, O.status.in_(PAID_STATUSES)).scalar()
    total_orders = db.query(func.count(O.id)).filter(*in_range, O.status != models.OrderStatus.cancelled).scalar()
    new_customers = (
        db.query(func.count(models.User.id))
        .filter(
            models.User.created_at >= start,
            models.User.created_at < end,
            models.User.role == models.UserRole.customer,
        )
        .scalar()
    )
    revenue = int(revenue)
    return {
        "revenue": revenue,
        "orders": int(total_orders),
        "paid_orders": int(paid_orders),
        "avg_order_value": int(revenue / paid_orders) if paid_orders else 0,
        "new_customers": int(new_customers),
    }


def admin_dashboard(db: Session, days: int = 30) -> dict:
    """Gom toàn bộ số liệu cho trang Tổng quan trong 1 lần gọi. `days` = số ngày (tính cả hôm nay, giờ VN)."""
    O, OI, P = models.Order, models.OrderItem, models.Product

    today = datetime.now(VN_TZ).date()
    start_day = today - timedelta(days=days - 1)
    prev_start_day = start_day - timedelta(days=days)
    start = _vn_day_start_utc(start_day)
    end = _vn_day_start_utc(today + timedelta(days=1))
    prev_start = _vn_day_start_utc(prev_start_day)

    cur = _period_kpis(db, start, end)
    prev = _period_kpis(db, prev_start, start)
    kpis = {
        k: {"value": cur[k], "change_pct": _pct_change(cur[k], prev[k])}
        for k in ("revenue", "orders", "avg_order_value", "new_customers")
    }
    kpis["pending_orders"] = {
        "value": int(db.query(func.count(O.id)).filter(O.status == models.OrderStatus.pending).scalar())
    }

    # --- Doanh thu theo ngày (gom theo ngày giờ VN, ngày không có đơn vẫn có điểm = 0) ---
    day_expr = func.date_trunc("day", func.timezone("Asia/Ho_Chi_Minh", func.timezone("UTC", O.created_at)))
    rows = (
        db.query(day_expr.label("d"), func.sum(O.total_amount), func.count(O.id))
        .filter(O.created_at >= start, O.created_at < end, O.status.in_(PAID_STATUSES))
        .group_by("d")
        .all()
    )
    by_day = {r[0].date(): (int(r[1]), int(r[2])) for r in rows}
    revenue_by_day = []
    for i in range(days):
        d = start_day + timedelta(days=i)
        rev, cnt = by_day.get(d, (0, 0))
        revenue_by_day.append({"date": d.isoformat(), "label": d.strftime("%d/%m"), "revenue": rev, "orders": cnt})

    # --- Số đơn theo trạng thái (trong kỳ) ---
    status_counts = dict(
        db.query(O.status, func.count(O.id)).filter(O.created_at >= start, O.created_at < end).group_by(O.status).all()
    )
    orders_by_status = [
        {"status": s.value, "count": int(status_counts.get(s, 0))} for s in models.OrderStatus
    ]

    # --- Top 5 sản phẩm bán chạy (đơn đã thanh toán, gom theo tên snapshot trong order_items) ---
    top_rows = (
        db.query(
            OI.product_name,
            func.sum(OI.quantity).label("qty"),
            func.sum(OI.price * OI.quantity).label("rev"),
        )
        .join(O, O.id == OI.order_id)
        .filter(O.created_at >= start, O.created_at < end, O.status.in_(PAID_STATUSES))
        .group_by(OI.product_name)
        .order_by(func.sum(OI.price * OI.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [{"name": r[0], "quantity": int(r[1]), "revenue": int(r[2])} for r in top_rows]

    # --- Doanh thu theo danh mục (sản phẩm/danh mục đã xoá gom vào "Khác") ---
    cat_name = func.coalesce(models.Category.name, "Khác")
    cat_rows = (
        db.query(cat_name, func.sum(OI.price * OI.quantity))
        .select_from(OI)
        .join(O, O.id == OI.order_id)
        .outerjoin(P, P.id == OI.product_id)
        .outerjoin(models.Category, models.Category.id == P.category_id)
        .filter(O.created_at >= start, O.created_at < end, O.status.in_(PAID_STATUSES))
        .group_by(cat_name)
        .order_by(func.sum(OI.price * OI.quantity).desc())
        .all()
    )
    revenue_by_category = [{"name": r[0], "revenue": int(r[1])} for r in cat_rows]

    # --- Sản phẩm sắp hết hàng ---
    low_stock = [
        {"id": p.id, "name": p.name, "stock": p.stock, "unit": p.unit}
        for p in db.query(P)
        .filter(P.is_active.is_(True), P.stock <= LOW_STOCK_THRESHOLD)
        .order_by(P.stock.asc(), P.name.asc())
        .limit(8)
        .all()
    ]

    # --- 8 đơn mới nhất (mọi trạng thái, không phụ thuộc kỳ lọc) ---
    recent_orders = [
        {
            "id": o.id,
            "order_code": o.order_code,
            "customer": o.shipping_name,
            "total_amount": int(o.total_amount),
            "status": o.status.value,
            "created_at": o.created_at.isoformat() + "Z",
        }
        for o in db.query(O).order_by(O.created_at.desc()).limit(8).all()
    ]

    # --- Đánh giá: phân bố số sao + 5 đánh giá mới nhất ---
    star_counts = dict(db.query(models.Review.rating, func.count(models.Review.id)).group_by(models.Review.rating).all())
    total_reviews = sum(star_counts.values())
    avg_rating = (
        round(sum(k * v for k, v in star_counts.items()) / total_reviews, 1) if total_reviews else 0.0
    )
    latest_reviews = [
        {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "user_name": r.user.name if r.user else "Người dùng đã xoá",
            "product_name": r.product.name if r.product else "",
            "created_at": r.created_at.isoformat() + "Z",
        }
        for r in db.query(models.Review)
        .options(joinedload(models.Review.user), joinedload(models.Review.product))
        .order_by(models.Review.created_at.desc())
        .limit(5)
        .all()
    ]

    return {
        "days": days,
        "from_date": start_day.isoformat(),
        "to_date": today.isoformat(),
        "kpis": kpis,
        "totals": admin_stats(db),
        "revenue_by_day": revenue_by_day,
        "orders_by_status": orders_by_status,
        "top_products": top_products,
        "revenue_by_category": revenue_by_category,
        "low_stock": low_stock,
        "low_stock_threshold": LOW_STOCK_THRESHOLD,
        "recent_orders": recent_orders,
        "ratings": {
            "average": avg_rating,
            "total": total_reviews,
            "distribution": [{"stars": s, "count": int(star_counts.get(s, 0))} for s in (5, 4, 3, 2, 1)],
            "latest": latest_reviews,
        },
    }


# ---------- ĐÁNH GIÁ SẢN PHẨM ----------

def get_reviews_for_product(db: Session, product_id: int, skip: int = 0, limit: int = 50):
    return (
        db.query(models.Review)
        .options(joinedload(models.Review.user))
        .filter(models.Review.product_id == product_id)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_review_summary(db: Session, product_id: int) -> dict:
    avg_rating, total = (
        db.query(func.avg(models.Review.rating), func.count(models.Review.id))
        .filter(models.Review.product_id == product_id)
        .first()
    )
    return {
        "average_rating": round(float(avg_rating), 1) if avg_rating else 0.0,
        "total_reviews": total or 0,
    }


def get_my_review(db: Session, product_id: int, user_id: int) -> Optional[models.Review]:
    return (
        db.query(models.Review)
        .filter(models.Review.product_id == product_id, models.Review.user_id == user_id)
        .first()
    )


def upsert_review(db: Session, product_id: int, user_id: int, data: schemas.ReviewCreate) -> models.Review:
    """Tạo mới đánh giá, hoặc cập nhật nếu người này đã đánh giá sản phẩm này trước đó."""
    existing = get_my_review(db, product_id, user_id)
    if existing:
        existing.rating = data.rating
        existing.comment = data.comment
        db.commit()
        db.refresh(existing)
        return existing

    review = models.Review(
        product_id=product_id,
        user_id=user_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    return (
        db.query(models.Review)
        .options(joinedload(models.Review.user), joinedload(models.Review.product))
        .filter(models.Review.id == review_id)
        .first()
    )


def delete_review(db: Session, review: models.Review):
    db.delete(review)
    db.commit()


def list_all_reviews_admin(db: Session, skip: int = 0, limit: int = 200):
    return (
        db.query(models.Review)
        .options(joinedload(models.Review.user), joinedload(models.Review.product))
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
