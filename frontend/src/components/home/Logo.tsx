import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { T } from "@/lib/theme";

interface LogoProps {
  showTagline?: boolean;
  /** Hide long tagline on smaller desktop to keep header nav on one line */
  compactTagline?: boolean;
  /** Footer layout — no truncation, centered on small screens */
  footer?: boolean;
  variant?: "light" | "dark";
}

export function Logo({
  showTagline = false,
  compactTagline = false,
  footer = false,
  variant = "dark",
}: LogoProps) {
  const isLight = variant === "light";

  const isHeaderCompact = showTagline && compactTagline && !footer;

  return (
    <Link
      href="/"
      className={`group flex min-w-0 items-center gap-2.5 sm:gap-3 ${
        footer
          ? "justify-center sm:justify-start"
          : isHeaderCompact
            ? "max-w-[min(100%,18rem)] sm:max-w-[20rem] xl:max-w-[17rem] 2xl:max-w-[21rem]"
            : ""
      }`}
    >
      <svg
        viewBox="0 0 50 50"
        fill="none"
        className={`shrink-0 transition group-hover:scale-105 ${
          isHeaderCompact
            ? "h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem] xl:h-11 xl:w-11 2xl:h-12 2xl:w-12"
            : "h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem]"
        }`}
        aria-hidden
      >
        <circle cx="25" cy="25" r="23.5" fill={T.primary} stroke={T.logoStroke} strokeWidth="1" />
        <rect x="22" y="22" width="6" height="6" rx="1" fill={T.logoGold} />
        <rect x="22" y="10" width="6" height="12" rx="1" fill={T.logoGold} />
        <rect x="28" y="10" width="8" height="5" rx="1" fill={T.logoGold} />
        <rect x="22" y="28" width="6" height="12" rx="1" fill={T.logoGold} />
        <rect x="14" y="35" width="8" height="5" rx="1" fill={T.logoGold} />
        <rect x="28" y="22" width="12" height="6" rx="1" fill={T.logoGold} />
        <rect x="35" y="28" width="5" height="8" rx="1" fill={T.logoGold} />
        <rect x="10" y="22" width="12" height="6" rx="1" fill={T.logoGold} />
        <rect x="10" y="14" width="5" height="8" rx="1" fill={T.logoGold} />
      </svg>
      <div className="min-w-0 flex-1 leading-none">
        <span
          className={`logo-wordmark block ${
            isHeaderCompact ? "logo-wordmark-compact" : "logo-wordmark-full"
          } ${isLight ? "logo-wordmark-light" : ""}`}
        >
          <span className="logo-wordmark-accent">Swastik</span>
          <span className="logo-wordmark-main"> Makhana</span>
        </span>
        {showTagline && (
          <span
            className={`mt-1 block text-accent ${
              footer
                ? "text-[9px] font-medium uppercase leading-snug tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em]"
                : isHeaderCompact
                  ? "truncate whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.1em] sm:text-[9px] sm:tracking-[0.12em] xl:max-w-[155px] 2xl:max-w-[220px]"
                  : `font-medium uppercase leading-snug tracking-[0.12em] sm:tracking-[0.16em] lg:text-[10px] lg:tracking-[0.18em] ${
                      compactTagline
                        ? "max-w-[140px] truncate text-[8px] sm:max-w-[180px] sm:text-[9px]"
                        : "max-w-[155px] text-[8px] sm:max-w-[220px] sm:text-[9px] lg:max-w-none"
                    }`
            }`}
          >
            {BRAND.tagline}
          </span>
        )}
      </div>
    </Link>
  );
}
