"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { publicApi } from "@/lib/api";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useSWR("templates", () => publicApi.templates());

  return (
    <div className="min-h-screen page-bg">
      <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="logo-text text-xl">
            <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
            UZLaunch
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-sm text-white/60 hover:text-white font-medium">Explore</Link>
            <Link href="/register" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Get started</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">Start with a template</h1>
          <p className="text-base text-white/60 max-w-xl mx-auto">Skip the blank page. Pick a template — we&apos;ll prefill your project so you can launch in 30 seconds.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : !templates ? (
          <p className="text-center text-red-300 py-20">Failed to load templates.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <Link key={t.slug} href={`/projects/new?template=${t.slug}`}
                className="group flex flex-col p-6 rounded-2xl transition-all hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: t.accentColor + "33", border: `1px solid ${t.accentColor}55` }}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-base tracking-tight">{t.name}</h3>
                    <p className="text-xs uppercase tracking-wider text-white/40 font-bold">{t.category}</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-3 mb-3">{t.defaultDescription}</p>
                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">💬 {t.feedbackQuestion.length > 40 ? t.feedbackQuestion.slice(0, 40) + "…" : t.feedbackQuestion}</span>
                </div>
                <span className="text-xs font-bold text-indigo-300 mt-3 group-hover:text-indigo-200">Use template →</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 text-center">
        <p className="text-xs text-white/30">© 2026 UZLaunch · <Link href="/" className="hover:text-white/60">Home</Link></p>
      </footer>
    </div>
  );
}
