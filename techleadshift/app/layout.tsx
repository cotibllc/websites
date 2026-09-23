import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const dmSerifDisplay = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tech Lead Shift — Manage the machine, not the sentiment",
  description:
    "Manage the machine, not the sentiment. A research series on Silicon Labor — leading hybrid teams of humans and AI agents, culture, and accountability.",
  metadataBase: new URL("https://www.techleadshift.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tech Lead Shift — Manage the machine, not the sentiment",
    description:
      "Manage the machine, not the sentiment. A research series on Silicon Labor — leading hybrid teams of humans and AI agents, culture, and accountability.",
    siteName: "Tech Lead Shift",
    type: "website",
    url: "https://www.techleadshift.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Tech Lead Shift",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Lead Shift — Manage the machine, not the sentiment",
    description:
      "Manage the machine, not the sentiment. A research series on Silicon Labor — leading hybrid teams of humans and AI agents, culture, and accountability.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
