from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    auth_secret: str = "dev-change-me-in-production"
    auth_otp_ttl_seconds: int = 300
    auth_session_ttl_seconds: int = 60 * 60 * 24 * 30
    # demo = log OTP server-side; sms = send via provider (wire later)
    auth_otp_mode: str = "demo"
    # Only when true: API may return debug_otp to the client (local testing)
    allow_debug_otp: bool = True

    # Newsletter welcome email (Gmail, Outlook, SendGrid SMTP, etc.)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_from_name: str = "Swastik Makhana"
    smtp_use_tls: bool = True

    # Optional AI chat (falls back to built-in product knowledge if unset)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
