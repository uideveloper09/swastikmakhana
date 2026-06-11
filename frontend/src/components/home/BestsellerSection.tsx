import type { ProductCard } from "@/types/api";
import { SectionHeader } from "./SectionHeader";
import { BestsellerCard } from "./BestsellerCard";

interface BestsellerSectionProps {
  products: ProductCard[];
}

export function BestsellerSection({ products }: BestsellerSectionProps) {
  const featured = products.slice(0, 4);

  return (
    <section className="bg-linen py-16 sm:py-20">
      <div className="site-container">
        <SectionHeader
          label="Plain Makhana"
          title="Choose Your Pack Size"
          subtitle="Thin-grade natural fox nuts — handpicked from Bihar's wetlands. Available in 100g, 150g, 200g & 250g."
        />

        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <BestsellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
