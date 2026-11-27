import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BQ360 — Barranquilla 2034",
  description:
    "Plataforma ciudadana inteligente de Barranquilla 2034 y legado post-Mundial: monitoreo de aforo en vivo, rutas alternativas seguras ante arroyos, clima, servicios inclusivos y economía local.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2545",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-slate-100 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
