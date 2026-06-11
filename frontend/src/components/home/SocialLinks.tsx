import { BRAND } from "@/lib/brand";

const PHONE_WA = BRAND.phone.replace(/\D/g, "");

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 8.5h2.5l-.5 3H14v9h-3.5v-9H9v-3h1.5V7.2c0-1.2.3-2.1 1-2.7.7-.6 1.7-.9 3.1-.9H14v3h-1.6c-.7 0-1 .3-1 .9v1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C17.9 5 12 5 12 5s-5.9 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C6.1 19 12 19 12 19s5.9 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${PHONE_WA}`,
    icon: (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 00-8.7 15l-1.3 4.8 4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1112 20zm4.3-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6 6 0 01-1.8-1.1 6.7 6.7 0 01-1.2-1.5c-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4s.1-.2.1-.3-.1-.6-.2-.8-.5-.7-.7-.7h-.6c-.2 0-.5.1-.7.3s-1 1-1 2.4 1.1 2.8 1.2 2.9a7.2 7.2 0 005.5 2.1c.7 0 1.4-.2 1.9-.5s.9-.9 1-1.1.1-.8-.1-.9z" />
      </svg>
    ),
  },
] as const;

export function SocialLinks() {
  return (
    <div className="mt-5 flex items-center gap-2.5">
      {SOCIAL_LINKS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label={item.label}
          title={item.label}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
