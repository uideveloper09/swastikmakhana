import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OTP_COOKIE_NAME,
  allowDebugOtp,
  createOtpCookieValue,
  generateOtp,
  getOtpTtl,
  validatePhone,
} from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }

  const phone = validatePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ detail: "Invalid mobile number" }, { status: 400 });
  }

  const otp = generateOtp();
  const expiresIn = getOtpTtl();

  const cookieStore = await cookies();
  cookieStore.set(OTP_COOKIE_NAME, createOtpCookieValue(phone, otp), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
  });

  if (process.env.AUTH_OTP_MODE !== "sms") {
    console.info(`Demo OTP for +91${phone}: ${otp}`);
  }

  return NextResponse.json({
    ok: true,
    message: "OTP sent successfully",
    phone,
    expires_in: expiresIn,
    debug_otp: allowDebugOtp() ? otp : null,
  });
}
