import json
import logging
import re
from pathlib import Path

from app.services.email_service import (
    EmailDeliveryError,
    is_smtp_configured,
    send_newsletter_welcome,
)

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "newsletter_subscribers.json"


class NewsletterService:
    def __init__(self) -> None:
        self._subscribers: set[str] = set()
        self._load()

    def _load(self) -> None:
        if not DATA_FILE.exists():
            return
        try:
            emails = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            if isinstance(emails, list):
                self._subscribers = {e for e in emails if isinstance(e, str)}
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Could not load newsletter subscribers: %s", exc)

    def _save(self) -> None:
        DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        DATA_FILE.write_text(
            json.dumps(sorted(self._subscribers), indent=2),
            encoding="utf-8",
        )

    @staticmethod
    def normalize_email(raw: str) -> str | None:
        email = raw.strip().lower()
        if not EMAIL_RE.match(email):
            return None
        return email

    def subscribe(self, raw_email: str) -> tuple[str, bool, bool]:
        """Returns (email, already_subscribed, welcome_email_sent)."""
        email = self.normalize_email(raw_email)
        if not email:
            raise ValueError("Enter a valid email address")

        already = email in self._subscribers
        self._subscribers.add(email)
        self._save()
        logger.info("Newsletter subscribe: %s (new=%s)", email, not already)

        email_sent = False
        if not already:
            if is_smtp_configured():
                try:
                    send_newsletter_welcome(email)
                    email_sent = True
                except EmailDeliveryError:
                    raise
            else:
                logger.warning(
                    "SMTP not configured — subscribed %s but no welcome email sent",
                    email,
                )

        return email, already, email_sent


_newsletter_service: NewsletterService | None = None


def get_newsletter_service() -> NewsletterService:
    global _newsletter_service
    if _newsletter_service is None:
        _newsletter_service = NewsletterService()
    return _newsletter_service
