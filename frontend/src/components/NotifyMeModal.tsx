"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { apiSubscribeLaunchNotify } from "@/lib/launch-notify-api";

const NOTIFY_EMAIL_KEY = "swastik-notify-email";

interface NotifyMeModalProps {
  open: boolean;
  onClose: () => void;
  categorySlug: string;
  categoryName: string;
}

export function NotifyMeModal({
  open,
  onClose,
  categorySlug,
  categoryName,
}: NotifyMeModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(NOTIFY_EMAIL_KEY);
    if (saved) setEmail(saved);
    setMessage("");
    setError("");
    setSubmitted(false);
    setEmailSent(false);
    setLoading(false);
  }, [open, categorySlug]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    const result = await apiSubscribeLaunchNotify(trimmed, categorySlug, categoryName);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    localStorage.setItem(NOTIFY_EMAIL_KEY, result.email);
    setMessage(result.message);
    setEmailSent(result.confirmationEmailSent);
    setSubmitted(true);
    setEmail(result.email);
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="auth-modal-backdrop fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="auth-modal-panel relative w-full max-w-md overflow-hidden rounded-2xl border bg-card"
        style={{ borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notify-title"
      >
        <div className="auth-modal-hero relative px-4 pb-4 pt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="auth-modal-icon mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
            <span className="text-lg" aria-hidden>
              🔔
            </span>
          </div>

          <h2 id="notify-title" className="font-display text-lg font-bold text-white">
            Notify Me at Launch
          </h2>
          <p className="mt-1 text-xs text-white/65">
            Get an email when <span className="font-semibold text-white">{categoryName}</span> goes live
          </p>
        </div>

        <div className="px-4 pb-4 pt-3">
          {submitted ? (
            <div className="rounded-xl border px-4 py-4 text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold text-primary">{message}</p>
              <p className="mt-1 text-xs text-theme-muted">{email}</p>
              {emailSent && (
                <p className="mt-2 text-xs text-theme-muted">
                  Check inbox and spam/promotions if you don&apos;t see it within a few minutes.
                </p>
              )}
              <button type="button" onClick={onClose} className="auth-btn-gold mt-4 w-full">
                Done
              </button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-theme-muted">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm text-theme outline-none transition focus:ring-2 disabled:opacity-60"
                  style={{ borderColor: "var(--border)" }}
                />
              </label>

              {error && (
                <p className="notify-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="auth-btn-gold w-full" disabled={loading}>
                {loading ? "Saving…" : "Notify Me"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
