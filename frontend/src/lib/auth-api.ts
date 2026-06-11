const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const AUTH_KEY = "swastik-auth";

export function getStoredAuthToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(raw));
}

export function isValidEmail(raw: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(raw.trim());
}

export function formatPhoneDisplay(phone: string): string {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}

export function formatEmailDisplay(email: string): string {
  const at = email.indexOf("@");
  if (at <= 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 3) return email;
  return `${local.slice(0, 2)}···${local.slice(-1)}${domain}`;
}

export interface SendOtpResult {
  ok: true;
  email?: string;
  phone?: string;
  expiresIn: number;
  emailSent?: boolean;
  otpToken?: string;
  debugOtp?: string;
}

export interface VerifyOtpResult {
  ok: true;
  token: string;
  email?: string;
  phone?: string;
}

export interface AuthError {
  ok: false;
  error: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail[0]?.msg ?? "Request failed";
  } catch {
    // ignore
  }
  return res.status === 0 ? "Cannot reach server. Is the backend running?" : "Request failed";
}

export async function apiSendOtpByEmail(
  email: string,
): Promise<SendOtpResult | AuthError> {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      email: data.email,
      expiresIn: data.expires_in,
      emailSent: Boolean(data.email_sent),
      otpToken: data.otp_token ?? undefined,
      debugOtp: data.debug_otp ?? undefined,
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Please try again." };
  }
}

export async function apiVerifyOtpByEmail(
  email: string,
  otp: string,
  otpToken?: string,
): Promise<VerifyOtpResult | AuthError> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otp,
        otp_token: otpToken,
      }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      token: data.token,
      email: data.email,
      phone: data.phone,
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Please try again." };
  }
}

export async function apiGetMe(
  token: string,
): Promise<{ email?: string; phone?: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function apiLogout(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // ignore
  }
}
