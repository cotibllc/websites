import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexSansCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-ibm-plex-condensed",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "The IT XP",
    template: "%s | The IT XP",
  },
  description:
    "A podcast for IT professionals — pulling back the curtain on what it's really like to work in Information Technology.",
  metadataBase: new URL("https://www.theitxp.com"),
  openGraph: {
    siteName: "The IT XP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${ibmPlexSans.variable} ${ibmPlexSansCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans min-h-full flex flex-col bg-navy text-white">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
