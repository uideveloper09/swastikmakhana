import { BestsellerSection } from "@/components/home/BestsellerSection";
import { ComingSoonSection } from "@/components/home/ComingSoonSection";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { TrustFeatures } from "@/components/home/TrustFeatures";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { fetchProducts } from "@/lib/api-server";
import { SHOP_CATEGORY_PATH } from "@/lib/brand";

export default async function HomePage() {
  const { products } = await fetchProducts(SHOP_CATEGORY_PATH, { page: 1 });

  return (
    <>
      <HeroSection />
      <TrustFeatures />
      <BestsellerSection products={products} />
      <ComingSoonSection />
      <WhyChooseSection />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
