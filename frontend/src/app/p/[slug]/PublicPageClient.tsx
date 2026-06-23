"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { publicApi, Project } from "@/lib/api";

const COMMITMENT_OPTIONS = [
  { value: "WOULD_USE", label: "I'd use it" },
  { value: "WOULD_PAY", label: "I'd pay for it" },
  { value: "PAY_NOW",   label: "Pay now" },
];

/* ── Confetti burst ── */
function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      color: ["#6366f1","#8b5cf6","#ec4899","#3b82f6","#10b981","#f59e0b","#a5b4fc","#c4b5fd"][i % 8],
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.8,
      dur: Math.random() * 1.5 + 1.5,
      size: Math.random() * 8 + 4,
      rot: Math.random() * 720 - 360,
      isCircle: Math.random() > 0.5,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: -16,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : 2,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scaleX: 1 }}
          animate={{ y: "105vh", opacity: [1, 1, 0], rotate: p.rot, scaleX: [1, 0.5, 1, 0.5] }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/* ── Flip digit for countdown ── */
function FlipDigit({ value, label }: { value: number; label: string }) {
  const prev = useRef(value);
  const changed = prev.current !== value;
  useEffect(() => { prev.current = value; }, [value]);

  return (
    <div className="flex-1 text-center rounded-xl py-2.5 relative overflow-hidden"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={changed ? { rotateX: 90, opacity: 0 } : false}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "center", perspective: 400 }}
          className="text-xl font-black text-white leading-none tabular-nums"
        >
          {String(value).padStart(2, "0")}
        </motion.div>
      </AnimatePresence>
      <div className="text-xs text-white/40 uppercase mt-1">{label}</div>
    </div>
  );
}

export default function PublicPageClient({ project: initial }: { project: Project }) {
  const [subCount, setSubCount] = useState(initial.subscriberCount);
  const [commitment, setCommitment] = useState("WOULD_USE");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "info" | "error">("idle");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [launched, setLaunched] = useState(false);
  const [refCode, setRefCode] = useState<string | undefined>(undefined);
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string }>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const formStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const r = sp.get("ref");
    if (r) setRefCode(r);
    const source = sp.get("utm_source") ?? undefined;
    setUtm({ source, medium: sp.get("utm_medium") ?? undefined, campaign: sp.get("utm_campaign") ?? undefined });
    publicApi.track(initial.slug, "view", source);
  }, [initial.slug]);

  function handleFormStart() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    publicApi.track(initial.slug, "form_start", utm.source);
  }

  // SSE live count
  useEffect(() => {
    const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/api/public/projects/${initial.slug}/stream`);
    es.onmessage = (e) => { const n = parseInt(e.data); if (!isNaN(n)) setSubCount(n); };
    return () => es.close();
  }, [initial.slug]);

  // Countdown
  useEffect(() => {
    if (!initial.launchAt) return;
    const target = new Date(initial.launchAt).getTime();
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { setLaunched(true); setCountdown(null); return; }
      const s = Math.floor(diff / 1000);
      setCountdown({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [initial.launchAt]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await publicApi.subscribe(initial.slug, {
        email, name: name || undefined, commitment,
        feedbackAnswer: feedback || undefined,
        ref: refCode, utmSource: utm.source, utmMedium: utm.medium, utmCampaign: utm.campaign,
      });
      setMessage(res.message);
      setStatus("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const isDuplicate = msg.includes("Already subscribed") || msg.includes("Confirmation email");
      setMessage(isDuplicate ? "You're already on the list! Check your inbox for the confirmation email." : msg);
      setStatus(isDuplicate ? "info" : "error");
    }
  }

  const accent = initial.accentColor && /^#[0-9a-fA-F]{6}$/.test(initial.accentColor) ? initial.accentColor : null;
  const accentRgba = (a: number) => {
    if (!accent) return `rgba(99,102,241,${a})`;
    const h = accent.slice(1);
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
  };
  const avatarBg = accent ? accent : "linear-gradient(135deg,#6366f1,#8b5cf6)";
  const buttonBg = accent ? accent : "linear-gradient(135deg,#6366f1,#8b5cf6)";
  const glowRgba = accentRgba(0.4);

  return (
    <main className="min-h-screen page-bg flex flex-col items-center justify-center px-4 py-8" style={{ overflow: "hidden" }}>
      {showConfetti && <Confetti />}

      {/* Background orbs */}
      <div className="orb orb-1" style={{ opacity: 0.15 }} />
      <div className="orb orb-2" style={{ opacity: 0.12 }} />

      <motion.div
        className="w-full max-w-sm flex flex-col gap-3 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Avatar + title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 220, damping: 14 }}
          >
            {initial.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={initial.logoUrl} alt={initial.name}
                className="w-14 h-14 rounded-xl object-cover mx-auto mb-3"
                style={{ boxShadow: `0 6px 24px ${glowRgba}` }} />
            ) : (
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white mx-auto mb-3"
                style={{ background: avatarBg, boxShadow: `0 6px 24px ${glowRgba}` }}
                animate={{ boxShadow: [`0 6px 24px ${accentRgba(0.4)}`, `0 6px 40px ${accentRgba(0.7)}`, `0 6px 24px ${accentRgba(0.4)}`] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {initial.name[0].toUpperCase()}
              </motion.div>
            )}
          </motion.div>

          <motion.h1
            className="text-3xl font-black text-white tracking-tight leading-tight mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            {initial.name}
          </motion.h1>
          <motion.p
            className="text-sm text-white/60 leading-snug"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {initial.tagline}
          </motion.p>
          {initial.description && (
            <motion.p
              className="text-sm text-white/45 leading-relaxed mt-2 max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {initial.description}
            </motion.p>
          )}
        </div>

        {/* Countdown */}
        {initial.launchAt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            {launched ? (
              <div className="text-center py-3">
                <motion.div
                  className="text-4xl mb-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                >
                  🚀
                </motion.div>
                <p className="text-lg font-black text-white">We&apos;re live!</p>
                <p className="text-sm text-white/50 mt-0.5">Check your email for the launch announcement</p>
              </div>
            ) : countdown ? (
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest text-center mb-2">Launching in</p>
                <div className="flex items-center gap-1.5">
                  <FlipDigit value={countdown.d} label="Days" />
                  <FlipDigit value={countdown.h} label="Hrs" />
                  <FlipDigit value={countdown.m} label="Min" />
                  <FlipDigit value={countdown.s} label="Sec" />
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Subscribe card */}
        <motion.div
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                className="text-center py-2"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: 20 }}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
              >
                <motion.div
                  className="text-3xl mb-2"
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  🎉
                </motion.div>
                <p className="text-emerald-300 font-semibold text-sm">{message}</p>
              </motion.div>
            ) : (
              <motion.div key="form">
                <p className="text-xs font-semibold text-white/50 text-center mb-3">Join the waitlist — be first to know</p>
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input className="glass-input" type="text" placeholder="Your name (optional)" value={name}
                    onChange={e => setName(e.target.value)} autoComplete="name" />
                  <input className="glass-input" type="email" placeholder="Your email address" required value={email}
                    onChange={e => setEmail(e.target.value)} onFocus={handleFormStart} autoComplete="email" />

                  <div className="flex gap-2 mt-1">
                    {COMMITMENT_OPTIONS.map(opt => (
                      <label key={opt.value}
                        className="flex-1 flex items-center gap-1.5 cursor-pointer rounded-xl px-3 py-2.5 transition-colors"
                        style={{
                          border: `1px solid ${commitment === opt.value ? accentRgba(0.6) : "rgba(255,255,255,0.15)"}`,
                          background: commitment === opt.value ? accentRgba(0.1) : "transparent",
                        }}>
                        <input type="radio" name="commitment" value={opt.value} checked={commitment === opt.value}
                          onChange={() => setCommitment(opt.value)} className="sr-only" />
                        <span className="text-xs text-white/70">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {initial.feedbackQuestion && (
                    <textarea className="glass-input" rows={2} placeholder={initial.feedbackQuestion} maxLength={1000}
                      value={feedback} onChange={e => setFeedback(e.target.value)} style={{ resize: "none" }} />
                  )}

                  {status === "info" && (
                    <div className="text-xs text-sky-300 text-center py-2 px-3 rounded-xl"
                      style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" }}>
                      {message}
                    </div>
                  )}
                  {status === "error" && <p className="text-xs text-red-400">{message}</p>}

                  <motion.button
                    type="submit" disabled={status === "loading"}
                    className="w-full text-center font-bold text-sm text-white py-3 rounded-xl disabled:opacity-60"
                    style={{ background: buttonBg, boxShadow: `0 4px 20px ${glowRgba}` }}
                    whileHover={status !== "loading" ? { scale: 1.02, boxShadow: `0 6px 32px ${accentRgba(0.6)}` } : {}}
                    whileTap={status !== "loading" ? { scale: 0.97 } : {}}
                  >
                    {status === "loading" ? (
                      <span className="inline-flex items-center gap-2 justify-center">
                        <motion.span
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        />
                        Sending…
                      </span>
                    ) : "Notify me at launch →"}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subscriber count */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            animate={showConfetti ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              className="font-black text-white"
              key={subCount}
              initial={{ scale: 1.3, color: "#a5b4fc" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.4 }}
            >
              {subCount}
            </motion.span>
            <span className="text-white/50">people already waiting</span>
            {initial.validationScore > 0 && <>
              <span className="text-white/20">·</span>
              <span className="font-black text-emerald-400">{initial.validationScore}</span>
              <span className="text-white/50">score</span>
            </>}
          </motion.div>
        </motion.div>

        {/* Powered by */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors">
            ⚡ Powered by <span className="font-bold text-indigo-400">UZLaunch</span>
          </a>
        </div>
      </motion.div>
    </main>
  );
}
