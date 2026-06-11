import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OTP_COOKIE_NAME,
  createSessionToken,
  validateEmail,
  validatePhone,
  verifyOtpCookie,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { phone?: string; email?: string; otp?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const email = validateEmail(body.email ?? "");
  const phone = email ? null : validatePhone(body.phone ?? "");

  if (!email && !phone) {
    return NextResponse.json({ detail: "Enter a valid email or mobile number" }, { status: 400 });
  }

  const otp = body.otp ?? "";
  if (otp.replace(/\D/g, "").length !== 4) {
    return NextResponse.json({ detail: "Enter the 4-digit OTP" }, { status: 400 });
  }

  const channel = email ? "email" : "phone";
  const identity = email ?? phone!;

  const cookieStore = await cookies();
  const otpCookie = cookieStore.get(OTP_COOKIE_NAME)?.value;
  if (!otpCookie) {
    return NextResponse.json(
      { detail: "OTP expired. Request a new one." },
      { status: 400 },
    );
  }

  if (!verifyOtpCookie(otpCookie, channel, identity, otp)) {
    return NextResponse.json({ detail: "Incorrect OTP" }, { status: 400 });
  }

  cookieStore.delete(OTP_COOKIE_NAME);

  const token = createSessionToken(channel, identity);
  return NextResponse.json({
    ok: true,
    token,
    email: email ?? undefined,
    phone: phone ?? undefined,
  });
}
