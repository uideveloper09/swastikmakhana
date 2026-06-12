import type { Metadata } from "next";

import { Cormorant_Garamond, DM_Sans } from "next/font/google";

import { AnnouncementBar } from "@/components/home/AnnouncementBar";

import { PremiumFooter } from "@/components/home/PremiumFooter";
import { PremiumHeader } from "@/components/home/PremiumHeader";
import { SiteOverlays } from "@/components/SiteOverlays";

import { Providers } from "@/components/Providers";

import { BRAND } from "@/lib/brand";

import "./globals.css";



const dmSans = DM_Sans({

  subsets: ["latin"],

  variable: "--font-dm-sans",

  weight: ["300", "400", "500", "600", "700"],

});



const cormorant = Cormorant_Garamond({

  subsets: ["latin"],

  variable: "--font-cormorant",

  weight: ["400", "500", "600", "700"],

  style: ["normal", "italic"],

});



export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {

  title: {

    default: `${BRAND.name} — ${BRAND.tagline}`,

    template: `%s | ${BRAND.name}`,

  },

  description: BRAND.description,

};



export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>

      <body className={`${dmSans.variable} ${cormorant.variable} font-sans`}>

        <Providers>

          <div className="site-shell">
            <AnnouncementBar />

            <PremiumHeader />

            <main className="site-main">{children}</main>

            <PremiumFooter />
          </div>

          <SiteOverlays />
        </Providers>

      </body>

    </html>

  );

}


