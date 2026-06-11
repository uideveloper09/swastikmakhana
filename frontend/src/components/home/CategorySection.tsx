import Image from "next/image";
import Link from "next/link";
import { categoryUrl, SHOP_CATEGORIES } from "@/lib/brand";
import { IMAGES } from "@/lib/images";
import { SectionHeader } from "./SectionHeader";

export function CategorySection() {
  return (
    <section className="bg-linen-dark py-16 sm:py-20">
      <div className="site-container">
        <SectionHeader
          label="Explore Our Range"
          title="Shop by Category"
          subtitle="From classic to bold — choose your favourite flavour of the finest Bihar fox nuts."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6">
          {SHOP_CATEGORIES.map((cat, index) => (
            <Link
              key={cat.path}
              href={categoryUrl(cat.path)}
              className="html-category-card group flex flex-col"
            >
              <div className="category-card-image relative aspect-square overflow-hidden">
                <Image
                  src={IMAGES.categories[cat.imageIndex]}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 320px"
                  quality={90}
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-3.5 pt-3 sm:px-4 sm:pt-3.5">
                <div className="flex items-start gap-2">
                  <span className="category-card-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px]">
                    {cat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-theme">
                      {cat.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-theme-muted">{cat.sub}</p>
                  </div>
                </div>
              </div>

              <div className="category-card-footer mt-2.5 flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors duration-300 group-hover:text-accent">
                  Shop Now
                </span>
                <span className="category-card-cta-btn" aria-hidden>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
