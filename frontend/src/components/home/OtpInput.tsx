"use client";

import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  variant?: "light" | "dark";
}

export function OtpInput({ value, onChange, disabled, variant = "light" }: OtpInputProps) {
  const digitClass = variant === "dark" ? "auth-otp-digit-dark" : "auth-otp-digit";
  const filledClass = variant === "dark" ? "auth-otp-digit-dark-filled" : "auth-otp-digit-filled";
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 4 }, (_, i) => value[i] ?? "");

  const update = (next: string[]) => {
    onChange(next.join("").slice(0, 4));
  };

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < 3) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 3) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="auth-otp-autofill"
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, 4);
          onChange(next);
          if (next.length === 4) refs.current[3]?.focus();
        }}
        disabled={disabled}
        aria-hidden
        tabIndex={-1}
      />
      <div
        className={`flex ${variant === "dark" ? "justify-start gap-2.5" : "justify-center gap-1.5"}`}
        onPaste={handlePaste}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            className={`${digitClass} ${digit ? filledClass : ""}`}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
