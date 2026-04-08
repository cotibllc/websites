import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import Footer from "@/components/Footer";

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
  description: "Observational satire documenting corporate dysfunction. By Chuck Morrison, 50-year-old IT Manager.",
  openGraph: {
    title: "Corporate Hardcore",
    description: "Observational satire documenting corporate dysfunction.",
    type: "website",
    url: "https://www.corphardcore.com",
    siteName: "Corporate Hardcore",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Corporate Hardcore — Observational satire for the corporate lifer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Hardcore",
    description: "Observational satire documenting corporate dysfunction.",
    creator: "@corphardcore",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
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
                "https://twitter.com/corphardcore",
              ],
            }),
          }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}