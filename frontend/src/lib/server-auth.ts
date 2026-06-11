import "server-only";

import crypto from "crypto";

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export type OtpChannel = "email" | "phone";

export interface SessionIdentity {
  email?: string;
  phone?: string;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    console.warn("AUTH_SECRET not set — using insecure fallback. Set AUTH_SECRET on Vercel.");
  }
  return "dev-change-me-in-production";
}

function getOtpTtlSeconds(): number {
  const raw = process.env.AUTH_OTP_TTL_SECONDS;
  const n = raw ? Number.parseInt(raw, 10) : 300;
  return Number.isFinite(n) && n > 0 ? n : 300;
}

function getSessionTtlSeconds(): number {
  const raw = process.env.AUTH_SESSION_TTL_SECONDS;
  const n = raw ? Number.parseInt(raw, 10) : 60 * 60 * 24 * 30;
  return Number.isFinite(n) && n > 0 ? n : 60 * 60 * 24 * 30;
}

export function allowDebugOtp(): boolean {
  const explicit = process.env.ALLOW_DEBUG_OTP;
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}

export function validatePhone(raw: string): string | null {
  const phone = normalizePhone(raw);
  return PHONE_RE.test(phone) ? phone : null;
}

export function validateEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

function signPayload(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifySignedPayload<T extends { exp: number }>(token: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = crypto
    .createHmac("sha256", getAuthSecret())
    .update(body)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as T;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createOtpCookieValue(
  channel: OtpChannel,
  identity: string,
  otp: string,
): string {
  return signPayload({
    channel,
    identity,
    otp,
    exp: Math.floor(Date.now() / 1000) + getOtpTtlSeconds(),
  });
}

export function verifyOtpToken(
  token: string,
  channel: OtpChannel,
  identity: string,
  otp: string,
): boolean {
  const code = otp.replace(/\D/g, "");
  if (code.length !== 4) return false;

  const payload = verifySignedPayload<{
    channel?: OtpChannel;
    identity?: string;
    phone?: string;
    otp: string;
    exp: number;
  }>(token);
  if (!payload) return false;

  // Legacy phone-only cookie
  if (!payload.channel && payload.phone) {
    return payload.phone === identity && payload.otp === code;
  }

  return (
    payload.channel === channel &&
    payload.identity === identity &&
    payload.otp === code
  );
}

/** @deprecated Use verifyOtpToken — kept for cookie-based fallback */
export function verifyOtpCookie(
  cookieValue: string,
  channel: OtpChannel,
  identity: string,
  otp: string,
): boolean {
  return verifyOtpToken(cookieValue, channel, identity, otp);
}

export function createSessionToken(channel: OtpChannel, identity: string): string {
  return signPayload({
    channel,
    identity,
    exp: Math.floor(Date.now() / 1000) + getSessionTtlSeconds(),
  });
}

export function verifySessionToken(token: string): SessionIdentity | null {
  const payload = verifySignedPayload<{
    channel?: OtpChannel;
    identity?: string;
    phone?: string;
    exp: number;
  }>(token);
  if (!payload) return null;

  if (payload.channel === "email" && payload.identity) {
    return { email: payload.identity };
  }
  if (payload.channel === "phone" && payload.identity) {
    return { phone: payload.identity };
  }
  if (payload.phone) {
    return { phone: payload.phone };
  }
  return null;
}

export function generateOtp(): string {
  return crypto.randomInt(0, 10000).toString().padStart(4, "0");
}

export function getOtpTtl(): number {
  return getOtpTtlSeconds();
}

export const OTP_COOKIE_NAME = "swastik_otp";
