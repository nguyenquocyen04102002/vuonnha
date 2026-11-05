"""Xuất đơn hàng ra file Excel (.xlsx) cho trang quản trị.

File gồm 3 sheet:
  1. "Đơn hàng"            - mỗi đơn 1 dòng
  2. "Chi tiết sản phẩm"   - mỗi sản phẩm trong đơn 1 dòng
  3. "Doanh thu theo ngày" - chỉ tính đơn Đã thanh toán + Hoàn tất (giống Dashboard)
"""
from datetime import datetime, timedelta
from io import BytesIO
from typing import Optional

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from sqlalchemy.orm import Session, joinedload

from app import models
from app.crud import PAID_STATUSES, VN_TZ, _vn_day_start_utc

STATUS_LABELS = {
    "pending": "Chờ xác nhận",
    "confirmed": "Đã xác nhận",
    "paid": "Đã thanh toán",
    "shipping": "Đang giao hàng",
    "completed": "Hoàn tất",
    "cancelled": "Đã huỷ",
}
PAYMENT_LABELS = {"cod": "COD", "bank_transfer": "Chuyển khoản"}

MONEY_FMT = "#,##0"
DATE_FMT = "dd/mm/yyyy hh:mm"

HEADER_FILL = PatternFill("solid", fgColor="1C5C37")
HEADER_FONT = Font(bold=True, color="FFFFFF")
TOTAL_FILL = PatternFill("solid", fgColor="E6F0E8")
TOTAL_FONT = Font(bold=True)
THIN = Side(style="thin", color="D9D9D9")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def _to_vn(dt: datetime) -> datetime:
    """created_at lưu UTC (naive) -> giờ Việt Nam (naive) để Excel hiển thị đúng."""
    from datetime import timezone

    return dt.replace(tzinfo=timezone.utc).astimezone(VN_TZ).replace(tzinfo=None)


def _put(ws, row: int, col: int, value, *, number_format: Optional[str] = None, align: Optional[str] = None):
    """Ghi 1 ô. Chuỗi bắt đầu bằng '=' bị ép thành TEXT để chặn Excel formula injection
    (vd: tên người nhận '=HYPERLINK(...)' sẽ KHÔNG bị Excel chạy như công thức)."""
    cell = ws.cell(row=row, column=col, value=value)
    if isinstance(value, str):
        if value[:1] in ("=", "+", "-", "@", "\t", "\r"):
            cell.value = value
            cell.data_type = "s"
        cell.alignment = Alignment(vertical="center", wrap_text=True, horizontal=align)
    else:
        cell.alignment = Alignment(vertical="center", horizontal=align or "right")
    if number_format:
        cell.number_format = number_format
    cell.border = BORDER
    return cell


def _header(ws, headers: list[str], widths: list[int]):
    for i, (h, w) in enumerate(zip(headers, widths), start=1):
        c = ws.cell(row=1, column=i, value=h)
        c.fill, c.font, c.border = HEADER_FILL, HEADER_FONT, BORDER
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 24
    ws.freeze_panes = "A2"


def _total_row(ws, row: int, values: list, money_cols: tuple = ()):
    for i, v in enumerate(values, start=1):
        c = _put(ws, row, i, v, number_format=MONEY_FMT if i in money_cols else None)
        c.fill, c.font = TOTAL_FILL, TOTAL_FONT


def build_orders_workbook(db: Session, days: int, status: Optional[models.OrderStatus] = None) -> bytes:
    O = models.Order
    today = datetime.now(VN_TZ).date()
    start_day = today - timedelta(days=days - 1)
    start = _vn_day_start_utc(start_day)
    end = _vn_day_start_utc(today + timedelta(days=1))

    q = (
        db.query(O)
        .options(joinedload(O.items), joinedload(O.user))
        .filter(O.created_at >= start, O.created_at < end)
    )
    if status is not None:
        q = q.filter(O.status == status)
    orders = q.order_by(O.created_at.desc(), O.id.desc()).all()

    wb = Workbook()

    # ---------- Sheet 1: Đơn hàng ----------
    ws1 = wb.active
    ws1.title = "Đơn hàng"
    _header(
        ws1,
        ["Mã đơn", "Ngày đặt", "Khách hàng", "Số điện thoại", "Địa chỉ giao hàng", "Thanh toán", "Trạng thái", "Tổng tiền (đ)"],
        [18, 18, 24, 15, 40, 16, 16, 16],
    )
    r = 2
    for o in orders:
        _put(ws1, r, 1, o.order_code, align="left")
        _put(ws1, r, 2, _to_vn(o.created_at), number_format=DATE_FMT, align="left")
        _put(ws1, r, 3, (o.user.name if o.user else o.shipping_name) or "", align="left")
        _put(ws1, r, 4, o.shipping_phone, align="left")
        _put(ws1, r, 5, o.shipping_address, align="left")
        _put(ws1, r, 6, PAYMENT_LABELS.get(o.payment_method, o.payment_method), align="left")
        _put(ws1, r, 7, STATUS_LABELS.get(o.status.value, o.status.value), align="left")
        _put(ws1, r, 8, int(o.total_amount), number_format=MONEY_FMT)
        r += 1
    valid = [o for o in orders if o.status != models.OrderStatus.cancelled]
    _total_row(
        ws1, r,
        ["Tổng (trừ huỷ)", "", "", "", "", "", f"{len(valid)} đơn", sum(int(o.total_amount) for o in valid)],
        money_cols=(8,),
    )
    if orders:
        ws1.auto_filter.ref = f"A1:H{r - 1}"

    # ---------- Sheet 2: Chi tiết sản phẩm ----------
    ws2 = wb.create_sheet("Chi tiết sản phẩm")
    _header(ws2, ["Mã đơn", "Sản phẩm", "Đơn giá (đ)", "Số lượng", "Thành tiền (đ)"], [20, 40, 16, 12, 18])
    r = 2
    for o in orders:
        for it in o.items:
            _put(ws2, r, 1, o.order_code, align="left")
            _put(ws2, r, 2, it.product_name, align="left")
            _put(ws2, r, 3, int(it.price), number_format=MONEY_FMT)
            _put(ws2, r, 4, int(it.quantity), number_format="0")
            _put(ws2, r, 5, int(it.price) * int(it.quantity), number_format=MONEY_FMT)
            r += 1
    v_items = [it for o in valid for it in o.items]
    _total_row(
        ws2, r,
        ["Tổng (trừ đơn huỷ)", "", "", sum(int(i.quantity) for i in v_items),
         sum(int(i.price) * int(i.quantity) for i in v_items)],
        money_cols=(5,),
    )
    if r > 2:
        ws2.auto_filter.ref = f"A1:E{r - 1}"

    # ---------- Sheet 3: Doanh thu theo ngày (không phụ thuộc bộ lọc trạng thái) ----------
    ws3 = wb.create_sheet("Doanh thu theo ngày")
    _header(ws3, ["Ngày", "Số đơn đã thanh toán / hoàn tất", "Doanh thu (đ)"], [16, 34, 20])
    paid_orders = (
        db.query(O)
        .filter(O.created_at >= start, O.created_at < end, O.status.in_(PAID_STATUSES))
        .all()
    )
    by_day: dict = {}
    for o in paid_orders:
        d = _to_vn(o.created_at).date()
        cnt, rev = by_day.get(d, (0, 0))
        by_day[d] = (cnt + 1, rev + int(o.total_amount))
    tot_cnt = tot_rev = 0
    for i in range(days):
        d = start_day + timedelta(days=i)
        cnt, rev = by_day.get(d, (0, 0))
        _put(ws3, 2 + i, 1, d.strftime("%d/%m/%Y"), align="left")
        _put(ws3, 2 + i, 2, cnt, number_format="0")
        _put(ws3, 2 + i, 3, rev, number_format=MONEY_FMT)
        tot_cnt += cnt
        tot_rev += rev
    _total_row(ws3, 2 + days, [f"Tổng {days} ngày", tot_cnt, tot_rev], money_cols=(3,))

    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()
