import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
        <p>© 2026 UZLaunch · Built for Uzbek founders</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/explore" className="hover:text-white/70">Explore</Link>
          <Link href="/leaderboard" className="hover:text-white/70">Leaderboard</Link>
          <Link href="/templates" className="hover:text-white/70">Templates</Link>
          <Link href="/about" className="hover:text-white/70">About</Link>
          <Link href="/help" className="hover:text-white/70">Help</Link>
          <Link href="/terms" className="hover:text-white/70">Terms</Link>
          <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
