"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { projectApi, publicApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";
import type { Subscriber } from "@/lib/api";

export default function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <AuthGuard><Stats slug={slug}/></AuthGuard>;
}

function Stats({ slug }: { slug: string }) {
  const { data: project, error: projErr } = useSWR(`public-project-${slug}`, () => publicApi.getProject(slug));
  const { data: stats, error: statsErr, isLoading } = useSWR(
    project ? ["stats", project.id] : null,
    () => projectApi.stats(project!.id)
  );

  if (isLoading || !project) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (projErr || statsErr || !stats) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-red-500">Failed to load stats.</div>
  );

  const maxH = Math.max(...stats.chartData.map(b => b.count), 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-4">
          <Link href={`/projects/${project.id}`} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← Subscribers</Link>
          <ThemeToggle/>
          <Link href={`/p/${slug}`} target="_blank" className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">View page →</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Subscriber analytics</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total subscribers</p>
            <p className="text-4xl font-black text-indigo-600">{stats.totalSubscribers}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last {stats.statsDays} days</p>
            <p className="text-4xl font-black text-emerald-600">{stats.last7Days}</p>
          </div>
          {project.validationScore > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Validation score</p>
              <p className={`text-4xl font-black ${project.validationScore >= 70 ? "text-emerald-600" : project.validationScore >= 40 ? "text-amber-500" : "text-indigo-600"}`}>
                {project.validationScore}
              </p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 overflow-hidden">
          <p className="text-sm font-bold text-slate-700 mb-6">Daily signups — last {stats.statsDays} days</p>
          {stats.totalSubscribers === 0 ? (
            <div className="flex items-center justify-center h-44 text-sm text-slate-400">No data yet</div>
          ) : (() => {
            const step = stats.chartData.length > 10 ? Math.ceil(stats.chartData.length / 8) : 1;
            return (
              <div className="flex items-end gap-1 w-full" style={{ height: 180 }}>
                {stats.chartData.map((bar, i) => {
                  const h = Math.max((bar.count / maxH) * 140, 4);
                  return (
                    <div key={bar.label} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 tabular-nums">{bar.count > 0 ? bar.count : ""}</span>
                      <div className="w-full rounded-t-lg"
                        style={{ height: h, background: "linear-gradient(180deg,#6366f1,#8b5cf6)", minHeight: 4 }}/>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap leading-none h-3">
                        {i % step === 0 || i === stats.chartData.length - 1 ? bar.label : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Feedback answers — if project has feedback question */}
        {project.feedbackQuestion && <FeedbackSection projectId={project.id} question={project.feedbackQuestion}/>}
      </main>

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch</p>
      </footer>
    </div>
  );
}

function FeedbackSection({ projectId, question }: { projectId: number; question: string }) {
  const { data, isLoading } = useSWR(`feedback-${projectId}`, () => projectApi.feedback(projectId));

  if (isLoading) return <div className="text-xs text-slate-400 text-center py-4">Loading feedback…</div>;
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-700">Feedback answers</h2>
        <p className="text-xs text-slate-400 mt-0.5">{question}</p>
      </div>
      {data.map((s: Subscriber) => (
        <div key={s.id} className="px-5 py-4 border-b border-slate-50 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {(s.name ?? s.email)[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-600">{s.name ?? s.email}</span>
          </div>
          <p className="text-sm text-slate-700 ml-8">{s.feedbackAnswer}</p>
        </div>
      ))}
    </div>
  );
}
