from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter(prefix="/api/cart", tags=["Giỏ hàng"])


def _build_cart_out(items) -> schemas.CartOut:
    total_amount = sum((Decimal(i.product.price) * i.quantity for i in items), Decimal(0))
    total_items = sum(i.quantity for i in items)
    return schemas.CartOut(items=items, total_items=total_items, total_amount=total_amount)


@router.get("/{session_id}", response_model=schemas.CartOut)
def get_cart(session_id: str, db: Session = Depends(get_db)):
    items = crud.get_cart_items(db, session_id)
    return _build_cart_out(items)


@router.post("/items", response_model=schemas.CartItemOut, status_code=201)
def add_item(payload: schemas.CartItemCreate, db: Session = Depends(get_db), user=Depends(get_optional_user)):
    product = crud.get_product(db, payload.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại hoặc đã ngừng bán.")
    if product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail=f"Chỉ còn {product.stock} sản phẩm trong kho.")
    return crud.add_to_cart(db, payload, user_id=user.id if user else None)


@router.put("/items/{item_id}", response_model=schemas.CartItemOut)
def update_item(item_id: int, payload: schemas.CartItemUpdate, session_id: str, db: Session = Depends(get_db)):
    item = crud.get_cart_item(db, item_id, session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm trong giỏ hàng.")
    if item.product.stock < payload.quantity:
        raise HTTPException(status_code=400, detail=f"Chỉ còn {item.product.stock} sản phẩm trong kho.")
    return crud.update_cart_item_quantity(db, item, payload.quantity)


@router.delete("/items/{item_id}", status_code=204)
def remove_item(item_id: int, session_id: str, db: Session = Depends(get_db)):
    item = crud.get_cart_item(db, item_id, session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm trong giỏ hàng.")
    crud.remove_cart_item(db, item)


@router.delete("/{session_id}", status_code=204)
def clear(session_id: str, db: Session = Depends(get_db)):
    crud.clear_cart(db, session_id)
