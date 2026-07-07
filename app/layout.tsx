import type { Metadata } from "next";
import { Space_Grotesk, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile, contact, education } from "@/lib/content";

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
    url: "https://naramcharan.me",
  },
  // og/twitter images come from the app/opengraph-image.png file convention.
  twitter: {
    card: "summary_large_image",
  },
};

// Person schema so Google can attach name/role/profiles to search results.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.fullName,
  url: contact.site,
  email: `mailto:${contact.email}`,
  jobTitle: profile.role,
  sameAs: [contact.github, contact.linkedin],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: education.school,
  },
  knowsAbout: [
    "Machine Learning",
    "Deep Learning",
    "Recommender Systems",
    "Data Engineering",
    "PyTorch",
    "XGBoost",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gurugram",
    addressCountry: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh scanlines selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
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
