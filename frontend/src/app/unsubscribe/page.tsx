"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";

function UnsubscribeContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }
    publicApi.unsubscribe(token)
      .then(res => { setProjectName(res.message.replace("Unsubscribed from ", "")); setStatus("ok"); })
      .catch(() => setStatus("error"));
  }, [params]);

  if (status === "loading") return (
    <div className="text-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"/></div>
  );
  if (status === "ok") return (
    <div className="text-center">
      <div className="text-4xl mb-3">👋</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">You&apos;re unsubscribed</h1>
      <p className="text-sm text-slate-500 mb-5">You&apos;ve been removed from the <strong>{projectName}</strong> waitlist.</p>
      <Link href="/" className="btn-secondary inline-block px-6 py-2.5 text-sm">Back to UZLaunch</Link>
    </div>
  );
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">❌</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">Invalid link</h1>
      <p className="text-sm text-slate-500">This unsubscribe link is invalid or already used.</p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Suspense><UnsubscribeContent/></Suspense>
    </main>
  );
}
