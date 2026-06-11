import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OTP_COOKIE_NAME,
  createSessionToken,
  validateEmail,
  validatePhone,
  verifyOtpToken,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { phone?: string; email?: string; otp?: string; otp_token?: string };
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
  const otpSession =
    body.otp_token?.trim() || cookieStore.get(OTP_COOKIE_NAME)?.value;

  if (!otpSession) {
    return NextResponse.json(
      { detail: "OTP expired. Request a new one." },
      { status: 400 },
    );
  }

  if (!verifyOtpToken(otpSession, channel, identity, otp)) {
    return NextResponse.json({ detail: "Incorrect OTP" }, { status: 400 });
  }

  const sessionToken = createSessionToken(channel, identity);
  const response = NextResponse.json({
    ok: true,
    token: sessionToken,
    email: email ?? undefined,
    phone: phone ?? undefined,
  });
  response.cookies.delete(OTP_COOKIE_NAME);
  return response;
}
