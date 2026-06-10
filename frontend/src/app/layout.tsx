import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UZLaunch — Validate your startup idea",
  description: "Build a waitlist, collect commitment signals, and validate your idea before you build.",
  icons: {
    icon: "/favicon-512.png",
    apple: "/favicon-512.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
