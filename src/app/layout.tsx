import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Indie Movie Calendar",
  description: "Independent theater showtimes for Roxie, Balboa, Vogue, and 4-Star theaters in San Francisco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
