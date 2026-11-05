import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.config import settings
from app.database import get_db
from app.email_utils import send_reset_password_email

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


# ---------- QUÊN MẬT KHẨU (người dùng chưa đăng nhập) ----------

FORGOT_PASSWORD_MESSAGE = (
    "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi tới hộp thư của bạn."
)


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


@router.post("/forgot-password")
def forgot_password(
    payload: schemas.ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Luôn trả cùng 1 thông báo dù email có tồn tại hay không (không để lộ email nào đã đăng ký)."""
    user = crud.get_user_by_email(db, payload.email)
    if user and user.is_active:
        now = datetime.utcnow()
        # Chống spam: vừa yêu cầu trong vòng cooldown thì không tạo token/gửi mail mới
        issued_at = (
            user.reset_token_expires_at - timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
            if user.reset_token_expires_at
            else None
        )
        in_cooldown = issued_at and (now - issued_at).total_seconds() < settings.RESET_REQUEST_COOLDOWN_SECONDS
        if not in_cooldown:
            raw_token = secrets.token_urlsafe(32)
            user.reset_token_hash = _hash_token(raw_token)
            user.reset_token_expires_at = now + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
            db.commit()
            reset_link = f"{settings.FRONTEND_ORIGIN}/dat-lai-mat-khau?token={raw_token}"
            # Gửi mail ở nền: phản hồi trả về ngay, thời gian phản hồi không lộ email có tồn tại hay không
            background_tasks.add_task(send_reset_password_email, user.email, user.name, reset_link)
    return {"message": FORGOT_PASSWORD_MESSAGE}


@router.post("/reset-password")
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_reset_token_hash(db, _hash_token(payload.token))
    if (
        not user
        or not user.is_active
        or not user.reset_token_expires_at
        or user.reset_token_expires_at < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=400,
            detail="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.",
        )
    user.hashed_password = hash_password(payload.new_password)
    user.reset_token_hash = None  # dùng 1 lần
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."}


# Lưu ý: JWT là stateless, nên "đăng xuất" thực chất được xử lý ở phía frontend
# bằng cách xoá access token khỏi localStorage. Endpoint này chỉ để tường minh hoá API
# và có thể mở rộng thành cơ chế token-blacklist sau này nếu cần.
@router.post("/logout")
def logout():
    return {"message": "Đăng xuất thành công. Vui lòng xoá token phía client."}
