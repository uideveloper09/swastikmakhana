import type { ReactNode } from "react";

interface SectionHeaderProps {
  label: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  extra?: ReactNode;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "center",
  extra,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      <p className="section-label">{label}</p>
      <h2 className={`section-heading mt-2 ${centered ? "" : "max-w-lg"}`}>{title}</h2>
      <div className={`section-divider ${centered ? "" : "!mx-0 !max-w-none !justify-start"}`}>
        <span>✦</span>
      </div>
      {subtitle && (
        <p className={`section-subheading ${centered ? "" : "!mx-0 !text-left"}`}>
          {subtitle}
        </p>
      )}
      {extra}
    </div>
  );
}
