import { useState } from "react";

/**
 * Component sao đánh giá dùng chung.
 * - Chế độ hiển thị (mặc định): readOnly=true, chỉ để xem.
 * - Chế độ chấm điểm: readOnly=false, truyền onChange để nhận số sao người dùng chọn.
 */
export default function StarRating({ value = 0, onChange, readOnly = true, size = 18 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= display ? "filled" : ""}`}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
