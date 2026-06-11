"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-dark-gradient min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="orb orb-1"/>
      <div className="orb orb-2"/>

      <Link href="/" className="logo-text text-2xl mb-8 relative z-10">
        <Image src="/favicon-512.png" width={26} height={26} alt="" style={{ borderRadius: 7, flexShrink: 0 }}/>
        UZLaunch
      </Link>

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-bold text-white mb-2">Check your inbox</h2>
            <p className="text-sm text-white/50">If <strong className="text-white/80">{email}</strong> is registered, a reset link has been sent. It expires in 1 hour.</p>
            <Link href="/login" className="btn-primary inline-block mt-5 text-sm" style={{ padding: "10px 24px" }}>Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Forgot password?</h1>
            <p className="text-white/50 text-sm mb-7">Enter your email and we&apos;ll send a reset link.</p>

            {error && <div className="alert-error mb-5 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="glass-input" placeholder="you@example.com" required autoComplete="email"/>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2" style={{ padding: "13px" }}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-sm text-white/40 mt-6">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">← Back to login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
