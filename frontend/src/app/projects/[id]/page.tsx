"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><ProjectDetail id={Number(id)}/></AuthGuard>;
}

function ProjectDetail({ id }: { id: number }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const { data, error, isLoading, mutate } = useSWR(
    ["project", id, page, q],
    () => projectApi.get(id)
  );
  const { data: trend } = useSWR(["trend", id], () => projectApi.trend(id, 7));
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await projectApi.delete(id);
      router.push("/dashboard");
    } catch (e) {
      setDeleting(false);
      setDeleteError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function removeSubscriber(subId: number) {
    await projectApi.deleteSubscriber(id, subId);
    mutate();
  }

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (error || !data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-red-500">Failed to load project.</div>
  );

  const { project: p, subscribers, pendingSubscribers, commitmentBreakdown, sourceBreakdown, funnel } = data;
  const sourceEntries = Object.entries(sourceBreakdown ?? {}).sort((a, b) => b[1] - a[1]);
  const sourceTotal = sourceEntries.reduce((sum, [, n]) => sum + n, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← Dashboard</Link>
          <ThemeToggle/>
          <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">View page →</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {p.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{p.name}</h1>
              <p className="text-sm text-slate-400">{p.tagline}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-indigo-600 leading-none">{subscribers.total}</div>
            <div className="text-xs text-slate-400 mt-1">subscribers</div>
          </div>
        </div>

        {/* Commitment breakdown */}
        {commitmentBreakdown && (
          <div className="flex gap-3 mb-5">
            {([
              { key: "WOULD_USE", label: "Would use", color: "text-slate-700 bg-slate-100 border-slate-200" },
              { key: "WOULD_PAY", label: "Would pay", color: "text-amber-700 bg-amber-50 border-amber-200" },
              { key: "PAY_NOW",   label: "Pay now",   color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            ] as const).map(({ key, label, color }) => (
              <div key={key} className={`flex-1 text-center rounded-xl border py-3 ${color}`}>
                <div className="text-2xl font-black leading-none">{commitmentBreakdown[key] ?? 0}</div>
                <div className="text-xs font-semibold mt-1 opacity-70">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Funnel */}
        {funnel && (funnel.views > 0 || funnel.subscribed > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-700">Conversion funnel</span>
              <span className="text-xs font-bold text-indigo-600 tabular-nums">{funnel.overallRate}% overall</span>
            </div>
            {(() => {
              const peak = Math.max(funnel.views, funnel.formStarts, funnel.subscribed, funnel.confirmed, 1);
              const steps = [
                { label: "Page views", count: funnel.views, rate: null,                  color: "bg-slate-400" },
                { label: "Started form", count: funnel.formStarts, rate: funnel.formStartRate, color: "bg-sky-500" },
                { label: "Subscribed", count: funnel.subscribed, rate: funnel.subscribeRate, color: "bg-indigo-500" },
                { label: "Confirmed", count: funnel.confirmed, rate: funnel.confirmRate,    color: "bg-emerald-500" },
              ];
              return (
                <div className="space-y-2.5">
                  {steps.map((s, i) => {
                    const pct = Math.max((s.count / peak) * 100, s.count > 0 ? 3 : 0);
                    return (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700 w-24 truncate flex-shrink-0">{s.label}</span>
                        <div className="flex-1 h-7 bg-slate-50 rounded-md overflow-hidden">
                          <div className={`h-full ${s.color} rounded-md transition-all`} style={{ width: `${pct}%` }}/>
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-12 text-right tabular-nums flex-shrink-0">{s.count}</span>
                        <span className="text-xs text-slate-400 w-16 text-right tabular-nums flex-shrink-0">
                          {i > 0 && s.rate !== null ? `↓ ${s.rate}%` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 7-day trend */}
        {trend && trend.some(d => d.views + d.subscribed + d.confirmed > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-700">7-day trend</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"/><span className="text-slate-500">Views</span></span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"/><span className="text-slate-500">Subs</span></span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/><span className="text-slate-500">Confirms</span></span>
              </div>
            </div>
            {(() => {
              const maxV = Math.max(...trend.map(d => Math.max(d.views, d.subscribed, d.confirmed)), 1);
              return (
                <div className="flex items-end gap-2 h-32">
                  {trend.map(d => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-0.5 flex-1">
                        <div className="flex-1 bg-slate-200 rounded-sm" style={{ height: `${Math.max((d.views / maxV) * 100, d.views > 0 ? 4 : 0)}%` }} title={`${d.views} views`}/>
                        <div className="flex-1 bg-indigo-500 rounded-sm" style={{ height: `${Math.max((d.subscribed / maxV) * 100, d.subscribed > 0 ? 4 : 0)}%` }} title={`${d.subscribed} subs`}/>
                        <div className="flex-1 bg-emerald-500 rounded-sm" style={{ height: `${Math.max((d.confirmed / maxV) * 100, d.confirmed > 0 ? 4 : 0)}%` }} title={`${d.confirmed} confirms`}/>
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Source breakdown */}
        {sourceTotal > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-700">Top sources</span>
              <span className="text-xs text-slate-400">{sourceTotal} tracked</span>
            </div>
            <div className="space-y-2">
              {sourceEntries.slice(0, 5).map(([src, count]) => {
                const pct = Math.round((count / sourceTotal) * 100);
                return (
                  <div key={src} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700 w-24 truncate">{src}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}/>
                    </div>
                    <span className="text-xs text-slate-500 w-16 text-right tabular-nums">{count} · {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            🌐 View page
          </Link>
          <Link href={`/projects/${p.id}/edit`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            ✏ Edit
          </Link>
          <Link href={`/p/${p.slug}/stats`}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
            📊 Stats
          </Link>
          <Link href={`/embed?slug=${p.slug}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors">
            🔗 Embed
          </Link>
          <Link href={`/projects/${p.id}/broadcasts`}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 border border-rose-200 bg-rose-50 px-3 py-2 rounded-lg hover:bg-rose-100 transition-colors">
            📧 Broadcasts
          </Link>
          <Link href={`/projects/${p.id}/webhooks`}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 bg-sky-50 px-3 py-2 rounded-lg hover:bg-sky-100 transition-colors">
            🔌 Webhooks
          </Link>
          <button onClick={async () => {
            const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch(`${API}/api/projects/${p.id}/export`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const exportData = await res.json();
            const csv = ["email,name,commitment,feedbackAnswer,subscribedAt",
              ...exportData.map((s: { email: string; name: string; commitment: string; feedbackAnswer: string; subscribedAt: string }) =>
                `"${s.email}","${s.name ?? ""}","${s.commitment}","${s.feedbackAnswer ?? ""}","${s.subscribedAt}"`)
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `${p.slug}-subscribers.csv`; a.click();
            URL.revokeObjectURL(url);
          }}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
            ⬇ Export CSV
          </button>
          {p.validationScore > 0 && (
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border ${
              p.validationScore >= 70 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
              p.validationScore >= 40 ? "text-amber-700 bg-amber-50 border-amber-200" :
              "text-indigo-700 bg-indigo-50 border-indigo-200"
            }`}>
              📊 Score: {p.validationScore}
            </span>
          )}
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
            🗑 Delete
          </button>
        </div>

        {p.launchAt && <LaunchBanner launchAt={p.launchAt} />}

        {/* Subscribers */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
            <span className="text-sm font-bold text-slate-700 flex-shrink-0">Confirmed subscribers</span>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <input className="app-input text-xs py-1.5 px-3 w-full sm:w-44" placeholder="Search by name or email…"
                value={q} onChange={e => setQ(e.target.value)}/>
              <span className="text-xs text-slate-400 flex-shrink-0">{subscribers.total} total</span>
            </div>
          </div>

          {subscribers.items.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-slate-400">No subscribers yet. Share your page to get started!</p>
              <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 font-semibold mt-2 inline-block hover:underline">View public page →</Link>
            </div>
          ) : (
            subscribers.items.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    {(s.name ?? s.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.name ?? "Anonymous"}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    s.commitment === "PAY_NOW" ? "bg-emerald-100 text-emerald-700" :
                    s.commitment === "WOULD_PAY" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {s.commitment === "PAY_NOW" ? "Pay now" : s.commitment === "WOULD_PAY" ? "Would pay" : "Would use"}
                  </span>
                  <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
                    {new Date(s.confirmedAt ?? s.subscribedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <button onClick={() => removeSubscriber(s.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">✕</button>
              </div>
            ))
          )}

          {subscribers.totalPages > 1 && (
            <div className="flex items-center gap-1.5 px-5 py-4 border-t border-slate-100 flex-wrap">
              {Array.from({ length: subscribers.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === page ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {data.pendingSubscribers && data.pendingSubscribers.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden mt-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50">
              <span className="text-sm font-bold text-amber-700">Awaiting confirmation</span>
              <span className="text-xs font-semibold text-amber-500">{data.pendingSubscribers.length} pending</span>
            </div>
            {data.pendingSubscribers.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-amber-50 hover:bg-amber-50/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                    {(s.name ?? s.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{s.name ?? "Anonymous"}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => { await projectApi.resendConfirmation(id, s.id); mutate(); }}
                    className="text-xs text-amber-600 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                    Resend
                  </button>
                  <button onClick={() => removeSubscriber(s.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.locked && (
          <div className="rounded-2xl p-5 flex items-center justify-between gap-4 mt-4"
            style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", border: "1px solid #fcd34d" }}>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">100+ subscribers — upgrade to see all</h3>
              <p className="text-xs text-amber-700 mt-0.5">Export as CSV and access all emails with Pro</p>
            </div>
            <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-bold bg-amber-600 text-white px-4 py-2.5 rounded-lg hover:bg-amber-700 transition-colors">
              Upgrade · $5/mo
            </a>
          </div>
        )}

        {/* Share box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your public page link</p>
          <Link href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-indigo-600 font-semibold break-all hover:underline">
            {process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.uzlaunch.uz"}/p/{p.slug}
          </Link>
        </div>
      </main>

      <ConfirmModal
        open={showDelete}
        title="Delete project?"
        message={<>This will permanently delete <strong className="text-slate-700">&ldquo;{p.name}&rdquo;</strong> and all its subscribers. This cannot be undone.{deleteError && <span className="block text-red-500 mt-2">{deleteError}</span>}</>}
        confirmLabel="Yes, delete everything"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch · Built for Uzbek founders</p>
      </footer>
    </div>
  );
}

function LaunchBanner({ launchAt }: { launchAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, fired: false });

  useEffect(() => {
    function tick() {
      const diff = new Date(launchAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, fired: true }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
        fired: false,
      });
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [launchAt]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatted = new Date(launchAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl p-4 mb-6 bg-indigo-50 border border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Scheduled launch</p>
        <p className="text-xs text-slate-500 font-medium">{formatted}</p>
      </div>
      {timeLeft.fired ? (
        <p className="text-xs text-indigo-500 font-semibold">🚀 Launch time reached! Notifications sent to subscribers.</p>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          {[{ v: timeLeft.days, l: "Days" }, { v: timeLeft.hours, l: "Hrs" }, { v: timeLeft.mins, l: "Min" }, { v: timeLeft.secs, l: "Sec" }].map((u, i) => (
            <span key={u.l} className="flex items-center gap-2">
              {i > 0 && <span className="text-indigo-300 font-black">:</span>}
              <div className="text-center bg-white border border-indigo-100 rounded-xl px-3 py-2 min-w-[52px]">
                <div className="text-lg font-black text-indigo-600 leading-none">{pad(u.v)}</div>
                <div className="text-xs text-slate-400 mt-0.5">{u.l}</div>
              </div>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
