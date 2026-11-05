import { useEffect, useRef, useState } from "react";
import { adminApi } from "../../api/cart";
import { ORDER_STATUS_LABELS } from "../../utils";

const PERIODS = [7, 30, 90];

/** Nút "Xuất Excel" + hộp chọn khoảng thời gian / trạng thái trên trang Tổng quan. */
export default function ExportExcel({ defaultDays = 30 }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(defaultDays);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);

  // Bấm ra ngoài hoặc nhấn Esc thì đóng hộp
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleDownload() {
    setBusy(true);
    setError("");
    try {
      const res = await adminApi.exportOrders(days, status);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `don-hang_${days}-ngay_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch {
      setError("Không xuất được file. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="export-wrap" ref={wrapRef}>
      <button
        type="button"
        className="export-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span aria-hidden="true">📥</span> Xuất Excel
      </button>

      {open && (
        <div className="export-pop" role="dialog" aria-label="Xuất đơn hàng ra Excel">
          <h4>Xuất đơn hàng ra Excel</h4>

          <label htmlFor="export-days">Khoảng thời gian</label>
          <select id="export-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p} ngày gần nhất</option>
            ))}
          </select>

          <label htmlFor="export-status">Trạng thái đơn</label>
          <select id="export-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>

          <p className="export-note">
            File gồm 3 sheet: Đơn hàng, Chi tiết sản phẩm, Doanh thu theo ngày (chỉ tính đơn đã thanh toán và hoàn tất).
          </p>

          {error && <div className="export-err">{error}</div>}

          <div className="export-actions">
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)} disabled={busy}>
              Huỷ
            </button>
            <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={busy}>
              {busy ? "Đang tạo file..." : "Tải xuống"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
