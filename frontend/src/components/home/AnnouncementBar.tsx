import { ANNOUNCEMENTS } from "@/lib/brand";

export function AnnouncementBar() {
  return (
    <div
      className="text-center text-xs font-medium tracking-wider sm:text-sm"
      style={{ background: "var(--primary)", color: "var(--mint)" }}
    >
      <div className="site-container flex flex-wrap items-center justify-center gap-x-1 gap-y-1 py-2">
        🌿{" "}
        {ANNOUNCEMENTS.map((item, i) => (
          <span key={item}>
            {i > 0 && <b className="mx-1.5 text-white">|</b>}
            {item === "SWASTIK10" ? (
              <>
                Code <b className="text-white">SWASTIK10</b> — 10% off
              </>
            ) : (
              item
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
