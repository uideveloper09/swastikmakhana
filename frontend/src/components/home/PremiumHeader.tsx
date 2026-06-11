"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { NAV_LINKS } from "@/lib/brand";
import { DeliveryLocation } from "./DeliveryLocation";
import { LoginButton } from "./LoginButton";
import { Logo } from "./Logo";

function SearchIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname.startsWith(href);
}

interface HeaderSearchFormProps {
  query: string;
  setQuery: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  variant: "row" | "popover";
  formRef?: React.RefObject<HTMLFormElement | null>;
}

function HeaderSearchForm({
  query,
  setQuery,
  onSubmit,
  onClose,
  inputRef,
  variant,
  formRef,
}: HeaderSearchFormProps) {
  const isRow = variant === "row";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={isRow ? "header-search-bar" : "header-search-popover"}
    >
      <div className="header-search-field relative min-w-0">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-theme-muted sm:h-4 sm:w-4" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isRow ? "Search makhana, pack size..." : "Search makhana..."}
          className="header-search-input"
        />
      </div>
      <button type="submit" className="header-search-go" aria-label="Search">
        {isRow ? "Search" : "Go"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="header-search-close"
        aria-label="Close search"
      >
        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
  );
}

function useIsXlUp() {
  const [isXl, setIsXl] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsXl(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isXl;
}

export function PremiumHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchIconRef = useRef<HTMLButtonElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);
  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const isXlUp = useIsXlUp();

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (searchIconRef.current?.contains(target)) return;
      if (mobileSearchRef.current?.contains(target)) return;
      if (desktopSearchRef.current?.contains(target)) return;
      setSearchOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const openSearch = () => {
    setMobileOpen(false);
    setSearchOpen(true);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: "var(--nav-bg)", borderColor: "var(--border)" }}
    >
      <div className="site-container relative">
        <div className="flex min-h-[72px] min-w-0 items-center gap-2 py-2 sm:min-h-[84px] sm:gap-3 sm:py-2.5 xl:grid xl:grid-cols-[minmax(0,auto)_auto_minmax(0,1fr)_auto] xl:items-center xl:gap-4 2xl:gap-5">
          {/* Logo */}
          <div className="min-w-0 shrink">
            <Logo showTagline compactTagline />
          </div>

          {/* Delivery location */}
          <DeliveryLocation />

          {/* Nav — centered */}
          <nav className="hidden items-center justify-center gap-x-5 xl:flex 2xl:gap-x-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(pathname, link.href) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="relative ml-auto flex shrink-0 items-center gap-1.5 overflow-visible pr-0.5 sm:gap-2 xl:ml-0 xl:gap-2.5">
            {!searchOpen && (
              <button
                ref={searchIconRef}
                type="button"
                onClick={openSearch}
                className="header-icon-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-theme-secondary transition hover:bg-linen-dark"
                aria-label="Search products"
              >
                <SearchIcon />
              </button>
            )}

            {searchOpen && isXlUp && (
              <div className="relative h-9 w-9 shrink-0">
                <HeaderSearchForm
                  formRef={desktopSearchRef}
                  inputRef={searchInputRef}
                  query={query}
                  setQuery={setQuery}
                  onSubmit={handleSearch}
                  onClose={() => setSearchOpen(false)}
                  variant="popover"
                />
              </div>
            )}

            <LoginButton />

            <div
              className="hidden h-6 w-px lg:block"
              style={{ background: "var(--border)" }}
              aria-hidden
            />

            <Link
              href="/cart"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-full text-theme-secondary transition hover:bg-linen-dark"
              aria-label="Cart"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {count > 0 && (
                <span
                  className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full border-2 px-0.5 text-[9px] font-bold leading-none text-white"
                  style={{ background: "var(--primary)", borderColor: "var(--nav-bg)" }}
                >
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary xl:hidden"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {searchOpen && !isXlUp && (
          <div className="header-search-row">
            <HeaderSearchForm
              formRef={mobileSearchRef}
              inputRef={searchInputRef}
              query={query}
              setQuery={setQuery}
              onSubmit={handleSearch}
              onClose={() => setSearchOpen(false)}
              variant="row"
            />
          </div>
        )}
      </div>

      {mobileOpen && (
        <nav className="site-container border-t bg-linen-dark py-4 xl:hidden" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 lg:hidden">
            <DeliveryLocation inline />
          </div>
          <div className="mb-3 lg:hidden">
            <LoginButton inline />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="nav-link block border-b py-3 last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              openSearch();
            }}
            className="nav-link mt-3 flex w-full items-center gap-2 border-t pt-3 text-left"
            style={{ borderColor: "var(--border)" }}
          >
            <SearchIcon className="h-4 w-4" />
            Search products
          </button>
        </nav>
      )}
    </header>
  );
}
