import { NextResponse } from "next/server";
import {
  OTP_COOKIE_NAME,
  allowDebugOtp,
  createOtpCookieValue,
  generateOtp,
  getOtpTtl,
  validateEmail,
  validatePhone,
} from "@/lib/server-auth";
import { isSmtpConfigured, sendLoginOtp } from "@/lib/server-email";

export async function POST(request: Request) {
  let body: { phone?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const email = validateEmail(body.email ?? "");
  const phone = email ? null : validatePhone(body.phone ?? "");

  if (!email && !phone) {
    if (body.email?.trim()) {
      return NextResponse.json({ detail: "Enter a valid email address" }, { status: 400 });
    }
    return NextResponse.json({ detail: "Invalid mobile number" }, { status: 400 });
  }

  const otp = generateOtp();
  const expiresIn = getOtpTtl();
  const channel = email ? "email" : "phone";
  const identity = email ?? phone!;
  const otpToken = createOtpCookieValue(channel, identity, otp);

  let emailSent = false;
  if (email) {
    if (!isSmtpConfigured()) {
      return NextResponse.json(
        {
          detail:
            "Email login is not configured yet. Add SMTP settings in Vercel Environment Variables.",
        },
        { status: 503 },
      );
    }
    try {
      await sendLoginOtp(email, otp);
      emailSent = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send email";
      console.error("Login OTP email failed:", message);
      return NextResponse.json(
        { detail: "Could not send OTP email. Try again in a moment." },
        { status: 502 },
      );
    }
  } else if (process.env.AUTH_OTP_MODE !== "sms") {
    console.info(`Demo OTP for +91${phone}: ${otp}`);
  }

  const response = NextResponse.json({
    ok: true,
    message: emailSent ? "OTP sent to your email" : "OTP sent successfully",
    email: email ?? undefined,
    phone: phone ?? undefined,
    expires_in: expiresIn,
    email_sent: emailSent,
    otp_token: otpToken,
    debug_otp: !emailSent && allowDebugOtp() ? otp : null,
  });

  response.cookies.set(OTP_COOKIE_NAME, otpToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
  });

  return response;
}
