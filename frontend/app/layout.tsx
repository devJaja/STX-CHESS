import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stack Chess - Chess on Bitcoin",
  description: "Decentralized chess game on Stacks blockchain",
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
