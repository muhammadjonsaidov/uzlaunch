"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Invalid secret");
      }
      const { token } = await res.json();
      localStorage.setItem("adminToken", token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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

      <div className="glass-card w-full max-w-sm p-8 relative z-10">
        <h1 className="text-xl font-black text-white mb-1 tracking-tight">Admin access</h1>
        <p className="text-white/50 text-sm mb-7">Enter the admin secret to continue</p>

        {error && <div className="alert-error mb-5 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Admin secret</label>
            <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
              className="glass-input" placeholder="••••••••" required/>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-1" style={{ padding: "13px" }}>
            {loading ? "Verifying…" : "Access admin panel"}
          </button>
        </form>
      </div>
    </main>
  );
}
