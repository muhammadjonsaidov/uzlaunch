import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen page-bg text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black">U</div>
          <span className="font-black text-lg tracking-tight">UZLaunch</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="bg-white text-indigo-700 font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/90 transition-colors">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/70 mb-8">
          ✨ Validate before you build
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
          Turn your idea into<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">real validation</span>
        </h1>
        <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-xl mx-auto">
          Launch a waitlist in 2 minutes. Collect commitment signals — not just emails. Know if people would actually pay before you write a line of code.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
            Create your waitlist →
          </Link>
          <Link href="/login" className="text-sm text-white/50 hover:text-white/80 transition-colors">
            Already have an account? Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-4">
        {[
          { icon: "🎯", title: "Commitment levels", desc: "Subscribers pick: I'd use it / I'd pay / Pay now. Real intent, not just curiosity." },
          { icon: "📊", title: "Validation score", desc: "0–100 score based on volume, commitment mix, and growth momentum." },
          { icon: "🚀", title: "Launch announcements", desc: "Notify all confirmed subscribers automatically at your launch date." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
