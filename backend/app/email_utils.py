"""Gửi email qua SMTP (Gmail). Chưa cấu hình SMTP thì in nội dung ra log để vẫn thử được luồng quên mật khẩu."""
import html
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr

from app.config import settings


def _build_reset_email(to_email: str, to_name: str, reset_link: str) -> MIMEMultipart:
    minutes = settings.RESET_TOKEN_EXPIRE_MINUTES
    safe_name = html.escape(to_name or "bạn")
    safe_link = html.escape(reset_link, quote=True)

    text = (
        f"Xin chào {to_name or 'bạn'},\n\n"
        f"Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Vườn Nhà của bạn.\n"
        f"Mở liên kết sau để đặt mật khẩu mới (hết hạn sau {minutes} phút, chỉ dùng được 1 lần):\n\n"
        f"{reset_link}\n\n"
        f"Nếu bạn không yêu cầu, hãy bỏ qua email này - mật khẩu của bạn vẫn được giữ nguyên."
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1e2a20">
      <h2 style="color:#1c5c37">Đặt lại mật khẩu Vườn Nhà</h2>
      <p>Xin chào <b>{safe_name}</b>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
         Liên kết dưới đây hết hạn sau <b>{minutes} phút</b> và chỉ dùng được 1 lần.</p>
      <p style="margin:28px 0">
        <a href="{safe_link}" style="background:#1c5c37;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="font-size:13px;color:#5c6b5f">Nếu nút không bấm được, hãy dán liên kết này vào trình duyệt:<br>{safe_link}</p>
      <p style="font-size:13px;color:#5c6b5f">Nếu bạn không yêu cầu, hãy bỏ qua email này - mật khẩu vẫn được giữ nguyên.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Đặt lại mật khẩu Vườn Nhà"
    msg["From"] = formataddr((settings.SMTP_FROM_NAME, settings.SMTP_USERNAME or "no-reply@vuonnha.local"))
    msg["To"] = to_email
    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    return msg


def send_reset_password_email(to_email: str, to_name: str, reset_link: str) -> None:
    """Không bao giờ ném lỗi ra ngoài: được gọi từ BackgroundTasks, lỗi SMTP chỉ ghi log."""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f">> [DEV - CHƯA CẤU HÌNH SMTP] Link đặt lại mật khẩu cho {to_email}:\n>> {reset_link}\n", flush=True)
        return
    try:
        msg = _build_reset_email(to_email, to_name, reset_link)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
        print(f">> Đã gửi email đặt lại mật khẩu tới {to_email}", flush=True)
    except Exception as e:  # noqa: BLE001
        print(f">> LỖI gửi email đặt lại mật khẩu tới {to_email}: {e}", flush=True)
