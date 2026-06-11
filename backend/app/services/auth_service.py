import logging
import re
import secrets
import time
from dataclasses import dataclass

from app.config import get_settings

logger = logging.getLogger(__name__)

PHONE_RE = re.compile(r"^[6-9]\d{9}$")


@dataclass
class OtpRecord:
    otp: str
    expires_at: float


@dataclass
class SessionRecord:
    phone: str
    expires_at: float


class AuthService:
    def __init__(self) -> None:
        self._otps: dict[str, OtpRecord] = {}
        self._sessions: dict[str, SessionRecord] = {}

    @staticmethod
    def normalize_phone(raw: str) -> str:
        digits = re.sub(r"\D", "", raw)
        return digits[-10:]

    def validate_phone(self, raw: str) -> str | None:
        phone = self.normalize_phone(raw)
        if not PHONE_RE.match(phone):
            return None
        return phone

    def _purge_expired(self) -> None:
        now = time.time()
        self._otps = {k: v for k, v in self._otps.items() if v.expires_at > now}
        self._sessions = {k: v for k, v in self._sessions.items() if v.expires_at > now}

    def send_otp(self, raw_phone: str) -> tuple[str, int, str | None]:
        settings = get_settings()
        phone = self.validate_phone(raw_phone)
        if not phone:
            raise ValueError("Invalid mobile number")

        self._purge_expired()
        otp = f"{secrets.randbelow(10000):04d}"
        expires_at = time.time() + settings.auth_otp_ttl_seconds
        self._otps[phone] = OtpRecord(otp=otp, expires_at=expires_at)

        if settings.auth_otp_mode == "sms":
            # Hook SMS provider here (MSG91, Twilio, etc.)
            logger.info("SMS OTP mode enabled — integrate provider for %s", phone)
        else:
            logger.info("Demo OTP for +91%s: %s", phone, otp)

        debug_otp = otp if settings.allow_debug_otp else None
        return phone, settings.auth_otp_ttl_seconds, debug_otp

    def verify_otp(self, raw_phone: str, otp: str) -> tuple[str, str]:
        settings = get_settings()
        phone = self.validate_phone(raw_phone)
        if not phone:
            raise ValueError("Invalid mobile number")

        code = re.sub(r"\D", "", otp)
        if len(code) != 4:
            raise ValueError("Enter the 4-digit OTP")

        self._purge_expired()
        record = self._otps.get(phone)
        if not record or record.expires_at <= time.time():
            raise ValueError("OTP expired. Request a new one.")
        if record.otp != code:
            raise ValueError("Incorrect OTP")

        del self._otps[phone]
        token = secrets.token_urlsafe(32)
        self._sessions[token] = SessionRecord(
            phone=phone,
            expires_at=time.time() + settings.auth_session_ttl_seconds,
        )
        return phone, token

    def get_session(self, token: str) -> str | None:
        self._purge_expired()
        record = self._sessions.get(token)
        if not record or record.expires_at <= time.time():
            return None
        return record.phone

    def logout(self, token: str) -> None:
        self._sessions.pop(token, None)


_auth_service: AuthService | None = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
