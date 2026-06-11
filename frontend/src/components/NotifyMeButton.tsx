"use client";

import { useState } from "react";
import { NotifyMeModal } from "./NotifyMeModal";

interface NotifyMeButtonProps {
  categorySlug: string;
  categoryName: string;
}

export function NotifyMeButton({ categorySlug, categoryName }: NotifyMeButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="makhana-type-card-cta makhana-type-card-cta-notify"
        aria-label={`Notify me when ${categoryName} launches`}
      >
        Notify Me
      </button>
      <NotifyMeModal
        open={open}
        onClose={() => setOpen(false)}
        categorySlug={categorySlug}
        categoryName={categoryName}
      />
    </>
  );
}
