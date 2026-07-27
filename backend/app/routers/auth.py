from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Xác thực"])


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký.")
    user = crud.create_user(db, payload)
    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=user)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tài khoản của bạn đã bị khoá.")
    token = create_access_token({"sub": str(user.id)})
    return schemas.Token(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(payload: schemas.UserUpdateMe, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(
    payload: schemas.ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải khác mật khẩu hiện tại.")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu thành công."}


# Lưu ý: JWT là stateless, nên "đăng xuất" thực chất được xử lý ở phía frontend
# bằng cách xoá access token khỏi localStorage. Endpoint này chỉ để tường minh hoá API
# và có thể mở rộng thành cơ chế token-blacklist sau này nếu cần.
@router.post("/logout")
def logout():
    return {"message": "Đăng xuất thành công. Vui lòng xoá token phía client."}
