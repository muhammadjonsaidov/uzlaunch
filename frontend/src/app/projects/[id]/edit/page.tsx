"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { projectApi, ProjectForm } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";

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
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-5 py-3">
          <Link href={`/projects/${id}`} className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Back</Link>
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
