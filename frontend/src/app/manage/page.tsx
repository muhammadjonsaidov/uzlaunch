"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicApi, SubscriberManage } from "@/lib/api";

const COMMITMENT_OPTIONS = [
  { value: "WOULD_USE", label: "I'd use it" },
  { value: "WOULD_PAY", label: "I'd pay for it" },
  { value: "PAY_NOW",   label: "Pay now" },
];

function ManageContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [data, setData] = useState<SubscriberManage | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error" | "unsubscribed">("loading");
  const [name, setName] = useState("");
  const [commitment, setCommitment] = useState("WOULD_USE");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [showUnsub, setShowUnsub] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    publicApi.manageGet(token)
      .then(d => {
        setData(d);
        setName(d.name ?? "");
        setCommitment(d.commitment);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function save() {
    if (!token) return;
    setSaving(true);
    try {
      const d = await publicApi.manageUpdate(token, { name: name.trim() || undefined, commitment });
      setData(d);
      setSavedMsg("Saved.");
      setTimeout(() => setSavedMsg(""), 2500);
    } catch (e) {
      setSavedMsg(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function unsubscribe() {
    if (!token) return;
    try {
      await publicApi.unsubscribe(token);
      setStatus("unsubscribed");
    } catch {
      setSavedMsg("Could not unsubscribe");
    }
  }

  if (status === "loading") return (
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );

  if (status === "unsubscribed") return (
    <div className="text-center max-w-md">
      <div className="text-5xl mb-3">👋</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">You&apos;ve been unsubscribed</h1>
      <p className="text-sm text-slate-500 mb-5">Sorry to see you go. You won&apos;t hear from us again.</p>
      <Link href="/explore" className="btn-secondary inline-block px-6 py-2.5 text-sm">Browse other waitlists →</Link>
    </div>
  );

  if (status === "error" || !data) return (
    <div className="text-center">
      <div className="text-5xl mb-3">❌</div>
      <h1 className="font-black text-xl text-slate-900 mb-2">Link invalid or expired</h1>
      <p className="text-sm text-slate-500 mb-5">This link has been used or is no longer valid.</p>
      <Link href="/" className="btn-secondary inline-block px-6 py-2.5 text-sm">Back to home</Link>
    </div>
  );

  const accent = data.project.accentColor && /^#[0-9a-fA-F]{6}$/.test(data.project.accentColor) ? data.project.accentColor : "#6366f1";

  return (
    <div className="max-w-md w-full space-y-5">
      {/* Project header */}
      <div className="text-center">
        {data.project.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.project.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover mx-auto mb-3"/>
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white mx-auto mb-3"
            style={{ background: accent }}>
            {data.project.name[0].toUpperCase()}
          </div>
        )}
        <h1 className="text-xl font-black text-slate-900 tracking-tight">{data.project.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{data.project.tagline}</p>
      </div>

      {/* Position pill */}
      {data.confirmed && data.position > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)", display: "flex", justifyContent: "center" }}>
          <span className="text-xs font-semibold text-slate-500">You&apos;re</span>
          <span className="text-lg font-black text-indigo-600 leading-none">#{data.position}</span>
          <span className="text-xs font-semibold text-slate-500">of {data.totalConfirmed}</span>
        </div>
      )}

      {!data.confirmed && (
        <div className="text-xs text-amber-700 text-center py-3 px-4 rounded-xl bg-amber-50 border border-amber-200">
          ⚠ You haven&apos;t confirmed your subscription yet. Check your inbox for the confirmation link.
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-700">Update your subscription</h2>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
          <input className="app-input bg-slate-50 cursor-not-allowed" value={data.email} disabled/>
          <p className="text-xs text-slate-400 mt-1.5">Can&apos;t change email. Unsubscribe and resubscribe with a new one.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Name</label>
          <input className="app-input" maxLength={100} value={name} onChange={e => setName(e.target.value)}/>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Commitment level</label>
          <div className="grid grid-cols-3 gap-2">
            {COMMITMENT_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center justify-center cursor-pointer rounded-xl px-3 py-2 transition-colors text-xs font-semibold"
                style={{
                  border: `1px solid ${commitment === opt.value ? accent : "rgba(15,23,42,0.1)"}`,
                  background: commitment === opt.value ? accent + "11" : "#fff",
                  color: commitment === opt.value ? accent : "#475569",
                }}>
                <input type="radio" name="commitment" value={opt.value} checked={commitment === opt.value}
                  onChange={() => setCommitment(opt.value)} className="sr-only"/>
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {savedMsg && <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-center">{savedMsg}</div>}

        <button onClick={save} disabled={saving} className="btn-primary w-full py-2.5 text-sm">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-5">
        <h2 className="text-sm font-bold text-red-700 mb-2">Unsubscribe</h2>
        <p className="text-xs text-slate-500 mb-3">Remove yourself from this waitlist. You won&apos;t be notified at launch.</p>
        {!showUnsub ? (
          <button onClick={() => setShowUnsub(true)} className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100">
            Unsubscribe me
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={unsubscribe} className="text-xs font-bold text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700">
              Yes, unsubscribe
            </button>
            <button onClick={() => setShowUnsub(false)} className="text-xs font-semibold text-slate-500 px-4 py-2">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="text-center pt-2">
        <Link href={`/p/${data.project.slug}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          ← Back to waitlist page
        </Link>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <Suspense><ManageContent/></Suspense>
    </main>
  );
}
