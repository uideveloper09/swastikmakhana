import { TRUST_FEATURES } from "@/lib/brand";

export function TrustFeatures() {
  return (
    <section className="py-5" style={{ background: "var(--primary)" }}>
      <div className="site-container">
        <div className="grid grid-cols-2 gap-px lg:grid-cols-4" style={{ background: "rgba(255,255,255,0.1)" }}>
          {TRUST_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-2"
              style={{ background: "var(--primary)" }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <strong className="block text-sm font-semibold text-white">
                  {feature.title}
                </strong>
                <span className="text-[11px]" style={{ color: "var(--mint)", opacity: 0.7 }}>
                  {feature.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
