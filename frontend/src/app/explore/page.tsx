"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { publicApi, Project } from "@/lib/api";

type Sort = "trending" | "newest" | "top";

const SORTS: { value: Sort; label: string; emoji: string }[] = [
  { value: "trending", label: "Trending", emoji: "🔥" },
  { value: "newest",   label: "Newest",   emoji: "✨" },
  { value: "top",      label: "Top score", emoji: "📊" },
];

function ExploreContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sort = (params.get("sort") as Sort) || "trending";
  const page = parseInt(params.get("page") || "0", 10);

  const { data, error, isLoading } = useSWR(
    ["explore", sort, page],
    () => publicApi.explore(sort, page),
    { revalidateOnFocus: false }
  );

  function setSort(s: Sort) {
    router.push(`/explore?sort=${s}`);
  }

  function setPage(p: number) {
    router.push(`/explore?sort=${sort}&page=${p}`);
  }

  return (
    <div className="min-h-screen page-bg">
      <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="logo-text text-xl">
            <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
            UZLaunch
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white font-medium">Log in</Link>
            <Link href="/register" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Get started free</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">Explore waitlists</h1>
          <p className="text-base text-white/60 max-w-xl mx-auto">Real projects launching soon. Join the ones you love — be there from day one.</p>
        </div>

        {/* Sort tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {SORTS.map(s => (
            <motion.button
              key={s.value}
              onClick={() => setSort(s.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: sort === s.value ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${sort === s.value ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: sort === s.value ? "#a5b4fc" : "rgba(255,255,255,0.6)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : error || !data ? (
          <p className="text-center text-red-300 py-20">Failed to load.</p>
        ) : data.items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-white/60">No public waitlists yet. Be the first to launch one!</p>
            <Link href="/register" className="btn-primary inline-block mt-5 px-6 py-2.5 text-sm">Create a waitlist →</Link>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              {data.items.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ProjectCard project={p} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/70 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5">
                  ← Prev
                </button>
                <span className="text-sm text-white/50 px-3">Page {page + 1} of {data.totalPages}</span>
                <button onClick={() => setPage(page + 1)} disabled={page >= data.totalPages - 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white/70 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 text-center">
        <p className="text-xs text-white/30">© 2026 UZLaunch · <Link href="/" className="hover:text-white/60">Home</Link></p>
      </footer>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [launched, setLaunched] = useState(false);
  const [countdown, setCountdown] = useState<{ d: number; h: number } | null>(null);

  useEffect(() => {
    if (!project.launchAt) return;
    const target = new Date(project.launchAt).getTime();
    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) { setLaunched(true); setCountdown(null); return; }
      const s = Math.floor(diff / 1000);
      setCountdown({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600) });
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [project.launchAt]);

  const accent = project.accentColor && /^#[0-9a-fA-F]{6}$/.test(project.accentColor) ? project.accentColor : "#6366f1";

  return (
    <motion.div whileHover={{ y: -6, borderColor: "rgba(99,102,241,0.35)" }} transition={{ duration: 0.2 }}
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
    <Link href={`/p/${project.slug}`} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col p-5 rounded-2xl"
      style={{ display: "flex", flexDirection: "column" }}>
      <div className="flex items-start gap-3 mb-3">
        {project.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.logoUrl} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0"/>
        ) : (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
            style={{ background: accent }}>
            {project.name[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-base leading-tight tracking-tight truncate">{project.name}</h3>
          <p className="text-xs text-white/50 line-clamp-2 leading-snug mt-0.5">{project.tagline}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-black text-white">{project.subscriberCount}</span>
          <span className="text-white/40">waiting</span>
        </div>
        {project.validationScore > 0 && (
          <>
            <span className="text-white/20">·</span>
            <div className="flex items-center gap-1 text-xs">
              <span className={`font-black ${
                project.validationScore >= 70 ? "text-emerald-400" :
                project.validationScore >= 40 ? "text-amber-400" : "text-indigo-400"
              }`}>{project.validationScore}</span>
              <span className="text-white/40">score</span>
            </div>
          </>
        )}
        <div className="flex-1"/>
        {launched ? (
          <span className="text-xs font-bold text-emerald-400">🚀 Live</span>
        ) : countdown ? (
          <span className="text-xs font-semibold text-white/60 tabular-nums">
            {countdown.d > 0 ? `${countdown.d}d ${countdown.h}h` : `${countdown.h}h`} left
          </span>
        ) : null}
      </div>
    </Link>
    </motion.div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent/>
    </Suspense>
  );
}
