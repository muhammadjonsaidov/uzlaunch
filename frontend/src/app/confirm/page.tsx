"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";

function ConfirmContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [projectSlug, setProjectSlug] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }
    publicApi.confirm(token)
      .then(res => { setProjectSlug(res.projectSlug); setStatus("ok"); })
      .catch(() => setStatus("error"));
  }, [params]);

  if (status === "loading") return (
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
      <p className="text-sm text-slate-500">Confirming your spot…</p>
    </div>
  );

  if (status === "ok") return (
    <div className="text-center">
      <div className="text-5xl mb-3">🎉</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">You&apos;re confirmed!</h1>
      <p className="text-sm text-slate-500 mb-5">Your spot on the waitlist is locked in. We&apos;ll email you at launch.</p>
      {projectSlug && (
        <Link href={`/p/${projectSlug}`} className="btn-primary inline-block px-6 py-2.5 text-sm">
          View waitlist page →
        </Link>
      )}
    </div>
  );

  return (
    <div className="text-center">
      <div className="text-5xl mb-3">❌</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">Link invalid or expired</h1>
      <p className="text-sm text-slate-500 mb-5">This confirmation link has already been used or expired.</p>
      <Link href="/" className="btn-secondary inline-block px-6 py-2.5 text-sm">Back to home</Link>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Suspense><ConfirmContent /></Suspense>
    </main>
  );
}
