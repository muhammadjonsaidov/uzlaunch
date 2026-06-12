import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen page-bg flex items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="text-7xl mb-4">🔍</div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Page not found</h1>
        <p className="text-sm text-white/60 mb-8">The page you&apos;re looking for moved or never existed.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-2.5 text-sm">Go home</Link>
          <Link href="/explore" className="btn-glass px-6 py-2.5 text-sm">Browse waitlists →</Link>
        </div>
      </div>
    </main>
  );
}
