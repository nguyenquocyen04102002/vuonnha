# 🍃 Vườn Nhà — Website bán trái cây trực tuyến

Dự án full-stack thương mại điện tử bán trái cây, xây dựng với **React (Vite)**, **FastAPI (Python)**,
**PostgreSQL** và **Docker Compose**. Bao gồm đầy đủ luồng mua hàng cho khách (xem sản phẩm, giỏ hàng,
đặt hàng/thanh toán, đăng ký/đăng nhập) và một dashboard quản trị (CRUD sản phẩm & danh mục, duyệt đơn
hàng, xem đơn đã thanh toán, quản lý người dùng).

---

## Mục lục

1. [Tính năng](#1-tính-năng)
2. [Kiến trúc & công nghệ](#2-kiến-trúc--công-nghệ)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Chạy dự án bằng Docker (khuyến nghị)](#4-chạy-dự-án-bằng-docker-khuyến-nghị)
5. [Chạy thủ công không dùng Docker](#5-chạy-thủ-công-không-dùng-docker)
6. [Tài khoản mặc định](#6-tài-khoản-mặc-định)
7. [Danh sách API](#7-danh-sách-api)
8. [Mô hình dữ liệu (Database Schema)](#8-mô-hình-dữ-liệu-database-schema)
9. [Biến môi trường](#9-biến-môi-trường)
10. [Các quyết định kỹ thuật & lưu ý quan trọng](#10-các-quyết-định-kỹ-thuật--lưu-ý-quan-trọng)
11. [Xử lý sự cố thường gặp](#11-xử-lý-sự-cố-thường-gặp)
12. [Hướng phát triển tiếp theo](#12-hướng-phát-triển-tiếp-theo)

---

## 1. Tính năng

### Dành cho khách hàng
- Trang chủ hiển thị 10 sản phẩm mới nhất; trang **"Tất cả sản phẩm"** (`/products`) riêng biệt để xem toàn bộ, có tìm kiếm, lọc theo danh mục và **phân trang**
- Xem chi tiết sản phẩm (mô tả, giá, tồn kho)
- Thêm / cập nhật số lượng / xoá sản phẩm trong giỏ hàng (giỏ hàng lưu theo phiên `session_id`,
  hoạt động được cả khi chưa đăng nhập)
- Đăng ký tài khoản, đăng nhập, đăng xuất (xác thực bằng JWT)
- Đặt hàng / thanh toán (yêu cầu đăng nhập) — trừ tồn kho tự động, sinh mã đơn hàng riêng
- Xem lại lịch sử đơn hàng của chính mình; **bấm vào từng đơn để xem chi tiết đầy đủ** (thông tin
  giao hàng, phương thức thanh toán, ghi chú) và trạng thái xử lý
- **Tài khoản của tôi**: xem/sửa họ tên, số điện thoại, địa chỉ; đổi mật khẩu (yêu cầu xác minh mật khẩu hiện tại)
- **Đánh giá sản phẩm**: chấm sao (1-5) kèm bình luận cho bất kỳ sản phẩm nào (yêu cầu đăng nhập),
  xem điểm trung bình và toàn bộ đánh giá của người khác, sửa/xoá đánh giá của chính mình

### Dành cho quản trị viên (Dashboard `/admin`)
- **Sản phẩm**: thêm / sửa / xoá, bật-tắt trạng thái đang bán, tìm kiếm, **upload ảnh trực tiếp từ máy** (không cần dán URL)
- **Danh mục**: thêm / sửa / xoá danh mục sản phẩm
- **Đơn hàng**: xem toàn bộ đơn hàng, lọc theo trạng thái, **duyệt đơn** (chuyển trạng thái:
  `Chờ xác nhận → Đã xác nhận → Đã thanh toán → Đang giao hàng → Hoàn tất`, hoặc huỷ đơn)
- **Đơn hàng đã thanh toán**: danh sách riêng các đơn ở trạng thái đã thanh toán / hoàn tất
- **Người dùng**: xem danh sách toàn bộ người dùng đã đăng ký; **phân quyền** khách hàng ↔ quản trị viên
  (chỉ tài khoản admin gốc - mặc định `admin@vuonnha.com` - mới có quyền này)
- **Đánh giá sản phẩm**: xem toàn bộ đánh giá của mọi sản phẩm, xoá đánh giá không phù hợp
- **Tổng quan**: số liệu thống kê nhanh (doanh thu, số đơn, số sản phẩm, số khách hàng...)

---

## 2. Kiến trúc & công nghệ

| Thành phần   | Công nghệ |
|--------------|-----------|
| Frontend     | React 18, Vite, React Router, Axios |
| Backend      | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Xác thực     | JWT (python-jose) + hash mật khẩu bcrypt (passlib) |
| Database     | PostgreSQL 16 |
| Migration    | Alembic |
| Hạ tầng      | Docker + Docker Compose |
| Quản trị DB  | pgAdmin 4 (tự động cấu hình sẵn kết nối) |

```
┌──────────────┐      REST/JSON       ┌──────────────┐        SQL        ┌──────────────┐
│   Frontend   │ ───────────────────▶ │   Backend    │ ─────────────────▶ │  PostgreSQL  │
│ React + Vite │ ◀─────────────────── │   FastAPI    │ ◀───────────────── │              │
│ :5173        │                      │   :8000      │                    │   :5432      │
└──────────────┘                      └──────────────┘                    └──────────────┘
                                                                                    ▲
                                                                                    │
                                                                            ┌──────────────┐
                                                                            │   pgAdmin    │
                                                                            │   :5050      │
                                                                            └──────────────┘
```

Toàn bộ API của dự án được viết bằng **Python (FastAPI)** — không dùng ngôn ngữ backend nào khác.
Frontend giao tiếp với backend hoàn toàn qua REST API (JSON), không truy cập database trực tiếp.

---

## 3. Cấu trúc thư mục

```
vuon-nha/
├── docker-compose.yml          # Điều phối toàn bộ services
├── .env.example                # Mẫu biến môi trường (copy thành .env)
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh            # migrate DB -> seed dữ liệu -> chạy server
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py               # Cấu hình migration (đọc DATABASE_URL an toàn)
│   │   └── versions/            # Các file migration
│   ├── app/
│   │   ├── main.py              # Khởi tạo FastAPI app, CORS, mount /uploads, include routers
│   │   ├── config.py            # Đọc biến môi trường, build DATABASE_URL
│   │   ├── database.py          # Kết nối SQLAlchemy + PostgreSQL (file riêng)
│   │   ├── models.py            # SQLAlchemy models (User, Category, Product...)
│   │   ├── schemas.py           # Pydantic schemas (request/response)
│   │   ├── crud.py              # Hàm thao tác database
│   │   ├── auth.py              # JWT, hash mật khẩu, phân quyền
│   │   ├── utils.py             # Slugify tiếng Việt...
│   │   ├── seed.py              # Nạp dữ liệu mẫu
│   │   └── routers/
│   │       ├── auth.py          # /api/auth/*
│   │       ├── categories.py    # /api/categories/*
│   │       ├── products.py      # /api/products/*
│   │       ├── cart.py          # /api/cart/*
│   │       ├── orders.py        # /api/orders/*
│   │       ├── admin.py         # /api/admin/*
│   │       ├── upload.py        # /api/upload - admin upload ảnh sản phẩm
│   │       └── reviews.py       # /api/products/{id}/reviews - đánh giá sản phẩm
│   └── uploads/                 # Ảnh sản phẩm đã upload (tự tạo, phục vụ tại /uploads/...)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Định tuyến toàn bộ ứng dụng
│       ├── api/                 # Các module gọi API (axios)
│       ├── context/             # AuthContext, CartContext (state toàn cục)
│       ├── components/          # Header, ProductCard, CategoryFilter, Modal...
│       ├── pages/                # Home, ProductDetail, CartPage, Checkout...
│       │   └── admin/            # Dashboard, ProductsAdmin, OrdersAdmin...
│       └── styles/global.css
└── pgadmin/
    ├── servers.json              # Tự động khai báo kết nối DB trong pgAdmin
    └── pgpass                    # Mật khẩu để pgAdmin tự đăng nhập
```

---

## 4. Chạy dự án bằng Docker (khuyến nghị)

### Yêu cầu
- Docker và Docker Compose đã được cài đặt

### Các bước

```bash
# 1. Vào thư mục dự án
cd vuon-nha

# 2. Tạo file .env từ mẫu (có thể chỉnh sửa nếu muốn)
cp .env.example .env

# 3. Khởi động toàn bộ hệ thống
docker compose up --build
```

Sau khi các container khởi động xong (backend sẽ tự động chạy migration + nạp dữ liệu mẫu):

| Dịch vụ | Địa chỉ |
|---|---|
| **Frontend** (website) | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **pgAdmin** | http://localhost:5050 |

Dừng hệ thống: `docker compose down` (thêm `-v` nếu muốn xoá luôn dữ liệu database).

### Điều gì diễn ra khi container backend khởi động?

`entrypoint.sh` sẽ tự động, theo thứ tự:
1. Chờ PostgreSQL sẵn sàng nhận kết nối
2. Chạy `alembic upgrade head` để tạo toàn bộ bảng
3. Chạy `python -m app.seed` để nạp danh mục, sản phẩm mẫu và tài khoản admin (chỉ nạp nếu bảng
   đang trống, nên chạy lại nhiều lần vẫn an toàn)
4. Khởi động server `uvicorn` ở chế độ `--reload`

---

## 5. Chạy thủ công không dùng Docker

Dành cho khi bạn muốn phát triển/debug trực tiếp trên máy.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Sửa POSTGRES_HOST=localhost và các thông tin kết nối PostgreSQL đã cài sẵn trên máy bạn

alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định gọi API tại `http://localhost:8000/api` (cấu hình qua biến `VITE_API_URL`
trong file `.env` ở thư mục `frontend/`, tạo file `.env` với nội dung
`VITE_API_URL=http://localhost:8000/api` nếu backend chạy ở địa chỉ khác).

---

## 6. Tài khoản mặc định

Tài khoản quản trị viên được tạo tự động khi seed dữ liệu (đăng nhập tại `/login`, sau đó vào `/admin`):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên (admin gốc) | `admin@vuonnha.com` | `Admin@123` |

> Có thể đổi qua biến môi trường `ADMIN_EMAIL` / `ADMIN_PASSWORD` trước lần chạy đầu tiên.
> Tài khoản này là **admin gốc duy nhất** có quyền phân quyền (thăng/hạ) các tài khoản khác
> tại trang `/admin/users` — xem mục 10.9.

pgAdmin (xem trực tiếp dữ liệu PostgreSQL):

| Trường | Giá trị |
|---|---|
| URL | http://localhost:5050 |
| Email đăng nhập pgAdmin | `admin@vuonnha.com` |
| Mật khẩu đăng nhập pgAdmin | `Admin@123` |
| Server "Vườn Nhà - PostgreSQL" | Đã được cấu hình sẵn, tự kết nối |

---

## 7. Danh sách API

Toàn bộ API đều nằm dưới tiền tố `/api`. Xem chi tiết đầy đủ (request/response, thử trực tiếp)
tại Swagger UI: **http://localhost:8000/docs**

### Xác thực — `/api/auth`
| Method | Endpoint | Mô tả | Cần đăng nhập |
|---|---|---|---|
| POST | `/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/auth/login` | Đăng nhập, trả về JWT | ❌ |
| GET | `/auth/me` | Xem thông tin cá nhân | ✅ |
| PUT | `/auth/me` | Cập nhật thông tin cá nhân | ✅ |
| PUT | `/auth/me/password` | Đổi mật khẩu (yêu cầu đúng mật khẩu hiện tại) | ✅ |
| POST | `/auth/logout` | Đăng xuất (xoá token phía client) | ✅ |

### Danh mục — `/api/categories`
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/categories` | Danh sách danh mục | Công khai |
| GET | `/categories/{id}` | Chi tiết 1 danh mục | Công khai |
| POST | `/categories` | Thêm danh mục | Admin |
| PUT | `/categories/{id}` | Sửa danh mục | Admin |
| DELETE | `/categories/{id}` | Xoá danh mục | Admin |

### Sản phẩm — `/api/products`
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/products?category_id=&search=&skip=&limit=` | Danh sách sản phẩm đang bán, trả về `{items: [...], total: N}` (dùng `skip`/`limit` để phân trang) | Công khai |
| GET | `/products/{id}` | Chi tiết sản phẩm | Công khai |
| GET | `/products/admin/all` | Toàn bộ sản phẩm (kể cả ngừng bán) | Admin |
| POST | `/products` | Thêm sản phẩm | Admin |
| PUT | `/products/{id}` | Sửa sản phẩm | Admin |
| DELETE | `/products/{id}` | Xoá sản phẩm | Admin |

### Giỏ hàng — `/api/cart`
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/cart/{session_id}` | Xem giỏ hàng theo phiên |
| POST | `/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/cart/items/{item_id}?session_id=` | Cập nhật số lượng |
| DELETE | `/cart/items/{item_id}?session_id=` | Xoá 1 sản phẩm khỏi giỏ |
| DELETE | `/cart/{session_id}` | Xoá toàn bộ giỏ hàng |

### Đơn hàng — `/api/orders`
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/orders` | Đặt hàng / thanh toán từ giỏ hàng | Đăng nhập |
| GET | `/orders/my` | Đơn hàng của tôi | Đăng nhập |
| GET | `/orders/{id}` | Chi tiết 1 đơn hàng | Chủ đơn hoặc Admin |

### Quản trị — `/api/admin` (yêu cầu quyền Admin)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/stats` | Số liệu tổng quan dashboard |
| GET | `/admin/orders?status=` | Danh sách đơn hàng (lọc theo trạng thái) |
| GET | `/admin/orders/paid` | Danh sách đơn hàng **đã thanh toán** |
| PUT | `/admin/orders/{id}/status` | Duyệt / cập nhật trạng thái đơn hàng |
| GET | `/admin/users` | Danh sách người dùng |
| PUT | `/admin/users/{id}/role` | Phân quyền customer ↔ admin — **chỉ admin gốc** (`email == ADMIN_EMAIL`) mới gọi được, kể cả admin thường cũng bị chặn 403 |
| GET | `/admin/reviews` | Toàn bộ đánh giá của mọi sản phẩm (kiểm duyệt) |
| DELETE | `/admin/reviews/{id}` | Xoá 1 đánh giá không phù hợp |

### Đánh giá sản phẩm — `/api/products/{id}/reviews`
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/products/{id}/reviews` | Danh sách đánh giá của 1 sản phẩm | Công khai |
| GET | `/products/{id}/reviews/summary` | Điểm trung bình + tổng số đánh giá | Công khai |
| GET | `/products/{id}/reviews/me` | Đánh giá của chính người dùng hiện tại (nếu có) | Đăng nhập |
| POST | `/products/{id}/reviews` | Gửi đánh giá mới; gửi lại sẽ **cập nhật** đánh giá cũ (mỗi người 1 đánh giá / sản phẩm) | Đăng nhập |
| DELETE | `/products/{id}/reviews/me` | Xoá đánh giá của chính mình | Đăng nhập |

### Tải ảnh lên — `/api/upload`
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/upload` | Upload 1 ảnh (jpg/png/webp/gif, tối đa 5MB), trả về `{"url": "/uploads/xxxx.jpg"}` để lưu vào `image_url` của sản phẩm | Admin |

Ảnh sau khi upload được phục vụ tĩnh tại `http://localhost:8000/uploads/<tên file>`.

---

## 8. Mô hình dữ liệu (Database Schema)

```
users                  categories              products
├─ id (PK)             ├─ id (PK)              ├─ id (PK)
├─ name                ├─ name                 ├─ name / slug
├─ email (unique)       ├─ slug (unique)        ├─ description
├─ hashed_password     └─ description          ├─ price / unit
├─ phone / address                              ├─ stock
├─ role (customer/admin)                        ├─ image_url / is_active
└─ is_active                                    └─ category_id (FK → categories)

cart_items                          orders                       order_items
├─ id (PK)                          ├─ id (PK)                   ├─ id (PK)
├─ session_id (UUID phía FE)        ├─ order_code (unique)       ├─ order_id (FK → orders)
├─ user_id (FK, có thể null)         ├─ user_id (FK → users)      ├─ product_id (FK, snapshot)
├─ product_id (FK → products)       ├─ status (enum)             ├─ product_name (snapshot)
└─ quantity                         ├─ total_amount               ├─ price (snapshot)
                                     ├─ shipping_name/phone/address└─ quantity
                                     ├─ payment_method
                                     └─ note

reviews
├─ id (PK)
├─ product_id (FK → products, ON DELETE CASCADE)
├─ user_id (FK → users, ON DELETE CASCADE)
├─ rating (1-5, ràng buộc CHECK ở DB)
├─ comment (tuỳ chọn)
└─ created_at / updated_at
```

**Ràng buộc riêng của `reviews`:** `UNIQUE(product_id, user_id)` - mỗi người dùng chỉ có đúng 1
đánh giá cho 1 sản phẩm; gửi đánh giá lần nữa sẽ **cập nhật** bản ghi cũ (upsert) thay vì tạo trùng.

**Quan hệ chính:** 1 danh mục → nhiều sản phẩm · 1 user → nhiều đơn hàng · 1 đơn hàng → nhiều
order_items (mỗi order_item lưu lại "ảnh chụp" tên & giá sản phẩm tại thời điểm mua, để không bị
ảnh hưởng nếu sau này sản phẩm gốc bị đổi giá hoặc xoá).

Trạng thái đơn hàng (`OrderStatus`): `pending` → `confirmed` → `paid` → `shipping` → `completed`,
hoặc `cancelled` ở bất kỳ bước nào.

---

## 9. Biến môi trường

Xem đầy đủ trong `.env.example`. Các biến quan trọng nhất:

| Biến | Mô tả | Mặc định |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Thông tin kết nối PostgreSQL | `vuonnha` / `vuonnha_password` / `vuonnha_db` |
| `SECRET_KEY` | Khoá bí mật ký JWT — **bắt buộc đổi khi deploy thật** | — |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Tài khoản admin được tạo tự động lúc seed | `admin@vuonnha.com` / `Admin@123` |
| `VITE_API_URL` | Địa chỉ backend mà frontend gọi tới | `http://localhost:8000/api` |
| `FRONTEND_ORIGIN` | Origin frontend, dùng cấu hình CORS ở backend | `http://localhost:5173` |

---

## 10. Các quyết định kỹ thuật & lưu ý quan trọng

Một số vấn đề thực tế đã được xử lý sẵn trong mã nguồn, đáng lưu ý nếu bạn tuỳ biến dự án:

1. **Mật khẩu PostgreSQL chứa ký tự đặc biệt (`@`, `#`...)**: Backend không tự nối chuỗi
   `postgresql://user:pass@host/db` bằng f-string (vì `@` trong mật khẩu sẽ bị hiểu nhầm là dấu
   phân tách host). Thay vào đó, `app/config.py` dùng `sqlalchemy.engine.URL.create()` để tự
   động percent-encode an toàn. Đã kiểm thử với mật khẩu `Yen@04102002` thành công.

2. **Alembic + mật khẩu đã percent-encode**: Nếu percent-encode `@` → `%40` rồi truyền qua
   `config.set_main_option()`, `configparser` bên trong Alembic sẽ hiểu nhầm `%` là cú pháp
   interpolation và báo lỗi. Giải pháp trong `alembic/env.py`: bỏ qua `config.set_main_option()`
   hoàn toàn, truyền thẳng biến Python `DATABASE_URL` vào `create_engine()`.

3. **Enum PostgreSQL trong migration**: Không tự tạo `CREATE TYPE` thủ công rồi dùng lại chính
   enum đó làm kiểu cột trong `create_table` — sẽ bị lỗi "type already exists" vì SQLAlchemy tạo
   type đó thêm 1 lần nữa. Cách đúng: để `create_table` tự quản lý việc tạo enum type.

4. **pgAdmin từ chối email `.local`**: Dùng `PGADMIN_CONFIG_CHECK_EMAIL_DELIVERABILITY: "False"`
   và email có TLD hợp lệ (`admin@vuonnha.com`) để tránh bị pgAdmin coi là email không hợp lệ.

5. **Vai trò của từng thành phần**: `db` (container Postgres) chỉ tạo **database rỗng**; Alembic
   tạo **bảng** bên trong database đó; pgAdmin chỉ dùng để **xem/thao tác** dữ liệu, không tự
   tạo schema.

6. **Snapshot dữ liệu đơn hàng**: Bảng `order_items` lưu lại tên và giá sản phẩm tại thời điểm đặt
   hàng (không tham chiếu trực tiếp giá hiện tại của sản phẩm), để lịch sử đơn hàng không bị thay
   đổi khi admin sửa giá/xoá sản phẩm sau này.

7. **Giỏ hàng theo phiên (`session_id`)**: Cho phép khách chưa đăng nhập vẫn thêm được sản phẩm
   vào giỏ (lưu UUID trong `localStorage`). Khi đặt hàng (`POST /api/orders`) mới bắt buộc đăng
   nhập, để đơn hàng luôn gắn với 1 tài khoản người dùng cụ thể.

8. **Upload ảnh sản phẩm**: Ảnh được lưu trực tiếp trên đĩa tại `backend/uploads/` (không cần
   dịch vụ lưu trữ ngoài) và phục vụ qua `StaticFiles` của FastAPI tại đường dẫn `/uploads/...`.
   Vì service `backend` trong `docker-compose.yml` đã bind-mount toàn bộ `./backend:/app`, thư
   mục `uploads/` bên trong container trùng với `backend/uploads/` trên máy host — ảnh **không bị
   mất khi container restart**, không cần khai báo volume riêng. Tên file được sinh ngẫu nhiên
   bằng UUID (không dùng tên file gốc do người dùng đặt) để tránh trùng lặp và tránh path
   traversal. Vì ảnh nằm ở origin của **backend** (`:8000`) còn frontend chạy ở origin khác
   (`:5173`), frontend dùng hàm `resolveImageUrl()` (`frontend/src/utils.js`) để tự ghép domain
   backend vào trước đường dẫn tương đối `/uploads/...` khi hiển thị `<img>`.

9. **Phân quyền admin gốc ("super admin")**: Chỉ tài khoản có email khớp `ADMIN_EMAIL` (biến môi
   trường, mặc định `admin@vuonnha.com`) mới được gọi `PUT /admin/users/{id}/role` để thăng/hạ
   quyền người khác. Dùng biến môi trường thay vì viết cứng chuỗi email, để nếu đổi `ADMIN_EMAIL`
   trong `.env` thì quyền "gốc" tự động theo email mới. Admin gốc cũng không thể tự đổi quyền
   chính mình (tránh tự khoá quyền truy cập), và admin thường (dù được thăng cấp) **không** thể
   phân quyền tiếp cho ai khác — chặn triệt để việc leo thang đặc quyền giữa các tài khoản admin.
   Việc ẩn nút phân quyền ở frontend (`UsersAdmin.jsx`) chỉ nhằm mục đích giao diện gọn gàng; kiểm
   tra quyền thật sự luôn nằm ở backend.

---

## 11. Xử lý sự cố thường gặp

| Hiện tượng | Nguyên nhân / cách xử lý |
|---|---|
| Backend báo lỗi kết nối DB liên tục lúc khởi động | Bình thường trong vài giây đầu — `entrypoint.sh` tự chờ và thử lại tối đa 30 lần (~60s) trước khi báo lỗi thật |
| Frontend gọi API bị lỗi CORS | Kiểm tra biến `FRONTEND_ORIGIN` ở backend có khớp với địa chỉ frontend đang chạy không |
| `docker compose up` báo cổng đã được sử dụng | Đổi cổng ánh xạ bên trái trong `docker-compose.yml`, ví dụ `"5433:5432"` |
| Muốn xoá sạch dữ liệu và làm lại từ đầu | `docker compose down -v` (xoá luôn volume database) rồi `docker compose up --build` |
| Muốn xem dữ liệu trực tiếp trong DB | Mở pgAdmin tại http://localhost:5050, server đã tự kết nối sẵn |

---

## 12. Hướng phát triển tiếp theo

Đây là phiên bản đầy đủ chức năng cơ bản. Một số hướng mở rộng gợi ý:

- Thanh toán online thật (VNPay/Momo) thay vì chỉ COD/chuyển khoản thủ công

- Upload ảnh sản phẩm thay vì nhập URL

- Đánh giá / bình luận sản phẩm

- Email xác nhận đơn hàng

- Phân trang cho danh sách sản phẩm / đơn hàng khi dữ liệu lớn

- Refresh token cho JWT (hiện tại dùng access token sống 24h)

- Cho phép khách hàng xem thông tin tài khoản của khách hàng

- Cho phép khách hàng sửa thông tin tài khoảng khách hàng - sdt - địa chỉ

- Phân quyền tài khoản trong dashboard của admin

- Quản trị viên có thể phân quyền cho tài khoản khách hàng -> quản trị viên

- Khách hàng quên mật khẩu sẽ nhập sdt nếu đúng thì sẽ cho nhập lại mật khẩu mới

- Ngày 20/7 khởi tạo dự án với trang home và hiển thị sản phẩm tại trang chủ

- ngày 21/07 quản lý tài khoản người dùng degins dự án theo trang web taynguyenfoodvn.com

- Tại trang admin tạo các dashboard tương ứng để hiển thị cho data analys các biểu đồ báo cáo 






- ngày 22/07 trang quản trị để quán lý thông tin dữ liệu dự án pgadmin kiểm tra kết nối database postgre dự án sửa cách nhập hình ảnh product từ URL chuyển sang choose hình ảnh trên máy để lưu vào folder uploads

- Ngày 23/07 thay đổi password của pgadmin pass từ "vuonnha_password" chuyển thành "vuonnha123" phân trang sản phẩm để hiển thị tất cả sản phẩm

- ngày 24/07 xóa dòng tìm kiếm sản phẩm trên header hiển thị thêm thông tin khách hàng tại trang dashboard admin ( dia chi )

- Ngày 25/07 thêm chức năng comment và đánh giá các sản phẩm đã được bán - comment to products

- ngày 26/07 off không tranner sản phẩm

-  Ngày 27/07 Chức năng xem thông tin khách hàng, sửa thông tin khách hàng Phân quyền từ siêu admin admin@vuonnha.com phân quyền cho các user khác
hiển thị chi tiết đơn hàng cho các đơn hành đã được đặt
Task in to to day : Sửa fontend đơn hàng và chi tiết đơn hàng để đẹp hơn và hiển thị hình ảnh trái cây trong đơn hàng 

NOTE CẦN LƯU Ý KHI LOAD HỆ THỐNG :

1. ADMIN : THÊM CỘT ĐỊA CHỈ VÀO DANH SÁCH NGƯỜI DÙNG
2. HEADER VÀ FLOOTER : SỬA CÁC THÔNG TIN CÁ NHÂN CỦA DỰ ÁN
3. THÊM LOGO CHO DỰ ÁN 
- THÊM FOLDER TÊN LÀ assets có chưa file logovuonnha.png
import logo from "../assets/logovuonnha.png";
- <Link to="/" className="brand">
            <img
              src={logo}
              alt="Vườn Nhà"
              style={{
                width: "200px",
                height: "65px",
                objectFit: "contain",
              }}
            />
          </Link>

---

*Dự án được xây dựng cho mục đích học tập, thực hành full-stack với React + FastAPI + PostgreSQL + Docker.*
