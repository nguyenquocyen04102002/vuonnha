"""
Script nạp dữ liệu mẫu. Được entrypoint.sh gọi mỗi lần container backend khởi động,
nhưng chỉ thực sự chèn dữ liệu nếu bảng tương ứng còn trống (an toàn khi chạy lại nhiều lần).
Chạy thủ công: python -m app.seed
"""
from app.auth import hash_password
from app.config import settings
from app.database import SessionLocal
from app.utils import slugify
from app import models

CATEGORIES = [
    {"name": "Trái cây nhiệt đới", "description": "Các loại trái cây đặc trưng vùng nhiệt đới Việt Nam."},
    {"name": "Trái cây có múi", "description": "Cam, quýt, bưởi và các loại trái cây họ cam quýt."},
    {"name": "Trái cây theo mùa", "description": "Trái cây theo mùa vụ, tươi ngon đúng thời điểm."},
    {"name": "Trái cây nhập khẩu", "description": "Trái cây cao cấp được nhập khẩu."},
]

PRODUCTS = [
    # (tên, danh mục, giá, đơn vị, tồn kho, ảnh, mô tả)
    ("Xoài cát Hòa Lộc", 0, 85000, "kg", 50, "Xoài cát Hòa Lộc chín vàng, ngọt thơm đặc trưng miền Tây."),
    ("Chuối già Nam Mỹ", 0, 25000, "nải", 80, "Chuối già chín tự nhiên, ngọt dịu, giàu kali."),
    ("Dứa (thơm) Tiền Giang", 0, 20000, "trái", 60, "Dứa chín mọng nước, vị chua ngọt hài hòa."),
    ("Thanh long ruột đỏ", 0, 45000, "kg", 70, "Thanh long ruột đỏ Bình Thuận, giòn ngọt, giàu vitamin C."),
    ("Sầu riêng Ri6", 0, 180000, "kg", 30, "Sầu riêng Ri6 cơm vàng hạt lép, béo ngậy thơm nức."),
    ("Chôm chôm Java", 0, 35000, "kg", 45, "Chôm chôm vỏ đỏ tươi, thịt giòn ngọt tách hạt dễ dàng."),
    ("Cam sành Vĩnh Long", 1, 40000, "kg", 90, "Cam sành mọng nước, vị ngọt thanh hơi chua nhẹ."),
    ("Quýt đường Lai Vung", 1, 55000, "kg", 65, "Quýt đường vỏ mỏng, múi ngọt lịm không hạt."),
    ("Bưởi da xanh", 1, 60000, "kg", 55, "Bưởi da xanh ruột hồng, múi ráo, vị ngọt thanh mát."),
    ("Chanh không hạt", 1, 30000, "kg", 100, "Chanh không hạt mọng nước, thơm the, tiện lợi khi vắt."),
    ("Vải thiều Lục Ngạn", 2, 70000, "kg", 40, "Vải thiều mùa hè, cùi dày hạt nhỏ, ngọt sắc."),
    ("Nhãn lồng Hưng Yên", 2, 65000, "kg", 50, "Nhãn lồng cùi dày giòn, hương thơm đặc trưng."),
    ("Mận hậu Sơn La", 2, 50000, "kg", 35, "Mận hậu giòn ngọt, chua nhẹ, thu hoạch theo mùa."),
    ("Nho mẫu đơn Nhật Bản", 3, 320000, "kg", 20, "Nho mẫu đơn nhập khẩu, quả to giòn ngọt, không hạt."),
]


def run():
    db = SessionLocal()
    try:
        # ---- Danh mục ----
        if db.query(models.Category).count() == 0:
            print(">> Đang tạo danh mục mẫu...")
            for c in CATEGORIES:
                db.add(models.Category(name=c["name"], slug=slugify(c["name"]), description=c["description"]))
            db.commit()

        categories = db.query(models.Category).order_by(models.Category.id).all()

        # ---- Sản phẩm ----
        if db.query(models.Product).count() == 0 and categories:
            print(">> Đang tạo sản phẩm mẫu...")
            for name, cat_idx, price, unit, stock, desc in PRODUCTS:
                category = categories[cat_idx] if cat_idx < len(categories) else None
                db.add(models.Product(
                    name=name,
                    slug=slugify(name),
                    description=desc,
                    price=price,
                    unit=unit,
                    stock=stock,
                    is_active=True,
                    category_id=category.id if category else None,
                    image_url=f"https://placehold.co/600x400/2F6B3C/FBF8F1?text={name.replace(' ', '+')}",
                ))
            db.commit()

        # ---- Tài khoản admin ----
        if not db.query(models.User).filter(models.User.email == settings.ADMIN_EMAIL).first():
            print(">> Đang tạo tài khoản quản trị viên mặc định...")
            db.add(models.User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role=models.UserRole.admin,
            ))
            db.commit()

        print(">> Nạp dữ liệu mẫu hoàn tất.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
