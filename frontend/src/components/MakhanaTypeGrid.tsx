import Image from "next/image";
import Link from "next/link";
import type { CategoryChild } from "@/types/api";
import { NotifyMeButton } from "@/components/NotifyMeButton";
import { categoryUrl, getMakhanaTypeMeta } from "@/lib/brand";
import { IMAGES } from "@/lib/images";

interface MakhanaTypeGridProps {
  types: CategoryChild[];
}

function MakhanaTypeCard({ type }: { type: CategoryChild }) {
  const meta = getMakhanaTypeMeta(type.slug);
  const imageSrc = IMAGES.categories[meta?.imageIndex ?? 0] ?? IMAGES.categories[0];
  const isComingSoon = meta?.status === "coming_soon";

  const card = (
    <>
      <div className="makhana-type-card-image relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageSrc}
          alt={type.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center transition-transform duration-500 ${
            isComingSoon ? "scale-100" : "group-hover:scale-105"
          }`}
        />
        <div className="makhana-type-card-overlay" aria-hidden />
        {isComingSoon && (
          <span className="makhana-type-soon-badge">Coming Soon</span>
        )}
      </div>

      <div className="makhana-type-card-body">
        <div className="flex items-start gap-2.5">
          <span className="makhana-type-card-icon" aria-hidden>
            {meta?.emoji ?? "🪷"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="makhana-type-card-title">{type.name}</h2>
            {meta?.sub && <p className="makhana-type-card-sub">{meta.sub}</p>}
          </div>
        </div>

        <div className="makhana-type-card-footer">
          {isComingSoon ? (
            <>
              <span className="makhana-type-card-count">Next launch</span>
              <NotifyMeButton categorySlug={type.slug} categoryName={type.name} />
            </>
          ) : (
            <>
              <span className="makhana-type-card-count">
                {type.product_count}{" "}
                {type.product_count === 1 ? "product" : "products"}
              </span>
              <span className="makhana-type-card-cta">
                Shop
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  if (isComingSoon) {
    return (
      <article
        className="makhana-type-card makhana-type-card--soon"
        aria-label={`${type.name} — coming soon`}
      >
        {card}
      </article>
    );
  }

  return (
    <Link
      href={categoryUrl(type.path)}
      className="makhana-type-card group"
    >
      {card}
    </Link>
  );
}

export function MakhanaTypeGrid({ types }: MakhanaTypeGridProps) {
  if (types.length === 0) return null;

  return (
    <div className="makhana-type-grid">
      {types.map((type) => (
        <MakhanaTypeCard key={type.id} type={type} />
      ))}
    </div>
  );
}
