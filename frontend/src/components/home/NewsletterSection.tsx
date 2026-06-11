"use client";

import { useState } from "react";
import { apiSubscribeNewsletter } from "@/lib/newsletter-api";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    const result = await apiSubscribeNewsletter(trimmed);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage(result.message);
    setSubmitted(true);
    setEmail(result.email);
  };

  return (
    <section className="py-16 text-center sm:py-20" style={{ background: "var(--primary)" }}>
      <div className="site-container">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Stay Connected
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          Join the Makhana Movement
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Get exclusive recipes, early access to new flavours, and special offers in your inbox.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-md bg-white/10 px-6 py-4 text-sm text-white">
            <p className="font-semibold">{message}</p>
            <p className="mt-1 text-white/70">{email}</p>
            {!message.includes("SMTP") && (
              <p className="mt-2 text-xs text-white/50">
                Check spam/promotions if you don&apos;t see it in a few minutes.
              </p>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-7 flex max-w-sm flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address..."
              disabled={loading}
              className="flex-1 rounded-md border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/15 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--accent-light)", color: "var(--midnight)" }}
            >
              {loading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-500/20 px-4 py-2 text-sm text-white" role="alert">
            {error}
          </p>
        )}
      </div>
      </div>
    </section>
  );
}
