import Link from "next/link";
import type { BreadcrumbItem } from "@/types/api";
import { pathToUrl } from "@/lib/api";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        <li>
          <Link href="/" className="breadcrumbs-link">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.path} className="breadcrumbs-item">
            <span className="breadcrumbs-sep" aria-hidden>
              /
            </span>
            {i === items.length - 1 ? (
              <span className="breadcrumbs-current">{item.name}</span>
            ) : (
              <Link href={pathToUrl(item.path)} className="breadcrumbs-link">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
