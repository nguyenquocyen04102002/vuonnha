import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.auth import get_current_admin

router = APIRouter(prefix="/api/upload", tags=["Tải ảnh lên"])

# Thư mục lưu ảnh - nằm trong backend/uploads, được mount làm volume trong Docker
# nên ảnh không bị mất khi container khởi động lại.
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...)):
    """Tải 1 ảnh lên server, trả về đường dẫn tương đối để lưu vào image_url của sản phẩm."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước ảnh tối đa là 5MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File ảnh trống, vui lòng chọn ảnh khác.")

    # Sinh tên file ngẫu nhiên (UUID) - tránh trùng lặp và tránh path traversal
    # từ tên file gốc do người dùng đặt.
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    filepath.write_bytes(contents)

    return {"url": f"/uploads/{filename}"}
