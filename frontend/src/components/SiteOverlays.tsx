"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LiveChat } from "@/components/LiveChat";
import { ThemeToggle } from "@/components/home/ThemeToggle";

export function SiteOverlays() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <LiveChat />
      <ThemeToggle variant="fixed" />
    </>,
    document.body,
  );
}
