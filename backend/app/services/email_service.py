import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmailNotConfiguredError(Exception):
    pass


class EmailDeliveryError(Exception):
    pass


def is_smtp_configured() -> bool:
    settings = get_settings()
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


def _send_email(*, to_email: str, subject: str, plain: str, html: str) -> None:
    settings = get_settings()
    if not is_smtp_configured():
        raise EmailNotConfiguredError("SMTP is not configured")

    from_addr = settings.smtp_from or settings.smtp_user
    from_name = settings.smtp_from_name or "Swastik Makhana"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_addr}>"
    msg["To"] = to_email
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(from_addr, [to_email], msg.as_string())
        logger.info("Email sent to %s — %s", to_email, subject)
    except smtplib.SMTPException as exc:
        logger.exception("SMTP failed for %s", to_email)
        raise EmailDeliveryError("Could not send email. Try again later.") from exc


def send_newsletter_welcome(to_email: str) -> None:
    plain = (
        "Namaste!\n\n"
        "Thanks for joining the Makhana Movement.\n\n"
        "You'll receive exclusive recipes, early access to new flavours, "
        "and special offers — including code SWASTIK10 for 10% off your first order.\n\n"
        "Shop now: http://localhost:3000\n\n"
        "With warmth,\n"
        "Team Swastik Makhana\n"
        "Makhana Farm, Darbhanga, Bihar 846004\n"
    )
    html = """
    <div style="font-family:Georgia,serif;max-width:520px;color:#1c1408">
      <h2 style="color:#2c4a1e">Welcome to Swastik Makhana</h2>
      <p>Thanks for joining the <strong>Makhana Movement</strong>.</p>
      <p>You'll receive exclusive recipes, early access to new flavours, and special offers.</p>
      <p style="background:#f0ead8;padding:12px 16px;border-radius:8px">
        <strong>SWASTIK10</strong> — 10% off your first order
      </p>
      <p><a href="http://localhost:3000" style="color:#2c4a1e">Shop now →</a></p>
      <p style="color:#7a6550;font-size:13px">Team Swastik Makhana · Darbhanga, Bihar</p>
    </div>
    """
    _send_email(
        to_email=to_email,
        subject="Welcome to Swastik Makhana — You're in!",
        plain=plain,
        html=html,
    )


def send_launch_notify_confirmation(to_email: str, category_name: str) -> None:
    plain = (
        f"Namaste!\n\n"
        f"You're on the list for **{category_name}**.\n\n"
        f"We'll email you as soon as this Swastik Makhana range goes live on our website.\n\n"
        f"Meanwhile, shop thin plain makhana (100g–250g): http://localhost:3000/makhana\n\n"
        f"With warmth,\n"
        f"Team Swastik Makhana\n"
    )
    html = f"""
    <div style="font-family:Georgia,serif;max-width:520px;color:#1c1408">
      <h2 style="color:#2c4a1e">You're on the launch list</h2>
      <p>We'll notify you when <strong>{category_name}</strong> goes live.</p>
      <p style="color:#7a6550;font-size:14px">
        You're registered for early access — no action needed until launch day.
      </p>
      <p><a href="http://localhost:3000/makhana" style="color:#2c4a1e">Shop plain makhana →</a></p>
      <p style="color:#7a6550;font-size:13px">Team Swastik Makhana · Darbhanga, Bihar</p>
    </div>
    """
    _send_email(
        to_email=to_email,
        subject=f"Swastik Makhana — {category_name} launch alert confirmed",
        plain=plain.replace("**", ""),
        html=html,
    )
