"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LandingNav from "@/components/LandingNav";
import { motion, useInView, animate } from "framer-motion";

/* ── Stars ── */
function Stars() {
  const [dots, setDots] = useState<{ id: number; l: string; t: string; s: number; delay: string; dur: string }[]>([]);
  useEffect(() => {
    setDots(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      l: `${Math.random() * 100}%`,
      t: `${Math.random() * 100}%`,
      s: Math.random() * 2 + 0.4,
      delay: `${(Math.random() * 7).toFixed(1)}s`,
      dur: `${(Math.random() * 4 + 2).toFixed(1)}s`,
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {dots.map(d => (
        <div key={d.id} className="absolute rounded-full bg-white"
          style={{ left: d.l, top: d.t, width: d.s, height: d.s,
            animation: `star-twinkle ${d.dur} ${d.delay} ease-in-out infinite` }} />
      ))}
    </div>
  );
}

/* ── Floating 3D geometric shapes ── */
const SHAPES = [
  { x: "6%",  y: "12%", sz: 52, dur: 8,  dly: 0,   type: "tri",  color: "rgba(99,102,241,0.35)" },
  { x: "87%", y: "10%", sz: 44, dur: 10, dly: 1,   type: "hex",  color: "rgba(139,92,246,0.3)"  },
  { x: "3%",  y: "62%", sz: 38, dur: 7,  dly: 2,   type: "tri",  color: "rgba(99,102,241,0.28)" },
  { x: "91%", y: "55%", sz: 50, dur: 9,  dly: 0.5, type: "hex",  color: "rgba(59,130,246,0.28)" },
  { x: "48%", y: "5%",  sz: 32, dur: 11, dly: 1.5, type: "tri",  color: "rgba(139,92,246,0.25)" },
  { x: "20%", y: "82%", sz: 42, dur: 8,  dly: 3,   type: "hex",  color: "rgba(99,102,241,0.22)" },
  { x: "78%", y: "78%", sz: 36, dur: 9,  dly: 2.5, type: "tri",  color: "rgba(139,92,246,0.2)"  },
];

function FloatingShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {SHAPES.map((s, i) => (
        <motion.div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.sz, height: s.sz }}
          animate={{ rotate: [0, 360], y: [0, -16, 0] }}
          transition={{
            rotate: { duration: s.dur * 2.5, repeat: Infinity, ease: "linear" },
            y: { duration: s.dur * 0.7, repeat: Infinity, ease: "easeInOut", delay: s.dly },
          }}>
          {s.type === "tri" ? (
            <svg viewBox="0 0 100 87" fill="none" stroke={s.color} strokeWidth="1.5">
              <polygon points="50,2 98,85 2,85" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 116" fill="none" stroke={s.color} strokeWidth="1.5">
              <polygon points="50,2 98,26 98,74 50,98 2,74 2,26" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Count-up ── */
function AnimCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: v => setN(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ── Scroll reveal ── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

/* ── Section pill label ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
      style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)" }}>
      {children}
    </span>
  );
}

/* ── Mouse-parallax hero content ── */
function ParallaxHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    setTilt({ x: dy * -3.5, y: dx * 3.5 });
  }
  function onLeave() { setTilt({ x: 0, y: 0 }); }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.12s ease-out",
        willChange: "transform",
      }}>
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: "🚀", title: "Launch in 2 minutes", desc: "Fill in your project name, tagline, and description. Your public waitlist page is live immediately.", c: "rgba(99,102,241," },
  { icon: "📊", title: "Validation score", desc: "0–100 score based on subscriber volume, commitment level, and growth momentum.", c: "rgba(139,92,246," },
  { icon: "📧", title: "Collect real subscribers", desc: "Beautiful signup form with email validation. Every subscriber gets a confirmation email instantly.", c: "rgba(59,130,246," },
];

const STEPS = [
  { n: "1", title: "Create your page", desc: "Register and fill in project details — name, tagline, description, and expected launch date." },
  { n: "2", title: "Share the link", desc: "Post your /p/your-project link on Telegram, social media, anywhere your audience hangs." },
  { n: "3", title: "Launch with confidence", desc: "Export your subscriber list and send the launch email to people already waiting." },
];

export default function Landing() {
  return (
    <main style={{ background: "linear-gradient(135deg,#0a0a1a 0%,#160d35 45%,#0a1428 100%)" }}
      className="text-white overflow-x-hidden relative">

      <Stars />
      <LandingNav />

      {/* ══════════ HERO ══════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-5 text-center overflow-hidden">

        {/* 3D moving grid floor */}
        <div className="grid-3d-wrapper">
          <div className="grid-3d-floor" />
        </div>

        {/* Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Floating geometric shapes */}
        <FloatingShapes />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(10,10,26,0.7) 100%)" }} />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto w-full py-24 md:py-32">
          <ParallaxHero>
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-7"
              style={{ background: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.32)", color: "#a5b4fc" }}>
              <motion.span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
              Free to start · No credit card needed
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.09] tracking-tight mb-5"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              Launch your{" "}
              <span className="gradient-text">startup idea</span>
              <br />
              <span style={{ color: "rgba(255,255,255,0.72)" }}>
                before writing a line of code
              </span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-9 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}>
              Create a beautiful pre-launch waitlist page in 2 minutes. Collect emails, validate your idea, and build with confidence.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register" className="btn-primary inline-flex items-center gap-2"
                  style={{ padding: "14px 38px", fontSize: 15, animation: "glow-pulse 2.5s ease-in-out infinite" }}>
                  Create your waitlist free
                  <motion.svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </motion.svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/explore" className="btn-glass inline-flex items-center gap-1.5 text-sm"
                  style={{ padding: "13px 22px" }}>
                  Explore waitlists
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/32"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              {["✓ Free forever", "✓ 2-minute setup", "✓ No design skills needed"].map((t, i) => (
                <motion.span key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}>{t}</motion.span>
              ))}
            </motion.div>
          </ParallaxHero>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)" }} />
      </section>

      {/* ══════════ STATS ══════════ */}
      <div className="relative z-10 px-5 py-12">
        <Reveal>
          <div className="max-w-3xl mx-auto glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3">
              {[
                { raw: null, n: 100, suf: "+", label: "Uzbek founders", sub: "using UZLaunch" },
                { raw: null, n: 2,   suf: " min", label: "Average setup", sub: "time per page" },
                { raw: "$0", n: 0,   suf: "",  label: "To get started", sub: "free with 100 subs" },
              ].map((s, i) => (
                <div key={i} className="text-center px-4 py-6 relative">
                  {i > 0 && (
                    <div className="absolute left-0 top-4 bottom-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  )}
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-0.5">
                    {s.raw ?? <AnimCounter to={s.n} suffix={s.suf} />}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-white/55 mb-0.5 truncate px-1">{s.label}</div>
                  <div className="text-[11px] text-white/28 hidden sm:block">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" className="px-5 pb-20 max-w-5xl mx-auto relative z-10">
        <Reveal className="text-center mb-12">
          <Label>Features</Label>
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
            Everything to validate your idea
          </h2>
          <p className="text-white/40 text-sm md:text-base">Built for Uzbek founders who move fast</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="feature-card"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <div className="icon-box" style={{ background: `${f.c}0.12)`, border: `1px solid ${f.c}0.26)` }}>
                <motion.span whileHover={{ scale: 1.25, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  {f.icon}
                </motion.span>
              </div>
              <h3 className="text-base font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="px-5 pb-20 max-w-4xl mx-auto relative z-10">
        <div className="h-px mb-16"
          style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)" }} />
        <Reveal className="text-center mb-12">
          <Label>How it works</Label>
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
            Three steps to validate your startup
          </h2>
          <p className="text-white/40 text-sm md:text-base">Simple enough to launch before your morning tea</p>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-4 relative">
          <motion.div className="hidden sm:block absolute top-6 left-[22%] right-[22%] h-px"
            style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.1),rgba(99,102,241,0.4),rgba(99,102,241,0.1))" }}
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }} />

          {STEPS.map((s, i) => (
            <motion.div key={s.n} className="step-card"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}>
              <motion.div style={{
                width: 48, height: 48,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, color: "#fff",
                margin: "0 auto 14px",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
                animate={{ boxShadow: ["0 4px 20px rgba(99,102,241,0.35)","0 4px 36px rgba(99,102,241,0.75)","0 4px 20px rgba(99,102,241,0.35)"] }}
                transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
                whileHover={{ scale: 1.15 }}>
                {s.n}
              </motion.div>
              <h3 className="text-sm font-bold mb-1.5 text-white">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="pricing" className="px-5 pb-20 max-w-5xl mx-auto relative z-10">
        <div className="h-px mb-16"
          style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)" }} />
        <Reveal className="text-center mb-12">
          <Label>Pricing</Label>
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Simple, honest pricing</h2>
          <p className="text-white/40 text-sm md:text-base">Start free. Upgrade when you&apos;re ready to scale.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 items-start">

          {/* Free */}
          <Reveal delay={0}>
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.22 }}
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="text-xs font-bold text-white/35 uppercase tracking-widest mb-4">Free</div>
              <div className="text-4xl font-black mb-0.5">$0</div>
              <div className="text-xs text-white/28 mb-6">forever</div>
              <ul className="space-y-2 mb-6">
                {["Up to 100 subscribers","1 waitlist page","Custom slug","Countdown timer","Basic analytics"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-white/50">
                    <span className="text-indigo-400 font-bold text-xs flex-shrink-0">✓</span>{t}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-glass w-full text-center block text-sm">Get started free</Link>
            </motion.div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={0.1} className="sm:col-span-2 md:col-span-1 md:-mt-5">
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.22 }}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "linear-gradient(155deg,rgba(99,102,241,0.18),rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.5)",
                boxShadow: "0 0 50px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}>
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.9),rgba(139,92,246,0.9),transparent)" }} />
              {/* Inner radial glow */}
              <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Pro</span>
                  <motion.span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(251,191,36,0.14)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
                    animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>
                    ✦ Popular
                  </motion.span>
                </div>
                <div className="text-4xl font-black mb-0.5">$5</div>
                <div className="text-xs text-white/28 mb-6">per month</div>
                <ul className="space-y-2 mb-6">
                  {["Unlimited subscribers","Multiple waitlist pages","CSV export","Email notifications","Advanced analytics","Priority support"].map(t => (
                    <li key={t} className="flex items-center gap-2 text-sm text-white/65">
                      <span className="text-indigo-300 font-bold text-xs flex-shrink-0">✓</span>{t}
                    </li>
                  ))}
                </ul>
                <motion.a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full text-center block text-sm" style={{ padding: "12px" }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  Upgrade to Pro
                </motion.a>
              </div>
            </motion.div>
          </Reveal>

          {/* Team */}
          <Reveal delay={0.2}>
            <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.22 }}
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="text-xs font-bold text-white/35 uppercase tracking-widest mb-4">Team</div>
              <div className="text-4xl font-black mb-0.5">$20</div>
              <div className="text-xs text-white/28 mb-6">per month</div>
              <ul className="space-y-2 mb-6">
                {[
                  { t: "Everything in Pro", s: false },
                  { t: "Team members access", s: false },
                  { t: "Custom domain", s: true },
                  { t: "White-label pages", s: true },
                  { t: "API access", s: true },
                ].map(item => (
                  <li key={item.t} className="flex items-center gap-2 text-sm text-white/50">
                    <span className="text-indigo-400 font-bold text-xs flex-shrink-0">✓</span>
                    {item.t}
                    {item.s && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold ml-auto flex-shrink-0">Soon</span>}
                  </li>
                ))}
              </ul>
              <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
                className="btn-glass w-full text-center block text-sm">Contact us</a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <div className="px-5 pb-20 relative z-10">
        <Reveal>
          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,#4338ca 0%,#6d28d9 55%,#4f46e5 100%)" }}>
            <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />
            <div className="shimmer-banner" />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.07)", filter: "blur(50px)" }} />
            <div className="relative z-10 px-6 sm:px-12 py-12 sm:py-16 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight">
                Ready to validate your idea?
              </h2>
              <p className="text-white/65 mb-8 text-sm md:text-base max-w-md mx-auto">
                Join 100+ Uzbek founders who launched their waitlist — in under 2 minutes
              </p>
              <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-sm hover:shadow-2xl transition-shadow">
                  Create your page — it&apos;s free
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="px-5 py-10 text-center relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mb-5">
          <Link href="/" className="logo-text text-lg inline-flex">
            <Image src="/favicon-512.png" width={20} height={20} alt="" style={{ borderRadius: 5 }} />
            UZLaunch
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-5">
          {["Explore:/explore","Leaderboard:/leaderboard","Templates:/templates","About:/about","Help:/help","Terms:/terms","Privacy:/privacy"].map(l => {
            const [label, href] = l.split(":");
            return <Link key={href} href={href} className="text-xs text-white/28 hover:text-white/55 transition-colors">{label}</Link>;
          })}
          <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
            className="text-xs text-white/28 hover:text-white/55 transition-colors">Support</a>
        </div>
        <p className="text-xs text-white/18">© 2026 UZLaunch. Built for Uzbek founders.</p>
      </footer>
    </main>
  );
}
