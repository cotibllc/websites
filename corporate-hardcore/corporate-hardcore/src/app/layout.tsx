import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import NavBar from "@/components/NavBar";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.corphardcore.com"),
  title: {
    default: "Corporate Hardcore | Circle Back. Never Return.",
    template: "%s | Corporate Hardcore",
  },
  description:
    "Observational satire documenting corporate dysfunction. By Chuck Morrison, IT Manager, 18 years at the same company.",
  openGraph: {
    title: "Corporate Hardcore",
    description: "Observational satire documenting corporate dysfunction.",
    type: "website",
    url: "https://www.corphardcore.com",
    siteName: "Corporate Hardcore",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Corporate Hardcore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Hardcore",
    description: "Observational satire documenting corporate dysfunction.",
    creator: "@corphardcore",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased bg-synergy-white text-synergy-dark min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Corporate Hardcore",
              url: "https://www.corphardcore.com",
              description: "Observational satire documenting corporate dysfunction.",
              sameAs: [
                "https://www.youtube.com/@corphardcore",
                "https://www.instagram.com/corphardcore/",
                "https://www.tiktok.com/@corphardcore",
                "https://x.com/corphardcore",
              ],
            }),
          }}
        />
        <NavBar />
        <Ticker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
