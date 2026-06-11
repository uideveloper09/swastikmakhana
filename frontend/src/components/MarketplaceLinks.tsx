import { MARKETPLACES } from "@/lib/brand";

interface MarketplaceLinksProps {
  className?: string;
  linkClassName?: string;
}

export function MarketplaceLinks({
  className = "",
  linkClassName = "font-medium text-primary underline-offset-2 hover:underline",
}: MarketplaceLinksProps) {
  return (
    <span className={className}>
      {MARKETPLACES.map((store, index) => (
        <span key={store.name}>
          {index > 0 && (index === MARKETPLACES.length - 1 ? " & " : ", ")}
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {store.name}
          </a>
        </span>
      ))}
    </span>
  );
}
