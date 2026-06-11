import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductImage } from "@/components/ProductImage";
import { fetchProduct, resolveCategory } from "@/lib/api-server";
import { formatPrice, formatRatingCount } from "@/lib/format";
import { pathToUrl } from "@/lib/paths";
import { MarketplaceLinks } from "@/components/MarketplaceLinks";
import { SHOP_CATEGORY_PATH } from "@/lib/brand";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product || !product.category_paths.includes(SHOP_CATEGORY_PATH)) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.brand} ${product.name}`,
    description: product.description,
    alternates: { canonical: `/p/${slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product || !product.category_paths.includes(SHOP_CATEGORY_PATH)) notFound();

  const primaryPath = product.category_paths[0];
  const categoryData = primaryPath ? await resolveCategory(primaryPath) : null;
  const breadcrumbs = categoryData?.breadcrumbs ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    offers: {
      "@type": "Offer",
      price: product.sale_price,
      priceCurrency: "INR",
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.rating_count,
    },
  };

  return (
    <div className="product-page">
      <div className="site-container py-6 sm:py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-gallery-frame">
              <ProductImage product={product} size="lg" />
              <WishlistButton
                productId={product.id}
                className="absolute right-4 top-4 z-10"
                size="md"
              />
            </div>
          </div>

          <div className="product-info-panel">
            <p className="product-brand-label">{product.brand}</p>
            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta-row">
              <span className="product-rating-badge">
                ★ {product.rating.toFixed(1)}
              </span>
              <span className="product-rating-count">
                {formatRatingCount(product.rating_count)} ratings
              </span>
              <span
                className={`product-stock-badge ${product.in_stock ? "product-stock-in" : "product-stock-out"}`}
              >
                {product.in_stock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="product-tags">
              <span className="product-tag">{product.pack_size}</span>
              {product.flavour !== "natural" && (
                <span className="product-tag">{product.flavour}</span>
              )}
              <span className="product-tag">Plain Makhana</span>
            </div>

            <div className="product-price-card">
              <div className="product-price-row">
                <span className="price-text price-text-lg text-primary">
                  {formatPrice(product.sale_price)}
                </span>
                {product.discount_pct > 0 && (
                  <>
                    <span className="price-text-mrp">{formatPrice(product.mrp)}</span>
                    <span className="product-discount-badge">
                      {product.discount_pct}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.discount_pct > 0 && (
                <p className="product-savings">
                  You save {formatPrice(product.mrp - product.sale_price)}
                </p>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-actions">
              <AddToCartButton product={product} size="md" />
            </div>

            <ul className="product-trust-list">
              <li>🌿 100% natural fox nuts</li>
              <li>🚚 Free delivery in Delhi NCR on orders above ₹499</li>
              <li>
                🛒 Also on <MarketplaceLinks />
              </li>
              <li>🏆 GI-tagged Bihar makhana</li>
            </ul>

            {primaryPath && (
              <Link href={pathToUrl(primaryPath)} className="product-back-link">
                ← Back to {categoryData?.category.name ?? "shop"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
