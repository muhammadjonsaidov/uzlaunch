"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi, ProjectForm } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><EditProject id={Number(id)}/></AuthGuard>;
}

function EditProject({ id }: { id: number }) {
  const router = useRouter();
  const { data } = useSWR(["project-edit", id], () => projectApi.get(id));
  const [form, setForm] = useState<ProjectForm>({ name: "", tagline: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const p = data?.project;

  useEffect(() => {
    if (p) setForm({
      name: p.name, tagline: p.tagline,
      description: p.description ?? "",
      launchAt: p.launchAt ? p.launchAt.slice(0, 16) : "",
      feedbackQuestion: p.feedbackQuestion ?? "",
      logoUrl: p.logoUrl ?? "",
      accentColor: p.accentColor ?? "",
    });
  }, [p]);

  function set(k: keyof ProjectForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await projectApi.update(id, form);
      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  if (!p) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <span className="logo-text" style={{ fontSize: 20 }}>UZLaunch</span>
        <div className="flex items-center gap-3">
          <ThemeToggle/>
          <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">← Back</Link>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-5 py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit project</h1>
          <p className="text-sm text-slate-400 mt-1">/p/{p.slug}</p>
        </div>

        <div className="card p-7">
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project name *</label>
              <input className="app-input" required maxLength={100} value={form.name} onChange={e => set("name", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tagline *</label>
              <input className="app-input" required maxLength={150} value={form.tagline} onChange={e => set("tagline", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <textarea className="app-input" rows={3} maxLength={1000} style={{ resize: "vertical" }}
                value={form.description ?? ""} onChange={e => set("description", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Launch date & time <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input type="datetime-local" className="app-input"
                value={form.launchAt ?? ""} onChange={e => set("launchAt", e.target.value)}/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Feedback question <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
              <input className="app-input" maxLength={255} placeholder="e.g. What's your biggest pain with X today?"
                value={form.feedbackQuestion ?? ""} onChange={e => set("feedbackQuestion", e.target.value)}/>
            </div>

            {/* Branding */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🎨 Branding <span className="text-slate-300 font-normal normal-case">(optional)</span></h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logo URL</label>
                  <div className="flex gap-3 items-start">
                    {form.logoUrl && /^https?:\/\//.test(form.logoUrl) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        onError={e => (e.currentTarget.style.display = "none")}/>
                    )}
                    <input className="app-input flex-1" maxLength={500} placeholder="https://your-cdn.com/logo.png"
                      value={form.logoUrl ?? ""} onChange={e => set("logoUrl", e.target.value)}/>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Paste a direct image URL (PNG/SVG/JPG). Host on Imgur, Cloudinary, or your own CDN.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Accent color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accentColor || "#6366f1"} onChange={e => set("accentColor", e.target.value)}
                      className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer"/>
                    <input className="app-input flex-1 font-mono text-sm" placeholder="#6366f1" maxLength={7}
                      value={form.accentColor ?? ""} onChange={e => set("accentColor", e.target.value)}/>
                    {form.accentColor && (
                      <button type="button" onClick={() => set("accentColor", "")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3">Reset</button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Overrides default indigo on avatar + subscribe button.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
