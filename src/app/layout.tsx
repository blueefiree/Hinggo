import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

import { Suspense } from "react";
import { HingoProvider } from "@/lib/store";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hingo — Titip Jual Gear, Kami yang Urus",
  description:
    "Marketplace konsinyasi terkelola untuk peripheral komputer preloved. Pengecekan fisik, penyimpanan aman, pemasaran media sosial, dan pembayaran rekening bersama (escrow).",
  keywords: "preloved keyboard, mechanical keyboard, mouse preloved, gaming headset, konsinyasi gear, Hingo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-[#1A1A1A] antialiased selection:bg-[#FFC629] selection:text-black">
        <HingoProvider>
          <Suspense fallback={<div className="h-16 border-b border-neutral-100 bg-white" />}>
            <Navbar />
          </Suspense>
          <Suspense fallback={<div className="min-h-[50vh] p-8 text-center text-xs text-neutral-400">Memuat konten Hingo...</div>}>
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
          </Suspense>
          <Footer />
          <Suspense fallback={null}>
            <MobileBottomNav />
          </Suspense>
        </HingoProvider>
      </body>
    </html>
  );
}
