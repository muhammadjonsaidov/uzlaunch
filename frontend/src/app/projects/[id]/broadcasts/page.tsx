"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { projectApi, broadcastApi } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmModal from "@/components/ConfirmModal";

export default function BroadcastsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><Broadcasts id={Number(id)}/></AuthGuard>;
}

function Broadcasts({ id }: { id: number }) {
  const { data: projectData } = useSWR(["project", id], () => projectApi.get(id));
  const { data: broadcasts, mutate } = useSWR(["broadcasts", id], () => broadcastApi.list(id));

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState("");

  const p = projectData?.project;
  const confirmedCount = projectData?.subscribers.total ?? 0;

  async function handleSend() {
    setSending(true);
    setError("");
    try {
      await broadcastApi.send(id, subject.trim(), body.trim());
      setSubject("");
      setBody("");
      setSuccess(`Broadcast sent to ${confirmedCount} subscribers.`);
      setTimeout(() => setSuccess(""), 4000);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  }

  if (!p) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-4">
          <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← {p.name}</Link>
          <ThemeToggle/>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">📧 Broadcasts</h1>
          <p className="text-sm text-slate-500 mt-1">Send updates to your {confirmedCount} confirmed subscribers.</p>
        </div>

        {/* Compose */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Compose new broadcast</h2>
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject</label>
              <input className="app-input" maxLength={200}
                placeholder="What's new with the project?"
                value={subject} onChange={e => setSubject(e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Message <span className="text-slate-300 font-normal">(use <code className="font-mono text-indigo-500">{"{{name}}"}</code> to personalize)</span>
              </label>
              <textarea className="app-input" rows={8} maxLength={10000} style={{ resize: "vertical" }}
                placeholder={"Hi {{name}},\n\nQuick update on what we've shipped this week...\n\n— Founder"}
                value={body} onChange={e => setBody(e.target.value)}/>
              <p className="text-xs text-slate-400 mt-1.5">
                {body.length}/10000 characters · Recipients see your message inside a styled email with unsubscribe link.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">Limit: 5 broadcasts per day per project.</p>
              <button onClick={() => setShowConfirm(true)} disabled={!subject.trim() || !body.trim() || sending || confirmedCount === 0}
                className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
                {sending ? "Sending…" : `Send to ${confirmedCount} →`}
              </button>
            </div>
          </div>
        </div>

        {/* Past broadcasts */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700">Sent history</span>
          </div>
          {!broadcasts || broadcasts.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm text-slate-400">No broadcasts sent yet.</p>
            </div>
          ) : (
            broadcasts.map(b => (
              <div key={b.id} className="px-5 py-4 border-b border-slate-50 last:border-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800 leading-snug">{b.subject}</h3>
                  <div className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {new Date(b.sentAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </div>
                <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed mb-2 line-clamp-3">{b.body}</p>
                <div className="text-xs text-slate-400">Sent to {b.recipientCount} subscribers</div>
              </div>
            ))
          )}
        </div>
      </main>

      <ConfirmModal
        open={showConfirm}
        onConfirm={handleSend}
        onCancel={() => setShowConfirm(false)}
        title="Send broadcast?"
        message={
          <span>
            About to email <strong>{confirmedCount}</strong> confirmed subscribers. This cannot be undone.
          </span>
        }
        confirmLabel="Send now"
        loading={sending}
      />
    </div>
  );
}
