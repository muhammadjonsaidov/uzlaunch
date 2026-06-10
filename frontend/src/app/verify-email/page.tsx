"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Suspense } from "react";

function VerifyEmailContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }
    apiFetch(`/api/auth/verify-email?token=${token}`)
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, [params]);

  if (status === "loading") return (
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
      <p className="text-sm text-slate-500">Verifying your email…</p>
    </div>
  );
  if (status === "ok") return (
    <div className="text-center">
      <div className="text-4xl mb-3">✅</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">Email verified!</h1>
      <p className="text-sm text-slate-500 mb-5">Your account is active. You can now sign in.</p>
      <Link href="/login" className="btn-primary inline-block px-6 py-2.5 text-sm">Go to login →</Link>
    </div>
  );
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">❌</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">Verification failed</h1>
      <p className="text-sm text-slate-500 mb-5">Link expired or invalid. Try registering again.</p>
      <Link href="/register" className="btn-primary inline-block px-6 py-2.5 text-sm">Register</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Suspense>
        <VerifyEmailContent/>
      </Suspense>
    </main>
  );
}
