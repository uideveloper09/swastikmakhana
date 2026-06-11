"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AppBootLoader } from "@/components/AppBootLoader";
import { LiveChat } from "@/components/LiveChat";
import { NavigationLoader } from "@/components/NavigationLoader";
import { ThemeToggle } from "@/components/home/ThemeToggle";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppBootLoader />
            <Suspense fallback={null}>
              <NavigationLoader />
            </Suspense>
            {children}
            <LiveChat />
            <ThemeToggle variant="fixed" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


