import Image from "next/image";
import Link from "next/link";
import { BRAND, SHOP_URL } from "@/lib/brand";
import { IMAGES } from "@/lib/images";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[58vh] items-center overflow-hidden sm:min-h-[68vh] lg:min-h-[72vh]">
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.hero}
          alt="Premium Swastik Makhana"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 hero-overlay"
          style={{ background: "var(--hero-overlay)" }}
        />
      </div>

      <div className="site-container relative z-10 py-10 sm:py-12 lg:py-14">
        <div className="max-w-lg">
          <p className="hero-line mb-2.5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            <span className="h-px w-8 bg-accent" />
            GI Tagged · Bihar Makhana
          </p>

          <h1 className="font-display text-4xl font-bold leading-none sm:text-5xl lg:text-[4.25rem]">
            <em className="not-italic text-primary">{BRAND.shortName}</em>
            <br />
            Makhana
          </h1>

          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-theme-secondary">
            {BRAND.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={SHOP_URL} className="btn-primary">
              Shop Now →
            </Link>
            <Link href="/#about" className="btn-secondary">
              Our Story
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[var(--border)]">
            {[
              { icon: "🌿", strong: "100% Natural", span: "No additives" },
              { icon: "🏆", strong: "GI Tagged", span: "Bihar origin" },
              { icon: "🚚", strong: "NCR Delivery", span: "Delhi NCR on site" },
            ].map((badge) => (
              <div
                key={badge.strong}
                className="flex items-center gap-2 px-0 py-1 text-xs text-theme-secondary sm:px-5"
              >
                <span className="text-lg">{badge.icon}</span>
                <div>
                  <strong className="block text-sm font-semibold text-theme">
                    {badge.strong}
                  </strong>
                  <span className="text-[11px]">{badge.span}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
