import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custora | Customer management, made clear",
  description: "A focused workspace for managing customer relationships.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}