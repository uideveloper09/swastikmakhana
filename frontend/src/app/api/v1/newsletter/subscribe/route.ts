import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getWritableDataPath } from "@/lib/data-path";
import {
  isSmtpConfigured,
  sendNewsletterWelcome,
  smtpNotConfiguredNote,
} from "@/lib/server-email";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DATA_FILE = getWritableDataPath("newsletter_subscribers.json");

async function loadSubscribers(): Promise<string[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
}

async function saveSubscribers(emails: string[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify([...emails].sort(), null, 2), "utf-8");
}

async function sendWelcomeEmail(
  customerEmail: string,
): Promise<{ sent: boolean; note: string }> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      note: smtpNotConfiguredNote(),
    };
  }

  try {
    await sendNewsletterWelcome(customerEmail);
    return { sent: true, note: "Welcome email sent to customer" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("Newsletter welcome email failed:", message);
    return { sent: false, note: message };
  }
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const customerEmail = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ detail: "Enter a valid email address" }, { status: 400 });
  }

  const subscribers = await loadSubscribers();
  const already = subscribers.includes(customerEmail);

  if (!already) {
    subscribers.push(customerEmail);
    await saveSubscribers(subscribers);
  }

  if (already) {
    return NextResponse.json({
      ok: true,
      message: "You're already on our list. Watch your inbox for offers!",
      email: customerEmail,
      already_subscribed: true,
      welcome_email_sent: false,
    });
  }

  const { sent: emailSent, note: emailNote } = await sendWelcomeEmail(customerEmail);

  if (emailSent) {
    return NextResponse.json({
      ok: true,
      message: "Welcome to the Swastik family! Check your inbox for a welcome email.",
      email: customerEmail,
      already_subscribed: false,
      welcome_email_sent: true,
    });
  }

  return NextResponse.json({
    ok: true,
    message: `You're subscribed! Welcome email not sent — ${emailNote}`,
    email: customerEmail,
    already_subscribed: false,
    welcome_email_sent: false,
  });
}
