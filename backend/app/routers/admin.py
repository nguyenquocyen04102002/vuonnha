from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import get_current_admin
from app.config import settings
from app.database import get_db

router = APIRouter(prefix="/api/admin", tags=["Quản trị"], dependencies=[Depends(get_current_admin)])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Số liệu tổng quan hiển thị trên trang chủ dashboard."""
    return crud.admin_stats(db)


# ---------- Duyệt đơn hàng / xem danh sách đơn hàng ----------

@router.get("/orders", response_model=list[schemas.OrderOut])
def list_orders(status: Optional[models.OrderStatus] = None, db: Session = Depends(get_db)):
    """Xem toàn bộ đơn hàng. Truyền ?status=paid để chỉ xem đơn đã thanh toán, v.v."""
    return crud.list_all_orders(db, status=status)


@router.get("/orders/paid", response_model=list[schemas.OrderOut])
def list_paid_orders(db: Session = Depends(get_db)):
    """Danh sách đơn hàng đã thanh toán (paid + completed) - dùng riêng cho mục
    'xem danh sách đơn hàng đã thanh toán' trong yêu cầu."""
    paid = crud.list_all_orders(db, status=models.OrderStatus.paid)
    completed = crud.list_all_orders(db, status=models.OrderStatus.completed)
    combined = paid + completed
    combined.sort(key=lambda o: o.created_at, reverse=True)
    return combined


@router.put("/orders/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(order_id: int, payload: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    """Duyệt đơn hàng: chuyển trạng thái (pending -> confirmed -> paid -> shipping -> completed), hoặc huỷ."""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")
    return crud.update_order_status(db, order, payload.status)


# ---------- Danh sách người dùng ----------

@router.get("/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    return crud.list_users(db)


@router.put("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: int,
    payload: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin),
):
    """Phân quyền customer <-> admin cho 1 người dùng.

    CHỈ tài khoản admin gốc (email khớp với ADMIN_EMAIL trong cấu hình, mặc định
    admin@vuonnha.com) mới được phép gọi endpoint này - các admin khác (nếu có,
    do chính admin gốc phân quyền) KHÔNG được phân quyền tiếp cho người khác,
    tránh việc admin thường tự leo thang quyền cho nhau.
    """
    if current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="Chỉ tài khoản quản trị viên gốc mới có quyền phân quyền người dùng.",
        )

    target_user = crud.get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Không thể tự thay đổi quyền của chính mình.")

    return crud.update_user_role(db, target_user, payload.role)


# ---------- Quản lý đánh giá sản phẩm ----------

@router.get("/reviews", response_model=list[schemas.ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    """Xem toàn bộ đánh giá của mọi sản phẩm - phục vụ việc kiểm duyệt nội dung không phù hợp."""
    return crud.list_all_reviews_admin(db)


@router.delete("/reviews/{review_id}", status_code=204)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = crud.get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Không tìm thấy đánh giá.")
    crud.delete_review(db, review)
