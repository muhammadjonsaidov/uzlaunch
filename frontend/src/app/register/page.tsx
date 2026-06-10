"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.register({ name, email, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white">U</div>
            <span className="font-black text-xl tracking-tight">UZLaunch</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Create account</h1>
          <p className="text-sm text-slate-400 mt-1">Free. No credit card needed.</p>
        </div>

        <div className="card p-7">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <h2 className="font-bold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500">We sent a verification link to <strong>{email}</strong>. Click it to activate your account.</p>
              <Link href="/login" className="btn-primary inline-block mt-5 px-6 py-2.5 text-sm">Go to login →</Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="app-input" placeholder="Your name" required autoComplete="name"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="app-input" placeholder="you@example.com" required autoComplete="email"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="app-input" placeholder="Min 8 characters" required minLength={8} autoComplete="new-password"/>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? "Creating account…" : "Create account →"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Already have an account? <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
