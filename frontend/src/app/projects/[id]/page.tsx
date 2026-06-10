"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><ProjectDetail id={Number(id)}/></AuthGuard>;
}

function ProjectDetail({ id }: { id: number }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const { data, error, isLoading, mutate } = useSWR(
    ["project", id, page, q],
    () => projectApi.get(id)
  );
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${data?.project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await projectApi.delete(id);
      router.push("/dashboard");
    } catch { setDeleting(false); }
  }

  async function removeSubscriber(subId: number) {
    await projectApi.deleteSubscriber(id, subId);
    mutate();
  }

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (error || !data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-red-500">Failed to load project.</div>;

  const { project: p, subscribers, pendingCount } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Dashboard</Link>
          <div className="flex items-center gap-3">
            <Link href={`/p/${p.slug}`} target="_blank" className="text-sm text-indigo-500 font-semibold hover:text-indigo-600">View page →</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {p.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{p.name}</h1>
              <p className="text-sm text-slate-400">{p.tagline}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-indigo-600">{p.subscriberCount}</div>
            <div className="text-xs text-slate-400">subscribers</div>
          </div>
        </div>

        {/* Validation score */}
        {p.validationScore > 0 && (
          <div className="card p-4 mb-6 flex items-center gap-4">
            <div className={`text-3xl font-black ${p.validationScore >= 70 ? "text-emerald-500" : p.validationScore >= 40 ? "text-amber-500" : "text-indigo-500"}`}>
              {p.validationScore}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-700">Validation Score</div>
              <div className="text-xs text-slate-400">Based on volume, commitment level, and growth momentum</div>
            </div>
            <div className="ml-auto text-xs text-slate-400 font-mono">
              Embed: <code className="bg-slate-100 px-2 py-0.5 rounded">{`<img src="https://api.uzlaunch.uz/api/public/projects/${p.slug}/badge.svg"/>`}</code>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={`/p/${p.slug}`} target="_blank" className="btn-secondary text-xs py-1.5 px-3">🌐 View page</Link>
          <Link href={`/projects/${p.id}/edit`} className="btn-secondary text-xs py-1.5 px-3">✏ Edit</Link>
          <button onClick={handleDelete} disabled={deleting}
            className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
            🗑 Delete
          </button>
        </div>

        {/* Subscribers */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
            <span className="text-sm font-bold text-slate-700">Confirmed subscribers</span>
            <div className="flex items-center gap-2">
              <input className="app-input text-xs py-1.5 px-3 w-44" placeholder="Search…"
                value={q} onChange={e => setQ(e.target.value)}/>
              <span className="text-xs text-slate-400">{subscribers.total} total</span>
            </div>
          </div>

          {subscribers.items.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-400">
              No subscribers yet. <Link href={`/p/${p.slug}`} className="text-indigo-500 font-semibold">Share your page →</Link>
            </div>
          ) : (
            subscribers.items.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {(s.name ?? s.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{s.name ?? s.email}</div>
                    {s.name && <div className="text-xs text-slate-400">{s.email}</div>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.commitment === "PAY_NOW" ? "bg-emerald-100 text-emerald-700" :
                    s.commitment === "WOULD_PAY" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {s.commitment === "PAY_NOW" ? "Pay now" : s.commitment === "WOULD_PAY" ? "Would pay" : "Would use"}
                  </span>
                </div>
                <button onClick={() => removeSubscriber(s.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
              </div>
            ))
          )}

          {/* Pagination */}
          {subscribers.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-slate-100">
              {Array.from({ length: subscribers.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`text-xs font-semibold w-7 h-7 rounded-lg transition-colors ${i === page ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {pendingCount > 0 && (
          <p className="text-xs text-slate-400 mt-3">{pendingCount} pending confirmation</p>
        )}
      </main>
    </div>
  );
}
