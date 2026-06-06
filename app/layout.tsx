import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonDEX",
  description: "A Stellar Testnet carbon credit marketplace built with Soroban and Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
