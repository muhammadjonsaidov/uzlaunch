"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { publicApi, Project } from "@/lib/api";

type Period = "week" | "month";

function LeaderboardContent() {
  const params = useSearchParams();
  const router = useRouter();
  const period = (params.get("period") as Period) || "week";

  const { data: projects, isLoading } = useSWR(["leaderboard", period], () => publicApi.leaderboard(period));

  function setPeriod(p: Period) {
    router.push(`/leaderboard?period=${p}`);
  }

  return (
    <div className="min-h-screen page-bg">
      <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">🏆 Leaderboard</h1>
          <p className="text-base text-white/60">Top waitlists by momentum + validation score.</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["week", "month"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: period === p ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${period === p ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: period === p ? "#a5b4fc" : "rgba(255,255,255,0.6)",
              }}>
              Last {p === "week" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 mb-4">No waitlists ranked yet — be the first.</p>
            <Link href="/register" className="btn-primary inline-block px-6 py-2.5 text-sm">Create your waitlist →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((p, i) => <LeaderRow key={p.id} project={p} rank={i + 1}/>)}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 text-center">
        <p className="text-xs text-white/30">© 2026 UZLaunch · <Link href="/" className="hover:text-white/60">Home</Link></p>
      </footer>
    </div>
  );
}

function LeaderRow({ project, rank }: { project: Project; rank: number }) {
  const accent = project.accentColor && /^#[0-9a-fA-F]{6}$/.test(project.accentColor) ? project.accentColor : "#6366f1";
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <Link href={`/p/${project.slug}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
      style={{ background: rank <= 3 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-10 text-center flex-shrink-0">
        {medal ? <span className="text-2xl">{medal}</span> : <span className="text-lg font-black text-white/40 tabular-nums">{rank}</span>}
      </div>
      {project.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0"/>
      ) : (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
          style={{ background: accent }}>
          {project.name[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-white text-base truncate">{project.name}</h3>
        <p className="text-xs text-white/40 truncate">{project.tagline}</p>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-sm font-black text-white tabular-nums">{project.subscriberCount}</span>
        <span className="text-[10px] text-white/40 uppercase">waiting</span>
      </div>
      {project.validationScore > 0 && (
        <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 ml-2">
          <span className={`text-sm font-black tabular-nums ${
            project.validationScore >= 70 ? "text-emerald-400" :
            project.validationScore >= 40 ? "text-amber-400" : "text-indigo-400"
          }`}>{project.validationScore}</span>
          <span className="text-[10px] text-white/40 uppercase">score</span>
        </div>
      )}
    </Link>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardContent/>
    </Suspense>
  );
}
