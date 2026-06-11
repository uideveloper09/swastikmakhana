import Image from "next/image";
import type { ProductCard } from "@/types/api";
import { getProductImage, isPlaceholderImage } from "@/lib/images";

interface ProductImageProps {
  product: Pick<ProductCard, "name" | "brand" | "image_url" | "flavour"> & {
    slug?: string;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Override image src (e.g. featured product index mapping) */
  src?: string;
}

export function ProductImage({
  product,
  size = "md",
  className = "",
  src: srcOverride,
}: ProductImageProps) {
  const src =
    srcOverride ??
    (product.image_url?.startsWith("http")
      ? product.image_url
      : isPlaceholderImage(product.image_url)
        ? getProductImage(
            product.slug ?? product.name.toLowerCase().replace(/\s+/g, "-"),
            undefined,
            product.flavour
          )
        : product.image_url!);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`} title={product.name}>
      <Image
        src={src}
        alt={product.name}
        fill
        quality={90}
        className="object-cover object-center"
        sizes={size === "lg" ? "600px" : size === "sm" ? "100px" : "(max-width: 640px) 45vw, 280px"}
      />
    </div>
  );
}
