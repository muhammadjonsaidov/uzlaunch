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
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); return; }
    publicApi.confirm(token)
      .then(res => {
        setProjectSlug(res.projectSlug);
        setPosition(res.position);
        setTotal(res.total);
        setReferralCode(res.referralCode ?? "");
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [params]);

  function copyLink(url: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status === "loading") return (
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
      <p className="text-sm text-slate-500">Confirming your spot…</p>
    </div>
  );

  if (status === "ok") {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.uzlaunch.uz";
    const basePageUrl = projectSlug ? `${siteUrl}/p/${projectSlug}` : siteUrl;
    const referralUrl = referralCode ? `${basePageUrl}?ref=${referralCode}` : basePageUrl;
    const shareText = encodeURIComponent(`Just joined the waitlist! Use my link to skip ahead:`);
    const shareUrl = encodeURIComponent(referralUrl);
    return (
      <div className="text-center max-w-md w-full">
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

        {referralCode && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 mb-5 text-left">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">🚀 Skip the line</p>
            <p className="text-sm text-slate-600 mb-3">Every friend who joins via your link moves you up the list.</p>
            <div className="flex gap-2 items-stretch">
              <input readOnly value={referralUrl}
                className="flex-1 text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2 text-slate-700 font-mono truncate"
                onFocus={e => e.currentTarget.select()}/>
              <button onClick={() => copyLink(referralUrl)}
                className="text-xs font-bold text-white bg-indigo-600 px-4 rounded-lg hover:bg-indigo-700 transition-colors min-w-[72px]">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

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
