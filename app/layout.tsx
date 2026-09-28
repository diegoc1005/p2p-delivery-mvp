import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NODO — Delivery Descentralizado",
  description: "Protocolo P2P de logística impulsado por Agentes IA y Smart Contracts. Cero comisiones para restaurantes y repartidores.",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  openGraph: {
    title: "NODO Protocol — Delivery Descentralizado",
    description: "Olvídate del 30% de comisión. NODO usa IA y blockchain para un delivery justo.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NODO Protocol",
    description: "Delivery descentralizado. Cero comisiones. Impulsado por IA.",
    images: ["/og-image.jpg"],
  },
};

import '@pollar/react/styles.css';
import { PollarProviderWrapper } from "./context/PollarProviderWrapper";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PollarProviderWrapper>
          <AuthProvider>{children}</AuthProvider>
        </PollarProviderWrapper>
      </body>
    </html>
  );
}
