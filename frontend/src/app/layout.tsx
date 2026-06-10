import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UZLaunch — Validate your startup idea",
  description: "Build a waitlist, collect commitment signals, and validate your idea before you build.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
