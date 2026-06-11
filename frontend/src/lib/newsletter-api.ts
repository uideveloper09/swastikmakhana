const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export interface SubscribeResult {
  ok: true;
  message: string;
  email: string;
  alreadySubscribed: boolean;
  welcomeEmailSent: boolean;
}

export interface NewsletterError {
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
  return res.status === 0 ? "Cannot reach server. Please try again." : "Request failed";
}

export async function apiSubscribeNewsletter(
  email: string
): Promise<SubscribeResult | NewsletterError> {
  try {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      message: data.message,
      email: data.email,
      alreadySubscribed: Boolean(data.already_subscribed),
      welcomeEmailSent: Boolean(data.welcome_email_sent),
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Please try again." };
  }
}
