"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition hover:border-brand-500 hover:text-brand-700 md:hidden"
      >
        Search
      </button>

      <form onSubmit={handleSubmit} className="hidden md:block">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Swastik Makhana, brands..."
            className="w-56 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-4 pr-10 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500 lg:w-72"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-brand-700 px-3 py-1 text-xs font-medium text-white hover:bg-brand-800"
          >
            Go
          </button>
        </div>
      </form>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden">
          <div className="bg-white p-4 shadow-lg">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
