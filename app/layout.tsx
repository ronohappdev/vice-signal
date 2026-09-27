import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-deployed-domain.vercel.app"), // ← replace after deploying
  title: "VICE SIGNAL — Broadcast the City",
  description:
    "A fictional underground street-media experience powered by the Unlayer Image Editor.",
  keywords: [
    "Vice Signal",
    "Unlayer",
    "Image Editor",
    "GTA VI",
    "street race",
    "interactive experience",
  ],
  openGraph: {
    title: "VICE SIGNAL — Broadcast the City",
    description:
      "Accept the job. Customize the signal. Watch it go live on the billboard.",
    url: "/",
    siteName: "Vice Signal",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VICE SIGNAL — Broadcast the City",
    description:
      "Accept the job. Customize the signal. Watch it go live on the billboard.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#050505]"
      >
        {children}
      </body>
    </html>
  );
}
