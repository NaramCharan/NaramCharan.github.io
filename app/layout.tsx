import type { Metadata } from "next";
import { Space_Grotesk, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Chosen pairing — NOT Inter/Roboto. Space Grotesk (technical display)
// carries headlines; Sora (humanist grotesk) handles body; JetBrains Mono
// is reserved for HUD readouts and code.
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naram Charan — ML & Data Science Engineer",
  description:
    "JARVIS-grade portfolio of Naram Charan: production ML models, recommendation systems, and data engineering. From Iron Man fan to AI obsession.",
  metadataBase: new URL("https://naramcharan.me"),
  openGraph: {
    title: "Naram Charan — ML & Data Science Engineer",
    description: "I teach machines to predict things.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full scanlines selection:text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-cyan focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
