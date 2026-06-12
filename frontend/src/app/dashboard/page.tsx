"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi, authApi, Project } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardPage() {
  return <AuthGuard><Dashboard/></AuthGuard>;
}

function Dashboard() {
  const router = useRouter();
  const { data: projects, error, isLoading } = useSWR("projects", projectApi.list);
  const { data: user } = useSWR("me", authApi.me);

  function logout() { removeToken(); router.push("/login"); }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-slate-500 font-medium hidden sm:inline">{user.name}</span>
              {user.plan === "PAID" ? (
                <span className="badge-pro">Pro</span>
              ) : (
                <span className="badge-free">Free</span>
              )}
            </>
          )}
          <Link href="/templates" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden sm:inline">Templates</Link>
          <Link href="/help" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden sm:inline">Help</Link>
          <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden sm:inline">Settings</Link>
          <ThemeToggle/>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Logout</button>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your projects</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your waitlist pages</p>
          </div>
          <Link href="/projects/new" className="btn-primary text-sm flex items-center gap-1.5" style={{ padding: "10px 20px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New project
          </Link>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="app-card p-5 h-20 animate-pulse bg-slate-100"/>)}
          </div>
        )}

        {error && <div className="app-card p-6 text-center text-sm text-red-500">Failed to load projects.</div>}

        {projects?.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-16 text-center bg-white">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            </div>
            <p className="text-slate-500 text-sm mb-4">No projects yet. Create your first waitlist page!</p>
            <Link href="/projects/new" className="text-indigo-600 font-semibold text-sm hover:text-indigo-700">Create your first waitlist page →</Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="flex flex-col gap-3">
            {projects.map(p => <ProjectCard key={p.id} project={p}/>)}
          </div>
        )}

        {/* Upgrade banner */}
        {user?.plan === "FREE" && (
          <div className="mt-8 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #fcd34d" }}>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Upgrade to Pro</h3>
              <p className="text-xs text-amber-700 mt-0.5">Unlock unlimited subscribers, CSV export, and email notifications</p>
            </div>
            <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-bold bg-amber-600 text-white px-4 py-2.5 rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap">
              Upgrade · $5/mo
            </a>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch · Built for Uzbek founders</p>
      </footer>
    </div>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <div className="app-card bg-white p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          {p.name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-base truncate">{p.name}</h3>
          <p className="text-sm text-slate-400 truncate">{p.tagline}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-500">
              <strong className="text-slate-800 font-bold">{p.subscriberCount}</strong> subscribers
            </span>
            {p.validationScore > 0 && (
              <span className={`text-xs font-bold ${p.validationScore >= 70 ? "text-emerald-600" : p.validationScore >= 40 ? "text-amber-500" : "text-indigo-600"}`}>
                {p.validationScore} score
              </span>
            )}
            <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-600 font-medium hover:underline transition-colors">
              /p/{p.slug}
            </Link>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          View
        </Link>
        <Link href={`/projects/${p.id}`}
          className="btn-primary text-xs" style={{ padding: "8px 16px" }}>
          Subscribers
        </Link>
      </div>
    </div>
  );
}
