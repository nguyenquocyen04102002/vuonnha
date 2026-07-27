from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/products", tags=["Đánh giá sản phẩm"])


@router.get("/{product_id}/reviews", response_model=list[schemas.ReviewOut])
def list_reviews(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    return crud.get_reviews_for_product(db, product_id)


@router.get("/{product_id}/reviews/summary", response_model=schemas.ReviewSummary)
def review_summary(product_id: int, db: Session = Depends(get_db)):
    return crud.get_review_summary(db, product_id)


@router.get("/{product_id}/reviews/me", response_model=schemas.ReviewOut | None)
def my_review(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Trả về đánh giá của chính người dùng hiện tại cho sản phẩm này (nếu có) -
    để frontend biết hiển thị form 'gửi đánh giá' hay 'sửa đánh giá'."""
    return crud.get_my_review(db, product_id, current_user.id)


@router.post("/{product_id}/reviews", response_model=schemas.ReviewOut, status_code=201)
def submit_review(
    product_id: int,
    payload: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm.")
    return crud.upsert_review(db, product_id, current_user.id, payload)


@router.delete("/{product_id}/reviews/me", status_code=204)
def delete_my_review(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    review = crud.get_my_review(db, product_id, current_user.id)
    if not review:
        raise HTTPException(status_code=404, detail="Bạn chưa đánh giá sản phẩm này.")
    crud.delete_review(db, review)
