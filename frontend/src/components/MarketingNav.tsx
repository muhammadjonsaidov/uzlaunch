"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12 border-b border-white/5">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
        <Link href="/" className="logo-text text-xl">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>

        <div className="hidden md:flex items-center gap-6 mr-6">
          <Link href="/explore" className="text-sm text-white/50 hover:text-white transition-colors font-medium">Explore</Link>
          <Link href="/leaderboard" className="text-sm text-white/50 hover:text-white transition-colors font-medium">🏆 Top</Link>
          <Link href="/templates" className="text-sm text-white/50 hover:text-white transition-colors font-medium">Templates</Link>
          <Link href="/help" className="text-sm text-white/50 hover:text-white transition-colors font-medium">Help</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/60 hover:text-white font-medium">Log in</Link>
          <Link href="/register" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Get started free</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white/70 hover:text-white p-2" aria-label="Menu">
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-white/5 py-3 max-w-6xl mx-auto">
          <div className="flex flex-col gap-1">
            {[
              { href: "/explore", label: "Explore" },
              { href: "/leaderboard", label: "🏆 Top" },
              { href: "/templates", label: "Templates" },
              { href: "/help", label: "Help" },
              { href: "/login", label: "Log in" },
            ].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white">
                {l.label}
              </Link>
            ))}
            <Link href="/register" onClick={() => setOpen(false)}
              className="btn-primary text-sm text-center mt-2" style={{ padding: "10px" }}>
              Get started free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
