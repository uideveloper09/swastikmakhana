import Link from "next/link";
import {
  BRAND,
  categoryUrl,
  NAV_LINKS,
  SHOP_CATEGORIES,
  SHOP_URL,
  UPCOMING_MAKHANA_TYPES,
} from "@/lib/brand";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";

const PRODUCT_LINKS = [
  ...SHOP_CATEGORIES.map((cat) => ({
    label: cat.name,
    href: categoryUrl(cat.path),
  })),
  ...UPCOMING_MAKHANA_TYPES.map((cat) => ({
    label: `${cat.name} (Soon)`,
    href: SHOP_URL,
  })),
];

const LINK_COLUMNS = [
  { title: "Quick Links", links: NAV_LINKS.map((link) => ({ label: link.label, href: link.href })) },
  { title: "Products", links: PRODUCT_LINKS },
] as const;

export function PremiumFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Logo variant="light" showTagline footer />
            <p className="site-footer-desc">{BRAND.description}</p>
            <div className="site-footer-social">
              <SocialLinks />
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title} className="site-footer-col">
              <h4 className="site-footer-heading">{col.title}</h4>
              <ul className="site-footer-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="site-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="site-footer-col site-footer-contact">
            <h4 className="site-footer-heading">Contact</h4>
            <ul className="site-footer-links">
              <li>
                <p className="site-footer-contact-text">{BRAND.address}</p>
              </li>
              <li>
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="site-footer-link">
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="site-footer-link">
                  {BRAND.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-meta">
            <p className="site-footer-copy">
              © 2026 {BRAND.name}. All rights reserved.
            </p>
            <p className="site-footer-credit">
              Digital Experience by{" "}
              <a
                href="https://bitcraftly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-credit-link"
              >
                Bitcraftly
              </a>
            </p>
          </div>

          <nav className="site-footer-legal" aria-label="Legal links">
            <Link href="#" className="site-footer-legal-link">
              Privacy Policy
            </Link>
            <Link href="#" className="site-footer-legal-link">
              Terms of Service
            </Link>
            <Link href="#" className="site-footer-legal-link">
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
