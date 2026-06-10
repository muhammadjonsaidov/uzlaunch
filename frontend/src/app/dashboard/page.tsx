"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi, Project } from "@/lib/api";
import { isLoggedIn, removeToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  return <AuthGuard><Dashboard/></AuthGuard>;
}

function Dashboard() {
  const router = useRouter();
  const { data: projects, error, isLoading } = useSWR("projects", projectApi.list);

  function logout() { removeToken(); router.push("/login"); }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-black text-white">U</div>
            <span className="text-sm font-black tracking-tight">UZLaunch</span>
          </Link>
          <button onClick={logout} className="btn-secondary text-xs py-1.5 px-3">Logout</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your waitlist projects</p>
          </div>
          <Link href="/projects/new" className="btn-primary text-sm py-2.5 px-5">+ New project</Link>
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card p-6 h-40 animate-pulse bg-slate-100"/>)}
          </div>
        )}

        {error && <div className="card p-6 text-center text-sm text-red-500">Failed to load projects. <button onClick={() => router.refresh()} className="underline">Retry</button></div>}

        {projects?.length === 0 && (
          <div className="card p-16 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Create your first waitlist</h2>
            <p className="text-sm text-slate-400 mb-6">Launch in 2 minutes. Start collecting signups immediately.</p>
            <Link href="/projects/new" className="btn-primary inline-block px-8 py-3">Create project →</Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => <ProjectCard key={p.id} project={p}/>)}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const scoreColor = p.validationScore >= 70 ? "text-emerald-600" : p.validationScore >= 40 ? "text-amber-500" : "text-indigo-600";
  return (
    <Link href={`/projects/${p.id}`} className="card p-5 hover:shadow-md transition-shadow block group">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-base flex-shrink-0">
          {p.name[0].toUpperCase()}
        </div>
        {p.validationScore > 0 && (
          <span className={`text-xs font-black ${scoreColor} bg-slate-100 px-2 py-1 rounded-lg`}>{p.validationScore} score</span>
        )}
      </div>
      <h3 className="font-bold text-slate-900 mb-0.5 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
      <p className="text-xs text-slate-400 mb-4 line-clamp-1">{p.tagline}</p>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="font-bold text-indigo-600 text-base">{p.subscriberCount}</span>
        <span>subscribers</span>
        {p.launchAt && <span className="ml-auto text-indigo-400">⏰ Scheduled</span>}
      </div>
    </Link>
  );
}
