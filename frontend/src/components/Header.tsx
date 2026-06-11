"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { pathToUrl } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import type { CategoryTreeNode } from "@/types/api";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  categoryTree: CategoryTreeNode[];
}

function getNavLinks(tree: CategoryTreeNode[]): { name: string; path: string }[] {
  const links: { name: string; path: string }[] = [];
  for (const node of tree) {
    if (node.is_leaf) {
      links.push({ name: node.name, path: node.path });
    } else {
      for (const child of node.children) {
        links.push({ name: child.name, path: child.path });
      }
    }
    if (links.length >= 5) break;
  }
  return links.slice(0, 5);
}

export function Header({ categoryTree }: HeaderProps) {
  const { count } = useCart();
  const navLinks = getNavLinks(categoryTree);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
            {BRAND.logoLetter}
          </span>
          <div className="leading-tight">
            <span className="font-display text-lg font-semibold tracking-tight text-brand-900 sm:text-xl">
              {BRAND.name}
            </span>
            <span className="hidden text-[10px] font-medium text-brand-600 sm:block">
              {BRAND.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={pathToUrl(link.path)}
              className="transition hover:text-brand-700"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchBar />
          <Link
            href="/cart"
            className="relative rounded-full bg-brand-700 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-800"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
