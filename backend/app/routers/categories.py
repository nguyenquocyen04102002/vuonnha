from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_current_admin
from app.database import get_db

router = APIRouter(prefix="/api/categories", tags=["Danh mục"])


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.list_categories(db)


@router.get("/{category_id}", response_model=schemas.CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    return category


@router.post("", response_model=schemas.CategoryOut, status_code=201, dependencies=[Depends(get_current_admin)])
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, payload)


@router.put("/{category_id}", response_model=schemas.CategoryOut, dependencies=[Depends(get_current_admin)])
def update_category(category_id: int, payload: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    return crud.update_category(db, category, payload)


@router.delete("/{category_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Không tìm thấy danh mục.")
    crud.delete_category(db, category)
