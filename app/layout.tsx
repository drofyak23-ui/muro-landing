import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MURO — On-chain market intelligence",
  description: "Coming soon.",
  metadataBase: new URL("https://murointel.com"),
  openGraph: {
    title: "MURO",
    description: "On-chain market intelligence. Coming soon.",
    url: "https://murointel.com",
    siteName: "MURO",
    images: [
      {
        url: "/muro-logo.svg",
        width: 400,
        height: 400,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MURO",
    description: "On-chain market intelligence. Coming soon.",
    images: ["/muro-logo.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">{children}</body>
    </html>
  );
}