import type { Metadata } from "next";
import { Inter, Outfit, Poppins, Bricolage_Grotesque } from "next/font/google";
import { Suspense } from 'react';
import LayoutWrapper from "../components/LayoutWrapper";
import SplashOverlay from "../components/SplashOverlay";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VedaAi - AI Assessment Creator",
  description: "Create and customize exam question papers in seconds using advanced AI grounding models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${poppins.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-warm dark:bg-slate-950 dark:text-slate-100 font-bricolage transition-colors duration-300">
        <Suspense fallback={null}>
          <SplashOverlay />
          <LayoutWrapper>{children}</LayoutWrapper>
        </Suspense>
      </body>
    </html>
  );
}
