import Image from "next/image";

import Link from "next/link";

import { SHOP_URL } from "@/lib/brand";
import { IMAGES } from "@/lib/images";

import { T } from "@/lib/theme";



export function BiharHeritageSection() {

  return (

    <section id="about" className="bg-linen-dark py-16 sm:py-24">

      <div className="site-container">

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          <div className="relative pb-5 pr-5">

            <div className="relative aspect-[1.1] overflow-hidden rounded-xl shadow-premium">

              <Image

                src={IMAGES.heritage.main}

                alt="Bihar wetlands and makhana harvesting"

                fill

                className="object-cover"

                sizes="(max-width: 1024px) 100vw, 50vw"

              />

            </div>

            <div

              className="absolute bottom-0 right-0 aspect-square w-[45%] overflow-hidden rounded-xl shadow-card-hover"

              style={{ border: `3px solid ${T.linen}` }}

            >

              <Image

                src={IMAGES.heritage.accent}

                alt="Fresh phool makhana"

                fill

                className="object-cover"

                sizes="200px"

              />

            </div>



            <div

              className="absolute -bottom-4 -right-2 rounded-2xl px-6 py-4 text-white shadow-premium sm:-right-6"

              style={{ background: T.primary, border: `2px solid ${T.accentLight}` }}

            >

              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.accentLight }}>

                GI Tagged

              </p>

              <p className="font-display text-lg font-bold">Bihar Makhana</p>

            </div>

          </div>



          <div>

            <p className="section-label">Our Heritage</p>

            <h2 className="section-heading mt-2">The Story of Bihar Makhana</h2>

            <div className="accent-divider mt-4 w-16" />

            <div className="mt-6 space-y-4 text-base leading-relaxed" style={{ color: T.textMuted }}>

              <p>

                For centuries, the wetlands of Bihar have nurtured the sacred lotus

                plant — and from its blooms emerge phool makhana, one of nature&apos;s

                most remarkable superfoods.

              </p>

              <p>

                Swastik Makhana partners directly with farming families across

                Bihar&apos;s wetlands, preserving traditional harvesting methods passed down

                through generations.

              </p>

              <p>

                Our makhana carries the prestigious{" "}

                <strong style={{ color: T.primary }}>GI Tag of Bihar</strong> — a mark of

                authenticity and unmatched quality.

              </p>

            </div>

            <Link href={SHOP_URL} className="premium-btn-accent mt-8">

              Explore Our Collection

            </Link>

          </div>

        </div>

      </div>

    </section>

  );

}


