"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projectApi, ProjectForm } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

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
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-5 py-3">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-5 py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create new project</h1>
          <p className="text-sm text-slate-400 mt-1">Your public waitlist page will be live instantly</p>
        </div>

        <div className="card p-7">
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Launch date & time <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input type="datetime-local" className="app-input"
                value={form.launchAt ?? ""} onChange={e => set("launchAt", e.target.value)}/>
              <p className="text-xs text-slate-400 mt-1">Shows countdown on your page. Subscribers notified automatically.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Feedback question <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input className="app-input" maxLength={255} placeholder="e.g. What's your biggest pain with X today?"
                value={form.feedbackQuestion ?? ""} onChange={e => set("feedbackQuestion", e.target.value)}/>
              <p className="text-xs text-slate-400 mt-1">Collect real insights from potential users.</p>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Creating…" : "Create project →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
