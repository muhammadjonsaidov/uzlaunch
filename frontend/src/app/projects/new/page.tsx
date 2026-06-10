"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { projectApi, ProjectForm } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewProjectPage() {
  return <AuthGuard><NewProject/></AuthGuard>;
}

function NewProject() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectForm>({ name: "", tagline: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: keyof ProjectForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const p = await projectApi.create(form);
      router.push(`/projects/${p.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle/>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-xl mx-auto w-full px-5 py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create new project</h1>
          <p className="text-sm text-slate-400 mt-1">Your public waitlist page will be live instantly</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7">
          {error && <div className="app-toast-error rounded-xl px-4 py-3 text-sm mb-4 border" style={{ background: "#fff1f2", borderColor: "#fca5a5", color: "#991b1b" }}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project name *</label>
              <input className="app-input" placeholder="e.g. My Awesome Startup" required maxLength={100}
                value={form.name} onChange={e => set("name", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tagline *</label>
              <input className="app-input" placeholder="One sentence about what you're building" required maxLength={150}
                value={form.tagline} onChange={e => set("tagline", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <textarea className="app-input" rows={3} maxLength={1000} placeholder="Tell visitors more about your project…"
                style={{ resize: "vertical" }} value={form.description ?? ""} onChange={e => set("description", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Launch date &amp; time <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input type="datetime-local" className="app-input"
                value={form.launchAt ?? ""} onChange={e => set("launchAt", e.target.value)}/>
              <p className="text-xs text-slate-400 mt-1">Shows countdown on your page. Subscribers notified automatically at this time.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Feedback question <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input className="app-input" maxLength={255} placeholder="e.g. What's your biggest pain with X today?"
                value={form.feedbackQuestion ?? ""} onChange={e => set("feedbackQuestion", e.target.value)}/>
              <p className="text-xs text-slate-400 mt-1">Collect real insights from potential users.</p>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full text-center" style={{ padding: "13px" }}>
                {loading ? "Creating…" : "Create project →"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-5 text-center">
        <p className="text-xs text-slate-300">© 2026 UZLaunch</p>
      </footer>
    </div>
  );
}
