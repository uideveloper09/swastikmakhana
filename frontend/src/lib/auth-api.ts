const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

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

export function formatPhoneDisplay(phone: string): string {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
}

export interface SendOtpResult {
  ok: true;
  phone: string;
  expiresIn: number;
  debugOtp?: string;
}

export interface VerifyOtpResult {
  ok: true;
  token: string;
  phone: string;
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

export async function apiSendOtp(phone: string): Promise<SendOtpResult | AuthError> {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      phone: data.phone,
      expiresIn: data.expires_in,
      debugOtp: data.debug_otp ?? undefined,
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Start backend on port 8080." };
  }
}

export async function apiVerifyOtp(
  phone: string,
  otp: string
): Promise<VerifyOtpResult | AuthError> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return { ok: true, token: data.token, phone: data.phone };
  } catch {
    return { ok: false, error: "Cannot reach server. Start backend on port 8080." };
  }
}

export async function apiGetMe(token: string): Promise<{ phone: string } | null> {
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
