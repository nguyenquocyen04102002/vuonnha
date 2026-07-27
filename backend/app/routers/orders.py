from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/orders", tags=["Đơn hàng"])


@router.post("", response_model=schemas.OrderOut, status_code=201)
def checkout(payload: schemas.CheckoutRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Tạo đơn hàng (mua hàng / thanh toán) từ giỏ hàng hiện tại. Yêu cầu đăng nhập."""
    try:
        order = crud.create_order_from_cart(db, payload, current_user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return order


@router.get("/my", response_model=list[schemas.OrderOut])
def my_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.list_orders_by_user(db, current_user.id)


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng.")
    if order.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem đơn hàng này.")
    return order
