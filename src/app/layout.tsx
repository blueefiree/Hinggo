import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hinggo — Platform Consignment Komponen & Periferal PC Bekas Teruji",
  description:
    "Jual beli RAM, SSD, dan GPU bekas bergaransi 7 hari. Lolos uji teknis fisik menyeluruh, aman dan transparan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-white text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
