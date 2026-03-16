import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Corporate Hardcore | Circle Back. Never Return.",
  description: "Observational satire documenting corporate dysfunction. By Chuck Morrison, 50-year-old IT Manager.",
  openGraph: {
    title: "Corporate Hardcore",
    description: "Observational satire documenting corporate dysfunction.",
    type: "website",
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
        {children}
        <Footer />
      </body>
    </html>
  );
}