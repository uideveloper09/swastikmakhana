import { MakhanaTypeGrid } from "@/components/MakhanaTypeGrid";
import { UPCOMING_MAKHANA_TYPES } from "@/lib/brand";
import { SectionHeader } from "./SectionHeader";

const upcomingTypes = UPCOMING_MAKHANA_TYPES.map((cat) => ({
  id: cat.slug,
  slug: cat.slug,
  name: cat.name,
  path: cat.path,
  product_count: 0,
}));

export function ComingSoonSection() {
  return (
    <section className="bg-linen-dark py-16 sm:py-20">
      <div className="site-container">
        <SectionHeader
          label="Next Launch"
          title="More Flavours Coming Soon"
          subtitle="Roasted, masala, peri peri and more — new Swastik makhana varieties are on the way."
        />

        <div className="mt-10">
          <MakhanaTypeGrid types={upcomingTypes} />
        </div>
      </div>
    </section>
  );
}
