import json
import logging
from datetime import datetime, timezone
from pathlib import Path

from app.services.email_service import (
    EmailDeliveryError,
    is_smtp_configured,
    send_launch_notify_confirmation,
)
from app.services.newsletter_service import EMAIL_RE

logger = logging.getLogger(__name__)

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "launch_notify_subscribers.json"


class LaunchNotifyService:
    def __init__(self) -> None:
        self._entries: list[dict[str, str]] = []
        self._load()

    def _load(self) -> None:
        if not DATA_FILE.exists():
            return
        try:
            raw = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                self._entries = [item for item in raw if isinstance(item, dict)]
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Could not load launch notify subscribers: %s", exc)

    def _save(self) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        DATA_FILE.write_text(
            json.dumps(self._entries, indent=2),
            encoding="utf-8",
        )

    @staticmethod
    def normalize_email(raw: str) -> str | None:
        email = raw.strip().lower()
        if not EMAIL_RE.match(email):
            return None
        return email

    def register(self, raw_email: str, category_slug: str, category_name: str) -> tuple[str, str, bool]:
        email = self.normalize_email(raw_email)
        if not email:
            raise ValueError("Enter a valid email address")

        slug = category_slug.strip().lower()
        name = category_name.strip()
        if not slug or not name:
            raise ValueError("Invalid product category")

        key = (email, slug)
        already = any(
            e.get("email") == email and e.get("category_slug") == slug for e in self._entries
        )
        if not already:
            self._entries.append(
                {
                    "email": email,
                    "category_slug": slug,
                    "category_name": name,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
            )
            self._save()
            logger.info("Launch notify: %s for %s (new=True)", email, slug)
        else:
            logger.info("Launch notify: %s for %s (new=False)", email, slug)

        return email, name, already

    def send_confirmation(self, raw_email: str, category_name: str) -> tuple[bool, str]:
        email = self.normalize_email(raw_email)
        if not email:
            raise ValueError("Enter a valid email address")

        name = category_name.strip()
        if not name:
            raise ValueError("Invalid product category")

        if not is_smtp_configured():
            logger.warning("SMTP not configured — no confirmation email for %s", email)
            return False, "SMTP not configured in backend/.env"

        try:
            send_launch_notify_confirmation(email, name)
            return True, "Confirmation email sent"
        except EmailDeliveryError as exc:
            logger.warning("Confirmation email failed for %s: %s", email, exc)
            return False, str(exc)


_launch_notify_service: LaunchNotifyService | None = None


def get_launch_notify_service() -> LaunchNotifyService:
    global _launch_notify_service
    if _launch_notify_service is None:
        _launch_notify_service = LaunchNotifyService()
    return _launch_notify_service
