"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { projectApi, webhookApi, Webhook, WebhookDelivery } from "@/lib/api";
import AuthGuard from "@/components/AuthGuard";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmModal from "@/components/ConfirmModal";

const EVENT_TYPES = [
  { value: "subscriber.created",      label: "New subscriber (unconfirmed)" },
  { value: "subscriber.confirmed",    label: "Subscriber confirmed" },
  { value: "subscriber.unsubscribed", label: "Subscriber unsubscribed" },
  { value: "broadcast.sent",          label: "Broadcast sent" },
];

export default function WebhooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGuard><Webhooks id={Number(id)}/></AuthGuard>;
}

function Webhooks({ id }: { id: number }) {
  const { data: project } = useSWR(["project-meta", id], () => projectApi.get(id));
  const { data: webhooks, mutate } = useSWR(["webhooks", id], () => webhookApi.list(id));

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(["subscriber.created", "subscriber.confirmed"]));
  const [useSecret, setUseSecret] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<{ id: number; secret: string } | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const p = project?.project;

  function resetForm() {
    setEditingId(null);
    setUrl("");
    setSelectedEvents(new Set(["subscriber.created", "subscriber.confirmed"]));
    setUseSecret(true);
    setError("");
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(w: Webhook) {
    setEditingId(w.id);
    setUrl(w.url);
    setSelectedEvents(new Set(w.events.split(",")));
    setUseSecret(!!w.secret);
    setShowForm(true);
  }

  function toggleEvent(e: string) {
    setSelectedEvents(s => {
      const next = new Set(s);
      if (next.has(e)) next.delete(e); else next.add(e);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      if (editingId == null) {
        const w = await webhookApi.create(id, {
          url: url.trim(),
          events: Array.from(selectedEvents).join(","),
          useSecret,
        });
        if (w.secret && w.secret !== "***") setRevealedSecret({ id: w.id, secret: w.secret });
      } else {
        await webhookApi.update(id, editingId, {
          url: url.trim(),
          events: Array.from(selectedEvents).join(","),
        });
      }
      setShowForm(false);
      resetForm();
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setSaving(false); }
  }

  async function toggleActive(w: Webhook) {
    await webhookApi.update(id, w.id, { active: !w.active });
    mutate();
  }

  async function rotateSecret(w: Webhook) {
    const updated = await webhookApi.update(id, w.id, { rotateSecret: true });
    if (updated.secret && updated.secret !== "***") setRevealedSecret({ id: w.id, secret: updated.secret });
    mutate();
  }

  async function handleDelete() {
    if (deleteId == null) return;
    await webhookApi.delete(id, deleteId);
    setDeleteId(null);
    mutate();
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
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">🔌 Webhooks</h1>
            <p className="text-sm text-slate-500 mt-1">Receive HTTP POSTs on subscriber events — pipe into Zapier, n8n, Slack, your CRM.</p>
          </div>
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-sm flex-shrink-0">+ Add webhook</button>
        </div>

        {revealedSecret && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-sm font-bold text-amber-800">🔑 Save this secret now — it won&apos;t be shown again</span>
              <button onClick={() => setRevealedSecret(null)} className="text-amber-700 text-xs font-semibold hover:text-amber-900">Dismiss</button>
            </div>
            <code className="block w-full text-xs font-mono bg-white border border-amber-200 rounded-lg p-2 break-all">{revealedSecret.secret}</code>
            <p className="text-xs text-amber-700 mt-2">Verify webhooks by computing HMAC-SHA256 of the request body and comparing to the <code>X-UZLaunch-Signature</code> header.</p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">{editingId == null ? "Create webhook" : "Edit webhook"}</h2>
            {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Endpoint URL</label>
                <input className="app-input" placeholder="https://hooks.zapier.com/..." value={url} onChange={e => setUrl(e.target.value)}/>
                <p className="text-xs text-slate-400 mt-1.5">HTTPS recommended. Localhost not allowed.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Events to subscribe</label>
                <div className="space-y-1.5">
                  {EVENT_TYPES.map(et => (
                    <label key={et.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedEvents.has(et.value)} onChange={() => toggleEvent(et.value)}/>
                      <span className="text-sm text-slate-700"><code className="text-xs text-indigo-600 font-mono">{et.value}</code> — {et.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {editingId == null && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={useSecret} onChange={e => setUseSecret(e.target.checked)}/>
                  <span className="text-sm text-slate-700">Generate HMAC signing secret <span className="text-slate-400">(recommended)</span></span>
                </label>
              )}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-sm font-semibold text-slate-500 px-4 py-2">Cancel</button>
                <button onClick={handleSave} disabled={!url.trim() || selectedEvents.size === 0 || saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-50">
                  {saving ? "Saving…" : editingId == null ? "Create" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {!webhooks || webhooks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">
              <p className="text-sm text-slate-400">No webhooks yet. Add one to start receiving events.</p>
            </div>
          ) : webhooks.map(w => (
            <WebhookCard
              key={w.id}
              webhook={w}
              projectId={id}
              expanded={expanded === w.id}
              onToggleExpand={() => setExpanded(expanded === w.id ? null : w.id)}
              onEdit={() => openEdit(w)}
              onDelete={() => setDeleteId(w.id)}
              onToggleActive={() => toggleActive(w)}
              onRotateSecret={() => rotateSecret(w)}
            />
          ))}
        </div>
      </main>

      <ConfirmModal
        open={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete webhook?"
        message="This will permanently delete the webhook and its delivery history."
        confirmLabel="Delete"
      />
    </div>
  );
}

function WebhookCard({ webhook, projectId, expanded, onToggleExpand, onEdit, onDelete, onToggleActive, onRotateSecret }: {
  webhook: Webhook;
  projectId: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onRotateSecret: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<WebhookDelivery | null>(null);
  const { data: deliveries, mutate: mutateDeliveries } = useSWR(
    expanded ? ["deliveries", projectId, webhook.id] : null,
    () => webhookApi.deliveries(projectId, webhook.id)
  );

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const d = await webhookApi.test(projectId, webhook.id);
      setTestResult(d);
      mutateDeliveries();
    } catch {
      // ignore
    } finally { setTesting(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${webhook.active ? "bg-emerald-500" : "bg-slate-300"}`}/>
              <code className="text-sm font-mono text-slate-800 truncate">{webhook.url}</code>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {webhook.events.split(",").map(e => (
                <span key={e} className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{e}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          {webhook.lastAttemptAt && (
            <span>Last: <span className={webhook.lastStatus && webhook.lastStatus >= 200 && webhook.lastStatus < 300 ? "text-emerald-600" : "text-red-600"}>{webhook.lastStatus}</span> · {new Date(webhook.lastAttemptAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          )}
          {webhook.failureCount > 0 && <span className="text-amber-600">⚠ {webhook.failureCount} failure{webhook.failureCount > 1 ? "s" : ""}</span>}
          {webhook.secret && <span className="text-slate-500">🔐 signed</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleTest} disabled={testing}
            className="text-xs font-semibold text-sky-700 border border-sky-200 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 disabled:opacity-50">
            {testing ? "Pinging…" : "🔔 Test"}
          </button>
          <button onClick={onToggleExpand}
            className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50">
            {expanded ? "Hide history" : "Delivery history"}
          </button>
          <button onClick={onEdit}
            className="text-xs font-semibold text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50">
            Edit
          </button>
          <button onClick={onToggleActive}
            className="text-xs font-semibold text-amber-700 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100">
            {webhook.active ? "Pause" : "Resume"}
          </button>
          {webhook.secret && (
            <button onClick={onRotateSecret}
              className="text-xs font-semibold text-purple-700 border border-purple-200 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100">
              Rotate secret
            </button>
          )}
          <button onClick={onDelete}
            className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">
            Delete
          </button>
        </div>

        {testResult && (
          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
            <div className="font-semibold text-slate-700 mb-1">Test result</div>
            <div className="font-mono text-slate-600">
              Status: <span className={testResult.statusCode && testResult.statusCode >= 200 && testResult.statusCode < 300 ? "text-emerald-600" : "text-red-600"}>{testResult.statusCode ?? "—"}</span>
              {" · "}Attempts: {testResult.attemptCount}
              {testResult.error && <div className="text-red-600 mt-1">{testResult.error}</div>}
              {testResult.responseBody && <div className="text-slate-500 mt-1 truncate">{testResult.responseBody}</div>}
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50 rounded-b-2xl">
          {!deliveries || deliveries.items.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No deliveries yet.</p>
          ) : (
            <div className="space-y-1.5">
              {deliveries.items.slice(0, 10).map(d => (
                <div key={d.id} className="flex items-center gap-3 text-xs">
                  <span className={`font-mono font-bold w-12 tabular-nums ${d.statusCode && d.statusCode >= 200 && d.statusCode < 300 ? "text-emerald-600" : "text-red-600"}`}>{d.statusCode ?? "ERR"}</span>
                  <span className="font-mono text-indigo-600 flex-shrink-0">{d.eventType}</span>
                  <span className="text-slate-400 tabular-nums flex-shrink-0">×{d.attemptCount}</span>
                  <span className="text-slate-400 truncate flex-1 text-right">{new Date(d.deliveredAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
