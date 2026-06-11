import { REVIEWS } from "@/lib/brand";
import { SectionHeader } from "./SectionHeader";

export function ReviewsSection() {
  return (
    <section className="bg-linen-dark py-16 sm:py-20">
      <div className="site-container">
        <SectionHeader
          label="What Customers Say"
          title="Loved Across India"
          extra={
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
              <span className="text-lg" style={{ color: "var(--star)" }}>
                ★★★★★
              </span>
              <span className="font-display text-lg text-theme-secondary">
                4.9 / 5 from 2,800+ reviews
              </span>
            </div>
          }
        />

        <div className="grid gap-5 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <div key={review.name} className="html-card p-6 hover:-translate-y-1">
              <p
                className="font-display text-4xl leading-none opacity-40"
                style={{ color: "var(--accent-light)" }}
              >
                &ldquo;
              </p>
              <p className="mt-2 font-display text-base italic leading-relaxed text-theme-secondary">
                {review.text}
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: review.avatar }}
                >
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-theme">{review.name}</p>
                  <p className="text-[11px] text-theme-muted">
                    {"⭐".repeat(review.rating)} · {review.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
