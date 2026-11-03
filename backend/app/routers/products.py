from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/products", tags=["Sản phẩm"])


@router.get("", response_model=schemas.ProductListOut)
def list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    items = crud.list_products(db, category_id=category_id, search=search, skip=skip, limit=limit)
    total = crud.count_products(db, category_id=category_id, search=search)
    return {"items": items, "total": total}


# ---------- Các API dành cho quản trị viên (phải khai báo TRƯỚC "/{product_id}") ----------

@router.get("/admin/all", response_model=list[schemas.ProductOut], dependencies=[Depends(get_current_admin)])
def admin_list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
):
    return crud.list_products(db, category_id=category_id, search=search, only_active=False, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    return product


@router.post("", response_model=schemas.ProductOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, payload)


@router.put("/{product_id}", response_model=schemas.ProductOut, dependencies=[Depends(get_current_admin)])
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    return crud.update_product(db, product, payload)


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    crud.delete_product(db, product)
