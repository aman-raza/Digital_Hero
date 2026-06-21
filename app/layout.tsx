import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free GST Invoice Calculator | Digital Heroes Trial",
  description:
    "A free online GST invoice calculator built with Next.js and MongoDB for the Digital Heroes developer trial."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
