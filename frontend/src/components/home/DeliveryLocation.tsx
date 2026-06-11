"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MarketplaceLinks } from "@/components/MarketplaceLinks";
import { DELIVERY_INFO } from "@/lib/brand";

export const DELIVERY_STORAGE_KEY = "swastik-delivery-location";

function isNcrPincode(pin: string): boolean {
  if (pin.length !== 6) return false;
  const prefix = pin.slice(0, 3);
  return ["110", "121", "122", "201", "203"].includes(prefix);
}

interface DeliveryLocationProps {
  /** Always visible (e.g. mobile menu) */
  inline?: boolean;
}

export function DeliveryLocation({ inline = false }: DeliveryLocationProps) {
  const [location, setLocation] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [showOutsideNcrHint, setShowOutsideNcrHint] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (saved) setLocation(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const closeModal = () => {
    setOpen(false);
    setPincode("");
    setShowOutsideNcrHint(false);
  };

  const saveLocation = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLocation(trimmed);
    localStorage.setItem(DELIVERY_STORAGE_KEY, trimmed);
    closeModal();
  };

  const applyPincode = () => {
    const trimmed = pincode.trim();
    if (trimmed.length !== 6) return;

    if (!isNcrPincode(trimmed)) {
      setShowOutsideNcrHint(true);
      return;
    }

    saveLocation(`Pincode ${trimmed}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`delivery-chip shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition hover:shadow-sm ${inline ? "flex w-full" : "hidden lg:flex"}`}
        aria-label="Check delivery availability"
      >
        <span className="shrink-0 text-sm leading-none" aria-hidden>
          📍
        </span>
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-xs font-bold leading-none text-primary">
            {DELIVERY_INFO.chipTitle}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-0.5 text-[11px] leading-tight text-theme-muted">
            <span className="max-w-[120px] truncate lg:max-w-[150px]">
              {location ?? DELIVERY_INFO.defaultArea}
            </span>
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="auth-modal-backdrop fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4 sm:p-6"
            onClick={closeModal}
            role="presentation"
          >
            <div
              className="auth-modal-panel relative w-full overflow-hidden rounded-2xl border bg-card"
              style={{ borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="location-title"
            >
              <div className="auth-modal-hero relative px-4 pb-4 pt-4 text-center">
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="auth-modal-icon mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>

                <h2 id="location-title" className="font-display text-lg font-bold text-white">
                  Where We Deliver
                </h2>
                <p className="mt-1 text-xs text-white/65">
                  {DELIVERY_INFO.serviceNote}
                </p>
              </div>

              <div className="px-4 pb-4 pt-3">
                <div className="rounded-xl border px-3 py-2.5 text-center" style={{ borderColor: "var(--border)" }}>
                  <p className="text-[11px] font-semibold text-primary">Also available nationwide</p>
                  <p className="mt-1 text-[11px] text-theme-muted">
                    Order on <MarketplaceLinks linkClassName="font-medium text-theme underline-offset-2 hover:underline" />
                  </p>
                </div>

                <p className="mt-3 text-center text-[11px] text-theme-muted">
                  Enter your NCR pincode or pick your area for website delivery.
                </p>

                <form
                  className="mt-3 space-y-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyPincode();
                  }}
                >
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-theme-muted">
                      Pincode
                    </span>
                    <div className="auth-phone-field">
                      <span className="auth-phone-prefix">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value.replace(/\D/g, ""));
                          setShowOutsideNcrHint(false);
                        }}
                        placeholder="Enter 6-digit pincode"
                        className="h-full w-full bg-transparent px-3.5 text-sm text-theme outline-none placeholder:text-theme-muted/60"
                      />
                    </div>
                  </label>
                  {showOutsideNcrHint && (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-[11px] leading-relaxed text-red-700" role="alert">
                      We deliver on this website only in Delhi NCR. For other cities, order on{" "}
                      <MarketplaceLinks linkClassName="font-semibold text-red-800 underline-offset-2 hover:underline" />
                      .
                    </p>
                  )}
                  <button
                    type="submit"
                    className="auth-btn-gold"
                    disabled={pincode.trim().length !== 6}
                  >
                    Check NCR Delivery
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </form>

                <div className="my-3 flex items-center gap-2">
                  <span className="h-px flex-1" style={{ background: "var(--border)" }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-theme-muted">or</span>
                  <span className="h-px flex-1" style={{ background: "var(--border)" }} />
                </div>

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">
                  Delhi NCR areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DELIVERY_INFO.ncrAreas.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => saveLocation(city)}
                      className={`location-city-chip rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                        location === city
                          ? "location-city-chip-active"
                          : "text-theme-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
