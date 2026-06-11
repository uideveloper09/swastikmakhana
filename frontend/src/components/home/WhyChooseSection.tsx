import Image from "next/image";
import Link from "next/link";
import { BRAND, SHOP_URL, WHY_CHOOSE } from "@/lib/brand";
import { IMAGES } from "@/lib/images";
import { SectionHeader } from "./SectionHeader";

export function WhyChooseSection() {
  return (
    <section id="about" className="bg-linen-dark py-16 sm:py-20">
      <div className="site-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden pb-5 pr-5 sm:overflow-visible">
            <div className="relative aspect-[1.1] overflow-hidden rounded-[10px] shadow-premium">
              <Image
                src={IMAGES.heritage.main}
                alt="Thin plain Swastik makhana"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div
              className="absolute bottom-0 right-0 aspect-square w-[45%] overflow-hidden rounded-[10px] shadow-premium"
              style={{ border: "3px solid var(--bg)" }}
            >
              <Image
                src={IMAGES.heritage.accent}
                alt="Premium thin plain makhana"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>

          <div>
            <SectionHeader
              align="left"
              label="Our Promise"
              title={
                <>
                  Why Choose
                  <br />
                  <em className="not-italic text-primary">{BRAND.name}?</em>
                </>
              }
            />

            <ul className="mt-2 flex flex-col gap-4">
              {WHY_CHOOSE.map((item) => (
                <li key={item.title} className="flex gap-3.5">
                  <span className="check-icon">{item.icon}</span>
                  <div>
                    <strong className="block text-sm font-semibold text-theme">
                      {item.title}
                    </strong>
                    <p className="mt-0.5 text-xs leading-relaxed text-theme-muted">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href={SHOP_URL}
              className="btn-primary mt-8"
            >
              Shop Collection →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
