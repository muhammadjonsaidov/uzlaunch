"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/api";

function ConfirmContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [projectSlug, setProjectSlug] = useState("");
  const [position, setPosition] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }
    publicApi.confirm(token)
      .then(res => {
        setProjectSlug(res.projectSlug);
        setPosition(res.position);
        setTotal(res.total);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [params]);

  if (status === "loading") return (
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
      <p className="text-sm text-slate-500">Confirming your spot…</p>
    </div>
  );

  if (status === "ok") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.uzlaunch.uz";
    const pageUrl = projectSlug ? `${siteUrl}/p/${projectSlug}` : siteUrl;
    const shareText = encodeURIComponent(`Just joined the waitlist! Check it out:`);
    const shareUrl = encodeURIComponent(pageUrl);
    return (
      <div className="text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="font-black text-xl text-slate-900 mb-2">You&apos;re confirmed!</h1>
        {position > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)" }}>
            <span className="text-xs font-semibold text-slate-500">You&apos;re</span>
            <span className="text-lg font-black text-indigo-600 leading-none">#{position}</span>
            {total > 0 && <span className="text-xs font-semibold text-slate-500">of {total}</span>}
          </div>
        )}
        <p className="text-sm text-slate-500 mb-5">Your spot on the waitlist is locked in. We&apos;ll email you at launch.</p>
        <div className="flex flex-col items-center gap-2">
          {projectSlug && (
            <Link href={`/p/${projectSlug}`} className="btn-primary inline-block px-6 py-2.5 text-sm w-full text-center">
              View waitlist page →
            </Link>
          )}
          <p className="text-xs text-slate-400 mt-1">Share with friends:</p>
          <div className="flex gap-2 justify-center">
            <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-black px-4 py-2 rounded-lg hover:opacity-80 transition-opacity">
              𝕏 Share
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity">
              in Share
            </a>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-green-500 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

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
