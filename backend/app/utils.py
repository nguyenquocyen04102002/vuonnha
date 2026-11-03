import re
import unicodedata


def slugify(text: str) -> str:
    """Chuyển chuỗi tiếng Việt có dấu thành slug không dấu, dùng cho URL.
    Ví dụ: 'Xoài cát Hòa Lộc' -> 'xoai-cat-hoa-loc'
    """
    text = text.replace("Đ", "D").replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9\s-]", "", ascii_text)
    ascii_text = re.sub(r"[\s-]+", "-", ascii_text).strip("-")
    return ascii_text
