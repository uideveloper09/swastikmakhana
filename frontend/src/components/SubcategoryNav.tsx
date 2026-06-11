import Link from "next/link";
import type { CategoryChild } from "@/types/api";
import { pathToUrl } from "@/lib/api";

interface SubcategoryNavProps {
  items: CategoryChild[];
  currentPath: string;
  parentPath?: string;
  parentLabel?: string;
}

export function SubcategoryNav({
  items,
  currentPath,
  parentPath,
  parentLabel = "All",
}: SubcategoryNavProps) {
  if (items.length === 0 && !parentPath) return null;

  return (
    <div className="category-subnav">
      {parentPath && (
        <Link
          href={pathToUrl(parentPath)}
          className={`category-subnav-pill ${
            currentPath === parentPath ? "category-subnav-pill-active" : ""
          }`}
        >
          {parentLabel}
        </Link>
      )}
      {items.map((child) => (
        <Link
          key={child.id}
          href={pathToUrl(child.path)}
          className={`category-subnav-pill ${
            child.path === currentPath ? "category-subnav-pill-active" : ""
          }`}
        >
          {child.name}
          <span className="category-subnav-count">({child.product_count})</span>
        </Link>
      ))}
    </div>
  );
}
