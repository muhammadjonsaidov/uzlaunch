import { publicApi, FounderProfile } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  try {
    const f = await publicApi.founder(username);
    return {
      title: `${f.name} (@${f.username}) — UZLaunch`,
      description: f.bio || `${f.name} is building ${f.projectCount} project${f.projectCount === 1 ? "" : "s"} on UZLaunch.`,
    };
  } catch {
    return { title: "Founder — UZLaunch" };
  }
}

export default async function FounderPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let f: FounderProfile;
  try {
    f = await publicApi.founder(username);
  } catch {
    return (
      <main className="min-h-screen page-bg flex items-center justify-center text-white text-center px-4">
        <div>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-black mb-2">Founder not found</h1>
          <p className="text-white/50">No UZLaunch founder with this username.</p>
          <Link href="/explore" className="btn-primary inline-block mt-5 px-5 py-2 text-sm">Browse waitlists →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-bg">
      <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="logo-text text-xl">
            <Image src="/favicon-512.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
            UZLaunch
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="text-sm text-white/60 hover:text-white font-medium">Explore</Link>
            <Link href="/register" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          {f.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.avatarUrl} alt={f.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"/>
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {f.name[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white tracking-tight">{f.name}</h1>
            <p className="text-sm text-white/40 mb-2">@{f.username}</p>
            {f.bio && <p className="text-base text-white/70 leading-relaxed mb-3">{f.bio}</p>}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {f.twitter && <SocialPill href={`https://twitter.com/${f.twitter}`} icon="𝕏" label={`@${f.twitter}`}/>}
              {f.github && <SocialPill href={`https://github.com/${f.github}`} icon="⌥" label={f.github}/>}
              {f.linkedin && <SocialPill href={`https://linkedin.com/in/${f.linkedin}`} icon="in" label={f.linkedin}/>}
              {f.website && <SocialPill href={f.website.startsWith("http") ? f.website : `https://${f.website}`} icon="🌐" label={f.website.replace(/^https?:\/\//, "")}/>}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat label="Projects" value={String(f.projectCount)}/>
          <Stat label="Total subscribers" value={String(f.totalSubscribers)}/>
          <Stat label="Member since" value={new Date(f.memberSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}/>
        </div>

        {/* Projects */}
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">Public waitlists</h2>
        {f.projects.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-12">No public projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {f.projects.map(p => {
              const accent = p.accentColor && /^#[0-9a-fA-F]{6}$/.test(p.accentColor) ? p.accentColor : "#6366f1";
              return (
                <Link key={p.id} href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
                      style={{ background: accent }}>
                      {p.name[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-white/40 truncate">{p.tagline}</p>
                  </div>
                  <div className="text-xs text-white/50 flex-shrink-0">
                    <span className="font-black text-white">{p.subscriberCount}</span> waiting
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <footer className="border-t border-white/5 py-8 mt-12 text-center">
        <p className="text-xs text-white/30">© 2026 UZLaunch · <Link href="/" className="hover:text-white/60">Home</Link></p>
      </footer>
    </main>
  );
}

function SocialPill({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-colors"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-xl font-black text-white tabular-nums">{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
