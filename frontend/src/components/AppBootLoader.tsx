"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "./PageLoader";

export function AppBootLoader() {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const hide = () => {
      setHiding(true);
      window.setTimeout(() => setVisible(false), 280);
    };

    if (document.readyState === "complete") {
      const timer = window.setTimeout(hide, 400);
      return () => window.clearTimeout(timer);
    }

    window.addEventListener("load", hide);
    const fallback = window.setTimeout(hide, 1800);

    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`app-boot-loader ${hiding ? "app-boot-loader-hide" : ""}`} aria-hidden="true">
      <PageLoader label="Swastik Makhana" size="lg" />
    </div>
  );
}
