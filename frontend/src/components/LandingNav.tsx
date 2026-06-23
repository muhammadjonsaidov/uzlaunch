"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/explore",     label: "Explore" },
  { href: "/leaderboard", label: "🏆 Top" },
  { href: "/templates",   label: "Templates" },
  { href: "#pricing",     label: "Pricing", anchor: true },
];

export default function LandingNav() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: scrolled
          ? "rgba(9,9,24,0.92)"
          : "rgba(15,15,35,0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${scrolled ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)"}`,
        boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.5)" : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-10 flex items-center justify-between h-[60px]">

        {/* Logo */}
        <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400 }}>
          <Link href="/" className="logo-text text-[18px] flex items-center gap-2">
            <Image src="/favicon-512.png" width={26} height={26} alt="UZLaunch"
              style={{ borderRadius: 7, flexShrink: 0 }} />
            UZLaunch
          </Link>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(l =>
            l.anchor ? (
              <a key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/6 transition-all font-medium relative group">
                {l.label}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ) : (
              <Link key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/6 transition-all font-medium relative group">
                {l.label}
                <span className="absolute bottom-1 left-4 right-4 h-px bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-white/50 hover:text-white transition-colors font-medium px-3 py-2">
            Log in
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/register" className="btn-primary text-sm" style={{ padding: "9px 22px", borderRadius: 10 }}>
              Get started free
            </Link>
          </motion.div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/register" className="btn-primary text-xs" style={{ padding: "7px 14px", borderRadius: 9 }}>
            Start free
          </Link>
          <motion.button
            onClick={() => setOpen(o => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Menu" whileTap={{ scale: 0.88 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.svg key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </motion.svg>
              ) : (
                <motion.svg key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="px-4 py-3 flex flex-col gap-0.5">
              {[...LINKS, { href: "/login", label: "Log in" }].map((l, i) => (
                <motion.div key={l.href}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  {l.anchor ? (
                    <a href={l.href} onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/6 transition-all font-medium">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/6 transition-all font-medium">
                      {l.label}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
