import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supplier Portal | autoSecure Mobility",
  description: "Manage your listings, inquiries, and account on autoSecure Mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full overflow-x-hidden bg-portal-surface font-sans">
        {children}
      </body>
    </html>
  );
}
