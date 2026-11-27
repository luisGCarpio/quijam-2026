import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BQ360 — Barranquilla 2034",
  description:
    "Plataforma ciudadana inteligente de Barranquilla 2034 y legado post-Mundial: monitoreo de aforo en vivo, rutas alternativas seguras ante arroyos, clima, servicios inclusivos y economía local.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10284B",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-dvh bg-[var(--surface-backdrop)] text-[var(--color-text)] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
