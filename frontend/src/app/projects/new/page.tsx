"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { projectApi, publicApi, ProjectForm } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewProjectPage() {
  return <AuthGuard><Suspense><NewProject/></Suspense></AuthGuard>;
}

function NewProject() {
  const router = useRouter();
  const params = useSearchParams();
  const templateSlug = params.get("template");
  const [form, setForm] = useState<ProjectForm>({ name: "", tagline: "", isPublic: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (!templateSlug) return;
    publicApi.templates().then(list => {
      const t = list.find(x => x.slug === templateSlug);
      if (!t) return;
      setTemplateName(`${t.emoji} ${t.name}`);
      setForm(f => ({
        ...f,
        name: t.defaultProjectName,
        tagline: t.defaultTagline,
        description: t.defaultDescription,
        feedbackQuestion: t.feedbackQuestion,
        accentColor: t.accentColor,
      }));
    }).catch(() => {});
  }, [templateSlug]);

  function set(k: keyof ProjectForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }
  function setBool(k: keyof ProjectForm, v: boolean) {
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
          {templateName && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
              Using template: <span>{templateName}</span>
              <Link href="/projects/new" className="ml-1 text-indigo-500 hover:text-indigo-700">✕ clear</Link>
            </div>
          )}
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
            {/* Visibility — GitHub-style */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">👁 Visibility</h3>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${form.isPublic !== false ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-slate-200 hover:bg-slate-50"}`}>
                  <input type="radio" name="visibility" checked={form.isPublic !== false} onChange={() => setBool("isPublic", true)} className="mt-1"/>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">🌍 Public</div>
                    <div className="text-xs text-slate-500 mt-0.5">Listed on /explore. Visitors can discover and subscribe.</div>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${form.isPublic === false ? "bg-slate-100 border border-slate-300" : "bg-white border border-slate-200 hover:bg-slate-50"}`}>
                  <input type="radio" name="visibility" checked={form.isPublic === false} onChange={() => setBool("isPublic", false)} className="mt-1"/>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">🔒 Private</div>
                    <div className="text-xs text-slate-500 mt-0.5">Hidden from /explore. Direct link still works.</div>
                  </div>
                </label>
              </div>
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
