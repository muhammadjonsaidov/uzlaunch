"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { authApi, User } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  return <AuthGuard><Settings/></AuthGuard>;
}

type Form = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  twitter: string;
  github: string;
  linkedin: string;
  website: string;
};

function emptyForm(): Form {
  return { name: "", username: "", bio: "", avatarUrl: "", twitter: "", github: "", linkedin: "", website: "" };
}

function Settings() {
  const { data: user, mutate } = useSWR<User>("/auth/me", () => authApi.me());
  const [form, setForm] = useState<Form>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      username: user.username ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      twitter: user.twitter ?? "",
      github: user.github ?? "",
      linkedin: user.linkedin ?? "",
      website: user.website ?? "",
    });
  }, [user]);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await authApi.updateProfile(form);
      setSuccess("Profile saved.");
      setTimeout(() => setSuccess(""), 3000);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  const publicUrl = form.username ? `/founders/${form.username}` : null;

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
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile settings</h1>
            <p className="text-sm text-slate-500 mt-1">Edit your public founder profile — visible at <code className="font-mono text-indigo-500">/founders/&lt;username&gt;</code></p>
          </div>
          {publicUrl && (
            <Link href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 flex-shrink-0">
              View public →
            </Link>
          )}
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-7 space-y-5">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{success}</div>}

          <Field label="Display name">
            <input className="app-input" maxLength={100} value={form.name} onChange={e => set("name", e.target.value)}/>
          </Field>

          <Field label="Username" hint={publicUrl ? `Profile URL: ${publicUrl}` : "1-32 chars, lowercase letters, digits, hyphens"}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">@</span>
              <input className="app-input flex-1 font-mono text-sm" maxLength={32}
                value={form.username} onChange={e => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}/>
            </div>
          </Field>

          <Field label="Bio" hint={`${form.bio.length}/300 characters`}>
            <textarea className="app-input" rows={3} maxLength={300} style={{ resize: "vertical" }}
              placeholder="A short bio. What are you building?"
              value={form.bio} onChange={e => set("bio", e.target.value)}/>
          </Field>

          <Field label="Avatar URL" hint="Direct image URL (PNG/SVG/JPG). Imgur or Cloudinary work great.">
            <div className="flex gap-3 items-start">
              {form.avatarUrl && /^https?:\/\//.test(form.avatarUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  onError={e => (e.currentTarget.style.display = "none")}/>
              )}
              <input className="app-input flex-1" maxLength={500} placeholder="https://..."
                value={form.avatarUrl} onChange={e => set("avatarUrl", e.target.value)}/>
            </div>
          </Field>

          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🔗 Social links</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="𝕏 / Twitter handle">
                <input className="app-input" maxLength={100} placeholder="username (without @)"
                  value={form.twitter} onChange={e => set("twitter", e.target.value)}/>
              </Field>
              <Field label="GitHub username">
                <input className="app-input" maxLength={100} placeholder="username"
                  value={form.github} onChange={e => set("github", e.target.value)}/>
              </Field>
              <Field label="LinkedIn handle">
                <input className="app-input" maxLength={100} placeholder="username (after /in/)"
                  value={form.linkedin} onChange={e => set("linkedin", e.target.value)}/>
              </Field>
              <Field label="Personal website">
                <input className="app-input" maxLength={200} placeholder="https://yoursite.com"
                  value={form.website} onChange={e => set("website", e.target.value)}/>
              </Field>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </main>

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch</p>
      </footer>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}
