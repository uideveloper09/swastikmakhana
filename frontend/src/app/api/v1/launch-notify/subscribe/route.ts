import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getWritableDataPath } from "@/lib/data-path";
import {
  isSmtpConfigured,
  sendLaunchNotifyConfirmation,
} from "@/lib/server-email";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DATA_FILE = getWritableDataPath("launch_notify_subscribers.json");

interface NotifyEntry {
  email: string;
  category_slug: string;
  category_name: string;
  created_at: string;
}

async function loadEntries(): Promise<NotifyEntry[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveEntries(entries: NotifyEntry[]): Promise<void> {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

async function sendConfirmationToCustomer(
  customerEmail: string,
  categoryName: string,
): Promise<{ sent: boolean; note: string }> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      note: "Add SMTP settings in Vercel → Settings → Environment Variables, then redeploy",
    };
  }

  try {
    await sendLaunchNotifyConfirmation(customerEmail, categoryName);
    return { sent: true, note: "Confirmation email sent to customer" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("Notify Me email failed:", message);
    return { sent: false, note: message };
  }
}

function buildMessage(
  categoryName: string,
  customerEmail: string,
  already: boolean,
  emailSent: boolean,
  emailNote: string,
): string {
  const base = already
    ? `You're already on the list for ${categoryName}.`
    : `You're in! We'll notify you when ${categoryName} launches.`;

  if (emailSent) {
    return `${base} Confirmation email sent to ${customerEmail}.`;
  }
  return `${base} Saved, but email not sent — ${emailNote}`;
}

export async function POST(request: Request) {
  let body: { email?: string; category_slug?: string; category_name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const customerEmail = body.email?.trim().toLowerCase() ?? "";
  const categorySlug = body.category_slug?.trim().toLowerCase() ?? "";
  const categoryName = body.category_name?.trim() ?? "";

  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ detail: "Enter a valid email address" }, { status: 400 });
  }
  if (!categorySlug || !categoryName) {
    return NextResponse.json({ detail: "Invalid product category" }, { status: 400 });
  }

  const entries = await loadEntries();
  const already = entries.some(
    (e) => e.email === customerEmail && e.category_slug === categorySlug,
  );

  if (!already) {
    entries.push({
      email: customerEmail,
      category_slug: categorySlug,
      category_name: categoryName,
      created_at: new Date().toISOString(),
    });
    await saveEntries(entries);
  }

  const { sent: emailSent, note: emailNote } = await sendConfirmationToCustomer(
    customerEmail,
    categoryName,
  );

  return NextResponse.json({
    ok: true,
    message: buildMessage(categoryName, customerEmail, already, emailSent, emailNote),
    email: customerEmail,
    category_name: categoryName,
    already_registered: already,
    confirmation_email_sent: emailSent,
  });
}
