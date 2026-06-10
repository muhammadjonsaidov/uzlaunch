"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmModal from "@/components/ConfirmModal";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  banned: boolean;
  createdAt: string;
}

interface Project {
  id: number;
  slug: string;
  name: string;
  subscriberCount: number;
  userEmail?: string;
}

interface PendingSubscriber {
  id: number;
  email: string;
  name: string | null;
  projectName: string;
  projectSlug: string;
  subscribedAt: string;
}

interface DailyCount {
  date: string;
  count: number;
}

interface Stats {
  userCount: number;
  projectCount: number;
  subscriberCount: number;
  todaySignups: number;
  users: User[];
  projects: (Project & { userEmail?: string })[];
  dailySignups: DailyCount[];
  topProjects: Project[];
  pendingByProject: Record<string, number>;
  pendingSubscribers: PendingSubscriber[];
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [modal, setModal] = useState<{ title: string; message: string; action: () => void; label?: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const load = useCallback(async () => {
    if (!token) { router.push("/admin/login"); return; }
    try {
      const res = await fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error("Failed to load stats");
      setStats(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => { load(); }, [load]);

  async function adminAction(method: string, path: string, body?: object) {
    const res = await fetch(`${API}/api/admin${path}`, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message ?? "Action failed");
    }
    return res.json();
  }

  async function act(method: string, path: string, successMsg?: string, body?: object) {
    try {
      const d = await adminAction(method, path, body);
      showToast(successMsg ?? d.message ?? "Done");
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error");
    }
  }

  async function doSendBroadcast() {
    await act("POST", "/broadcast", undefined, { subject: broadcastSubject, body: broadcastBody });
    setBroadcastSubject("");
    setBroadcastBody("");
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;
    setModal({ title: "Send broadcast?", message: "This will send email to ALL non-banned users.", action: () => doSendBroadcast(), label: "Send" });
    return;
  }

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/");
  }

  async function exportCsv(type: "users" | "subscribers") {
    const res = await fetch(`${API}/api/admin/export/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500 text-sm">{error}</div>
  );

  if (!stats) return null;

  const filteredUsers = stats.users.filter(u =>
    (u.email + " " + (u.name ?? "")).toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredProjects = stats.projects.filter(p =>
    (p.name + " " + p.slug).toLowerCase().includes(projectSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCsv("users")}
            className="hidden sm:inline-flex text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            Users CSV
          </button>
          <button onClick={() => exportCsv("subscribers")}
            className="hidden sm:inline-flex text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            Subs CSV
          </button>
          <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Admin</span>
          <ThemeToggle/>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Logout</button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Admin panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Users", value: stats.userCount, color: "text-indigo-600" },
            { label: "Projects", value: stats.projectCount, color: "text-indigo-600" },
            { label: "Subscribers (all)", value: stats.subscriberCount, color: "text-indigo-600" },
            { label: "Today signups", value: stats.todaySignups, color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Top projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">New users — last 7 days</h2>
            <div className="flex items-end gap-1 h-32">
              {stats.dailySignups.map(d => {
                const max = Math.max(...stats.dailySignups.map(x => x.count), 1);
                const pct = (d.count / max) * 100;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-400">{d.count > 0 ? d.count : ""}</span>
                    <div className="w-full rounded-t-md bg-indigo-500/70" style={{ height: `${Math.max(pct, 4)}%` }}/>
                    <span className="text-xs text-slate-300 rotate-0" style={{ fontSize: 9 }}>{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Top projects by subscribers</h2>
            </div>
            {stats.topProjects.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No projects yet</div>
            ) : stats.topProjects.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-black text-slate-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <Link href={`/p/${p.slug}`} target="_blank"
                      className="text-sm font-semibold text-indigo-600 hover:underline truncate block">{p.name}</Link>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-700 flex-shrink-0 ml-3">{p.subscriberCount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Broadcast */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Broadcast email to all users</h2>
          <form onSubmit={handleBroadcast} className="space-y-3">
            <input value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)}
              type="text" placeholder="Subject" required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
            <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)}
              placeholder="Message body" rows={4} required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"/>
            <button type="submit"
              className="text-sm font-bold text-white bg-indigo-600 px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
              Send broadcast
            </button>
          </form>
        </div>

        {/* Pending subscribers */}
        {stats.pendingSubscribers.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
              <h2 className="text-sm font-bold text-amber-700">
                Pending subscribers <span className="font-normal text-amber-500">({stats.pendingSubscribers.length})</span>
              </h2>
            </div>
            {stats.pendingSubscribers.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5 border-b border-amber-50 hover:bg-amber-50/50 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{s.email}</span>
                    {s.name && <span className="text-xs text-slate-400">({s.name})</span>}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {s.projectName} · {new Date(s.subscribedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <button onClick={() => act("POST", `/subscribers/${s.id}/confirm`)}
                    className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => act("DELETE", `/subscribers/${s.id}`)}
                    className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700 flex-shrink-0">
              Users <span className="font-normal text-slate-400">({stats.userCount})</span>
            </h2>
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
              type="text" placeholder="Search by email or name"
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No users yet</div>
          ) : filteredUsers.map(u => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-indigo-100 text-indigo-600">
                  {(u.name ?? u.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{u.name}</div>
                  <div className="text-xs text-slate-400 truncate">{u.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3 flex-wrap justify-end">
                {u.plan === "PAID" ? (
                  <span className="badge-pro">Pro</span>
                ) : (
                  <span className="badge-free">Free</span>
                )}
                {u.banned && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Banned</span>}
                {u.plan === "FREE" ? (
                  <button onClick={() => act("POST", `/users/${u.id}/upgrade`)}
                    className="text-xs font-bold text-white bg-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">Pro</button>
                ) : (
                  <button onClick={() => act("POST", `/users/${u.id}/downgrade`)}
                    className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Free</button>
                )}
                {!u.banned ? (
                  <button onClick={() => setModal({ title: "Ban user?", message: `This will block ${u.email} from logging in.`, action: () => act("POST", `/users/${u.id}/ban`), label: "Ban" })}
                    className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg hover:bg-orange-100 transition-colors">Ban</button>
                ) : (
                  <button onClick={() => act("POST", `/users/${u.id}/unban`)}
                    className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Unban</button>
                )}
                <button onClick={() => setModal({ title: "Delete user?", message: `Delete ${u.email} and all their data? This cannot be undone.`, action: () => act("DELETE", `/users/${u.id}`) })}
                  className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Projects table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700 flex-shrink-0">
              Projects <span className="font-normal text-slate-400">({stats.projectCount})</span>
            </h2>
            <input value={projectSearch} onChange={e => setProjectSearch(e.target.value)}
              type="text" placeholder="Search by name or slug"
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          {filteredProjects.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">No projects yet</div>
          ) : filteredProjects.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/p/${p.slug}`} target="_blank"
                    className="text-sm font-semibold text-indigo-600 hover:underline truncate">{p.name}</Link>
                  <span className="text-xs text-slate-400 flex-shrink-0">/{p.slug}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {p.subscriberCount} confirmed
                  {stats.pendingByProject[p.id] > 0 && (
                    <span className="ml-1 text-amber-500">+ {stats.pendingByProject[p.id]} pending</span>
                  )}
                </div>
              </div>
              <button onClick={() => setModal({ title: "Delete project?", message: `Delete "${p.name}" and all its subscribers? This cannot be undone.`, action: () => act("DELETE", `/projects/${p.id}`) })}
                className="ml-3 flex-shrink-0 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch Admin</p>
      </footer>

      {modal && (
        <ConfirmModal
          open={true}
          title={modal.title}
          message={modal.message}
          confirmLabel={modal.label ?? "Confirm"}
          onConfirm={() => { modal.action(); setModal(null); }}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
