"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Invalid or missing reset link.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
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
        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-bold text-white mb-2">Password set!</h2>
            <p className="text-sm text-white/50">You can now log in with your email and new password.</p>
            <button onClick={() => router.push("/login")} className="btn-primary inline-block mt-5 text-sm" style={{ padding: "10px 24px" }}>
              Go to login
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Set new password</h1>
            <p className="text-white/50 text-sm mb-7">Choose a strong password. Min. 8 characters.</p>

            {error && <div className="alert-error mb-5 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="glass-input" placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  className="glass-input" placeholder="Repeat password" required minLength={8} autoComplete="new-password"/>
              </div>
              <button type="submit" disabled={loading || !token} className="btn-primary w-full text-center mt-2" style={{ padding: "13px" }}>
                {loading ? "Saving…" : "Set password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
