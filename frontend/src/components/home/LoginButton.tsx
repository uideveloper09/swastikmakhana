"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiSendOtp,
  apiVerifyOtp,
  formatPhoneDisplay,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth-api";
import { TRUST_FEATURES } from "@/lib/brand";
import { OtpInput } from "./OtpInput";

function formatResendTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function UserIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function LoginTrigger({
  inline = false,
  onClick,
}: {
  inline?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`login-trigger shrink-0 ${inline ? "login-trigger-inline" : "hidden lg:inline-flex"}`}
    >
      <span className="login-trigger-icon" aria-hidden>
        <UserIcon />
      </span>
      <span className="login-trigger-copy">
        <span className="login-trigger-label">Login</span>
        <span className={`login-trigger-sub ${inline ? "" : "hidden xl:block"}`}>New here? Sign up</span>
      </span>
    </button>
  );
}

interface LoginButtonProps {
  inline?: boolean;
}

type Step = "phone" | "otp";

export function LoginButton({ inline = false }: LoginButtonProps) {
  const { phone: loggedInPhone, isAuthenticated, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const resetForm = () => {
    setStep("phone");
    setPhone("");
    setOtp("");
    setError("");
    setLoading(false);
    setDebugOtp(null);
    setResendIn(0);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendIn]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    const result = await apiSendOtp(normalizePhone(phone));
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPhone(result.phone);
    setDebugOtp(result.debugOtp ?? null);
    setResendIn(30);
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.replace(/\D/g, "").length !== 4) {
      setError("Enter the 4-digit OTP.");
      return;
    }

    setLoading(true);
    const result = await apiVerifyOtp(phone, otp);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    login(result.token, result.phone);
    closeModal();
  };

  const handleResendOtp = async () => {
    setError("");
    setOtp("");
    setLoading(true);
    const result = await apiSendOtp(phone);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDebugOtp(result.debugOtp ?? null);
    setResendIn(30);
  };

  if (isAuthenticated && loggedInPhone) {
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`login-trigger-user ${inline ? "inline-flex w-full justify-center" : "hidden lg:inline-flex"}`}
        >
          <span className="login-trigger-user-icon" aria-hidden>
            {loggedInPhone.slice(-2)}
          </span>
          <span className="max-w-[108px] truncate text-[11px] font-semibold">
            {formatPhoneDisplay(loggedInPhone)}
          </span>
          <svg className="h-3 w-3 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpen(false)} role="presentation" />
            <div
              className="absolute right-0 top-full z-[95] mt-2 min-w-[160px] rounded-lg border bg-card py-1 shadow-premium"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="px-3 py-2 text-[11px] text-theme-muted">Signed in as</p>
              <p className="px-3 pb-2 text-xs font-semibold text-theme">
                {formatPhoneDisplay(loggedInPhone)}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="w-full px-3 py-2 text-left text-xs text-red-600 transition hover:bg-linen-dark"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <LoginTrigger inline={inline} onClick={() => setOpen(true)} />

      {open &&
        mounted &&
        createPortal(
          <div
            className="auth-modal-backdrop fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4 sm:p-6"
            onClick={closeModal}
            role="presentation"
          >
            <div
              className={`auth-modal-panel relative w-full overflow-hidden rounded-2xl border bg-card ${step === "otp" ? "auth-modal-panel-otp" : ""}`}
              style={{ borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-title"
            >
              <button
                type="button"
                onClick={closeModal}
                className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition ${
                  step === "otp"
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {step === "phone" ? (
                <>
                  <div className="auth-modal-hero relative px-4 pb-4 pt-4 text-center">
                    <div className="auth-modal-icon mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <h2 id="auth-title" className="font-display text-lg font-bold text-white">
                      Welcome to Swastik
                    </h2>
                    <p className="mt-1 text-xs text-white/65">Premium makhana, delivered with care.</p>
                  </div>

                  <div className="px-4 pb-4 pt-3">
                    <p className="text-center text-[11px] text-theme-muted">
                      Sign in to track orders, save addresses & unlock exclusive offers.
                    </p>

                    {error && (
                      <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700" role="alert">
                        {error}
                      </p>
                    )}

                    <form className="mt-3 space-y-2.5" onSubmit={handleSendOtp}>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-theme-muted">
                          Mobile number
                        </span>
                        <div className="auth-phone-field">
                          <span className="auth-phone-prefix">+91</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="Enter 10-digit number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-full w-full bg-transparent px-3.5 text-sm text-theme outline-none placeholder:text-theme-muted/60"
                            disabled={loading}
                          />
                        </div>
                      </label>
                      <button type="submit" className="auth-btn-gold" disabled={loading}>
                        {loading ? "Sending OTP…" : "Continue"}
                        {!loading && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        )}
                      </button>
                    </form>

                    <p className="mt-3 text-center text-[10px] leading-relaxed text-theme-muted">
                      By continuing, you agree to our{" "}
                      <span className="text-primary">Terms</span> &{" "}
                      <span className="text-primary">Privacy Policy</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row">
                  <aside className="auth-otp-aside hidden w-[42%] flex-col justify-between p-6 sm:flex">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-accent">Why choose Swastik?</h3>
                      <div className="mt-6 grid grid-cols-2 gap-5">
                        {TRUST_FEATURES.map((item) => (
                          <div key={item.title} className="auth-trust-tile">
                            <span className="auth-trust-icon">{item.icon}</span>
                            <span className="text-xs font-semibold text-theme">{item.title}</span>
                            <span className="text-[10px] leading-snug text-theme-muted">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-6 border-t pt-4 text-center text-[10px] text-theme-muted" style={{ borderColor: "var(--border)" }}>
                      Direct from Bihar · GI Tagged Makhana
                    </p>
                  </aside>

                  <div className="auth-otp-panel flex flex-1 flex-col px-5 py-6 sm:px-7 sm:py-8">
                    <h2 id="auth-title" className="pr-8 text-xl font-bold text-white sm:text-2xl">
                      Verify Mobile Number
                    </h2>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-white/90 sm:text-base">{formatPhoneDisplay(phone)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("phone");
                          setOtp("");
                          setError("");
                          setDebugOtp(null);
                          setResendIn(0);
                        }}
                        className="text-white/60 transition hover:text-white"
                        aria-label="Edit mobile number"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                    </div>
                    <div className="auth-otp-accent-line" />

                    {error && (
                      <p className="mt-4 rounded-md bg-red-500/15 px-3 py-2 text-xs text-red-200" role="alert">
                        {error}
                      </p>
                    )}

                    <form className="mt-6 flex flex-1 flex-col" onSubmit={handleVerifyOtp}>
                      <label className="text-sm text-white/80">Enter OTP</label>

                      <div className="mt-3">
                        <OtpInput value={otp} onChange={setOtp} disabled={loading} variant="dark" />
                      </div>

                      {debugOtp && (
                        <p className="mt-3 text-center text-[11px] text-accent-light">
                          Dev OTP: <strong>{debugOtp}</strong>
                        </p>
                      )}

                      <button
                        type="submit"
                        className="auth-otp-verify-btn mt-6"
                        disabled={loading || otp.length < 4}
                      >
                        {loading ? "Verifying…" : "Verify & Continue"}
                      </button>

                      <div className="mt-5 text-center">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-sm font-medium text-accent-light transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={loading || resendIn > 0}
                        >
                          {resendIn > 0
                            ? `Resend OTP in ${formatResendTime(resendIn)}`
                            : "Resend OTP"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
