"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window {
    __uzlaunchApi?: string;
    __uzlaunchLoaded?: boolean;
    UZLaunch?: { scan: () => void; openModal: (slug: string, opts: Record<string, string | undefined>) => void };
  }
}

function EmbedContent() {
  const params = useSearchParams();
  const [slug, setSlug] = useState(params.get("slug") ?? "");
  const [accent, setAccent] = useState("#6366f1");
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const widgetUrl = `${API_URL}/widget.js`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__uzlaunchApi = API_URL;
    if (window.__uzlaunchLoaded) {
      window.UZLaunch?.scan();
      return;
    }
    const s = document.createElement("script");
    s.src = widgetUrl;
    s.defer = true;
    document.body.appendChild(s);
  }, [API_URL, widgetUrl]);

  useEffect(() => {
    if (!slug || !previewRef.current) return;
    previewRef.current.setAttribute("data-uzlaunch", slug);
    previewRef.current.setAttribute("data-uzlaunch-color", accent);
    // Reset mount flag so widget re-mounts on slug change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (previewRef.current as any).__uzlMounted = false;
    window.UZLaunch?.scan();
  }, [slug, accent]);

  const inlineSnippet = `<script src="${widgetUrl}" defer></script>
<div data-uzlaunch="${slug || "your-slug"}"${accent !== "#6366f1" ? ` data-uzlaunch-color="${accent}"` : ""}></div>`;

  const buttonSnippet = `<script src="${widgetUrl}" defer></script>
<button data-uzlaunch-btn="${slug || "your-slug"}"${accent !== "#6366f1" ? ` data-uzlaunch-color="${accent}"` : ""}>
  Join the waitlist
</button>`;

  function copy(snippet: string, key: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="app-nav" style={{ padding: "0 20px" }}>
        <Link href="/" className="logo-text">
          <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
          UZLaunch
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium">← Dashboard</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Embed your waitlist</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Drop a single script tag on any site — Carrd, Framer, Webflow, raw HTML.
            Collect emails directly from your existing landing page.
          </p>
        </div>

        {/* Config */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Configure</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Project slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value.trim())}
                placeholder="my-project-slug"
                className="app-input w-full text-sm"/>
              <p className="text-xs text-slate-400 mt-1.5">Find it on your project&apos;s public page URL: <code className="font-mono">/p/<b>slug</b></code></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Accent color</label>
              <div className="flex gap-2">
                <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                  className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer"/>
                <input value={accent} onChange={e => setAccent(e.target.value)}
                  className="app-input flex-1 text-sm font-mono"/>
              </div>
            </div>
          </div>
        </div>

        {/* Snippets */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Inline form</h2>
              <button onClick={() => copy(inlineSnippet, "inline")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                {copied === "inline" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto leading-relaxed">{inlineSnippet}</pre>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">Modal button</h2>
              <button onClick={() => copy(buttonSnippet, "btn")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                {copied === "btn" ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto leading-relaxed">{buttonSnippet}</pre>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-1">Live preview</h2>
          <p className="text-xs text-slate-400 mb-4">
            {slug ? "Submissions will create a real subscriber." : "Enter a slug above to render the widget."}
          </p>
          <div className="flex justify-center py-4 bg-slate-50 rounded-xl">
            {slug ? <div ref={previewRef}/> : <p className="text-sm text-slate-400 py-12">No slug set</p>}
          </div>
        </div>

        {/* Options table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Customization options</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-2 text-xs font-semibold text-slate-500">Attribute</th>
                <th className="pb-2 text-xs font-semibold text-slate-500">Effect</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-50">
                <td className="py-2 font-mono text-xs text-indigo-600">data-uzlaunch=&quot;slug&quot;</td>
                <td className="py-2 text-xs">Render inline form for project slug</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 font-mono text-xs text-indigo-600">data-uzlaunch-btn=&quot;slug&quot;</td>
                <td className="py-2 text-xs">Open modal form on click</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 font-mono text-xs text-indigo-600">data-uzlaunch-color</td>
                <td className="py-2 text-xs">Override accent color (default <code>#6366f1</code>)</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 font-mono text-xs text-indigo-600">data-uzlaunch-title</td>
                <td className="py-2 text-xs">Override title text</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs text-indigo-600">data-uzlaunch-subtitle</td>
                <td className="py-2 text-xs">Override subtitle text</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-3">
            Every submit auto-tags <code>utm_source=widget</code>, <code>utm_medium=embed</code>, <code>utm_campaign=&lt;host&gt;</code>
            — you&apos;ll see traffic split by site in your project&apos;s Top Sources.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense>
      <EmbedContent/>
    </Suspense>
  );
}
