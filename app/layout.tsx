import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deadhead Club | Off-duty network for airline people",
  description:
    "Base intel, layover knowledge, and honest crew talk built for verified aviation workers.",
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
