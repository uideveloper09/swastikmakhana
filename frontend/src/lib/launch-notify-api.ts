function getApiBase(): string {
  if (typeof window !== "undefined") return "/api/v1";
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    `${(process.env.BACKEND_URL || "http://127.0.0.1:8080").replace(/\/$/, "")}/api/v1`
  );
}

export interface LaunchNotifyResult {
  ok: true;
  message: string;
  email: string;
  categoryName: string;
  alreadyRegistered: boolean;
  confirmationEmailSent: boolean;
}

export interface LaunchNotifyError {
  ok: false;
  error: string;
}

async function parseError(res: Response): Promise<string> {
  if (res.status === 404) {
    return "Notify service is unavailable. Restart the backend server and try again.";
  }
  if (res.status >= 500) {
    return "Server error. Please try again in a moment.";
  }
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") {
      if (data.detail === "Not Found") {
        return "Notify service is unavailable. Restart the backend server and try again.";
      }
      return data.detail;
    }
    if (Array.isArray(data?.detail)) return data.detail[0]?.msg ?? "Request failed";
  } catch {
    // ignore
  }
  return res.status === 0
    ? "Cannot reach server. Is the backend running on port 8080?"
    : "Something went wrong. Please try again.";
}

export async function apiSubscribeLaunchNotify(
  email: string,
  categorySlug: string,
  categoryName: string,
): Promise<LaunchNotifyResult | LaunchNotifyError> {
  try {
    const res = await fetch(`${getApiBase()}/launch-notify/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        category_slug: categorySlug,
        category_name: categoryName,
      }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      message: data.message,
      email: data.email,
      categoryName: data.category_name,
      alreadyRegistered: Boolean(data.already_registered),
      confirmationEmailSent: Boolean(data.confirmation_email_sent),
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Start backend on port 8080." };
  }
}
