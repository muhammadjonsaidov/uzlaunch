"use client";

import { useState, useEffect, useRef } from "react";
import { publicApi, Project } from "@/lib/api";

const COMMITMENT_OPTIONS = [
  { value: "WOULD_USE", label: "I'd use it" },
  { value: "WOULD_PAY", label: "I'd pay for it" },
  { value: "PAY_NOW",   label: "Pay now" },
];

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
      setCountdown({ d: Math.floor(s/86400), h: Math.floor((s%86400)/3600), m: Math.floor((s%3600)/60), s: s%60 });
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
      });
      setMessage(res.message);
      setStatus("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const isDuplicate = msg.includes("Already subscribed") || msg.includes("Confirmation email");
      setMessage(isDuplicate ? "You're already on the list! Check your inbox for the confirmation email." : msg);
      setStatus(isDuplicate ? "info" : "error");
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="min-h-screen page-bg flex flex-col items-center justify-center px-4 py-8" style={{ overflow: "hidden" }}>
      <div className="w-full max-w-sm flex flex-col gap-3 relative z-10">

        {/* Avatar + title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white mx-auto mb-3"
               style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 6px 24px rgba(99,102,241,0.4)" }}>
            {initial.name[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-1">{initial.name}</h1>
          <p className="text-sm text-white/60 leading-snug">{initial.tagline}</p>
          {initial.description && (
            <p className="text-sm text-white/45 leading-relaxed mt-2 max-w-xs mx-auto">{initial.description}</p>
          )}
        </div>

        {/* Countdown */}
        {initial.launchAt && (
          <div>
            {launched ? (
              <div className="text-center py-3">
                <div className="text-4xl mb-1">🚀</div>
                <p className="text-lg font-black text-white">We&apos;re live!</p>
                <p className="text-sm text-white/50 mt-0.5">Check your email for the launch announcement</p>
              </div>
            ) : countdown ? (
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest text-center mb-2">Launching in</p>
                <div className="flex items-center gap-1.5">
                  {[{ v: countdown.d, l: "Days" }, { v: countdown.h, l: "Hrs" }, { v: countdown.m, l: "Min" }, { v: countdown.s, l: "Sec" }].map(({ v, l }) => (
                    <div key={l} className="flex-1 text-center rounded-xl py-2.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <div className="text-xl font-black text-white leading-none">{pad(v)}</div>
                      <div className="text-xs text-white/40 uppercase mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Subscribe card */}
        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 20 }}>
          {status === "success" ? (
            <div className="text-center py-2" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: 20 }}>
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-emerald-300 font-semibold text-sm">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-white/50 text-center mb-3">Join the waitlist — be first to know</p>
              <form onSubmit={handleSubmit} className="space-y-2">
                <input className="glass-input" type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} autoComplete="name"/>
                <input className="glass-input" type="email" placeholder="Your email address" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/>

                {/* Commitment */}
                <div className="flex gap-2 mt-1">
                  {COMMITMENT_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex-1 flex items-center gap-1.5 cursor-pointer rounded-xl px-3 py-2.5 transition-colors ${commitment === opt.value ? "border-indigo-400 bg-indigo-500/10" : "hover:border-white/30"}`}
                      style={{ border: `1px solid ${commitment === opt.value ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.15)"}` }}>
                      <input type="radio" name="commitment" value={opt.value} checked={commitment === opt.value}
                        onChange={() => setCommitment(opt.value)} className="sr-only"/>
                      <span className="text-xs text-white/70">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Feedback question */}
                {initial.feedbackQuestion && (
                  <textarea className="glass-input" rows={2} placeholder={initial.feedbackQuestion} maxLength={1000}
                    value={feedback} onChange={e => setFeedback(e.target.value)} style={{ resize: "none" }}/>
                )}

                {status === "info" && (
                  <div className="text-xs text-sky-300 text-center py-2 px-3 rounded-xl" style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" }}>
                    {message}
                  </div>
                )}
                {status === "error" && <p className="text-xs text-red-400">{message}</p>}

                <button type="submit" disabled={status === "loading"}
                  className="w-full text-center font-bold text-sm text-white py-3 rounded-xl transition-opacity disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                  {status === "loading" ? "Sending…" : "Notify me at launch →"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Subscriber count + score */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="font-black text-white">{subCount}</span>
            <span className="text-white/50">people already waiting</span>
            {initial.validationScore > 0 && <>
              <span className="text-white/20">·</span>
              <span className="font-black text-emerald-400">{initial.validationScore}</span>
              <span className="text-white/50">score</span>
            </>}
          </div>
        </div>

        {/* Powered by */}
        <div className="text-center">
          <a href="/" className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/50 transition-colors">
            ⚡ Powered by <span className="font-bold text-indigo-400">UZLaunch</span>
          </a>
        </div>
      </div>
    </main>
  );
}
