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
  return <AuthGuard><Dashboard /></AuthGuard>;
}

function Dashboard() {
  const router = useRouter();
  const { data: projects, error, isLoading } = useSWR("projects", projectApi.list);
  const { data: user } = useSWR("me", authApi.me);

  function logout() { removeToken(); router.push("/login"); }

  const totalSubs = projects?.reduce((sum, p) => sum + p.subscriberCount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }} />
          UZLaunch
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
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
          <Link href="/templates" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden md:inline">Templates</Link>
          <Link href="/help" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden md:inline">Help</Link>
          <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-700 font-medium hidden sm:inline">Settings</Link>
          <ThemeToggle />
          <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Logout</button>
        </div>
      </nav>

      {/* Welcome header */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
        padding: "28px 20px 32px",
      }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user ? `Hey, ${user.name.split(" ")[0]} 👋` : "Your dashboard"}
              </h1>
              <p className="text-sm text-indigo-200 mt-1">Manage your waitlist pages</p>
            </div>
            <Link
              href="/projects/new"
              className="flex-shrink-0 flex items-center gap-1.5 font-bold text-sm text-indigo-700 bg-white px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
              New project
            </Link>
          </div>

          {/* Quick stats */}
          {projects && projects.length > 0 && (
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                <span className="text-2xl font-black text-white">{projects.length}</span>
                <span className="text-xs text-indigo-200 font-semibold leading-tight">project{projects.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                <span className="text-2xl font-black text-white">{totalSubs}</span>
                <span className="text-xs text-indigo-200 font-semibold leading-tight">total<br />subscribers</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-5 py-7">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="app-card p-5 h-24 animate-pulse bg-slate-100" />
            ))}
          </div>
        )}

        {error && (
          <div className="app-card p-6 text-center text-sm text-red-500">
            Failed to load projects.
          </div>
        )}

        {projects?.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-14 text-center bg-white">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #eef2ff, #e0e7ff)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>
            <p className="text-slate-600 font-semibold text-sm mb-1">No projects yet</p>
            <p className="text-slate-400 text-sm mb-5">Create your first waitlist page and start collecting subscribers</p>
            <Link href="/projects/new" className="btn-primary text-sm" style={{ padding: "10px 24px" }}>
              Create first project →
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="flex flex-col gap-3">
            {projects.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}

        {/* Upgrade banner */}
        {user?.plan === "FREE" && projects && projects.length > 0 && (
          <div className="mt-6 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #fcd34d" }}>
            <div className="shimmer-banner" />
            <div className="relative">
              <h3 className="font-bold text-amber-900 text-sm">Upgrade to Pro</h3>
              <p className="text-xs text-amber-700 mt-0.5">Unlock unlimited subscribers, CSV export, and email notifications</p>
            </div>
            <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
              className="relative flex-shrink-0 text-xs font-bold bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors whitespace-nowrap">
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
  const pct = Math.min((p.subscriberCount / Math.max(p.subscriberCount, 100)) * 100, 100);

  return (
    <div className="app-card bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          {p.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">{p.name}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{p.tagline}</p>
            </div>
            {p.validationScore > 0 && (
              <span className={`flex-shrink-0 text-xs font-black px-2 py-0.5 rounded-full ${
                p.validationScore >= 70
                  ? "bg-emerald-50 text-emerald-600"
                  : p.validationScore >= 40
                  ? "bg-amber-50 text-amber-600"
                  : "bg-indigo-50 text-indigo-600"
              }`}>
                {p.validationScore}pts
              </span>
            )}
          </div>

          {/* Sub count + progress */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800 font-bold">{p.subscriberCount}</strong> subscribers
              </span>
              <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors hidden sm:inline">
                /p/{p.slug} ↗
              </Link>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(pct, p.subscriberCount > 0 ? 4 : 0)}%`,
                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)"
                }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <Link href={`/projects/${p.id}`}
              className="btn-primary text-xs flex-1 text-center" style={{ padding: "7px 12px" }}>
              Subscribers
            </Link>
            <Link href={`/projects/${p.id}/edit`}
              className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              Edit
            </Link>
            <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
