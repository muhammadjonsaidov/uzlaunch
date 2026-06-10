import Link from "next/link";
import Image from "next/image";

export default function Landing() {
  return (
    <main style={{ background: "linear-gradient(135deg,#0f0f23 0%,#1a1040 45%,#0f1a40 100%)" }} className="text-white overflow-hidden">

      {/* NAV */}
      <nav style={{ background: "rgba(15,15,35,0.8)", backdropFilter: "blur(20px)" }} className="sticky top-0 z-50 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="logo-text text-xl">
            <Image src="/favicon-32.png" width={22} height={22} alt="" style={{ borderRadius: 6, flexShrink: 0 }}/>
            UZLaunch
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors font-medium">Log in</Link>
            <Link href="/register" className="btn-primary text-sm" style={{ padding: "8px 20px" }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-28 px-6 text-center">
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="orb orb-3"/>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8" style={{ color: "#a5b4fc" }}>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"/>
            Free to start · No credit card needed
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Launch your
            <span className="gradient-text"> startup idea</span><br/>
            before writing a single line of code
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a beautiful pre-launch waitlist page in 2 minutes. Collect emails, validate your idea, and build with confidence.
          </p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2" style={{ padding: "16px 40px" }}>
            Create your waitlist free
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/40">
            <span>✓ Free forever</span>
            <span>✓ 2-minute setup</span>
            <span>✓ No design skills needed</span>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div className="glass mx-6 md:mx-auto max-w-3xl rounded-2xl px-8 py-6 mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-white mb-1">100+</div>
            <div className="text-sm text-white/50">Uzbek founders using UZLaunch</div>
          </div>
          <div className="sm:border-x border-white/10 border-y sm:border-y-0 py-4 sm:py-0">
            <div className="text-3xl font-black text-white mb-1">2 min</div>
            <div className="text-sm text-white/50">Average time to launch a page</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1">$0</div>
            <div className="text-sm text-white/50">To get started with 100 subscribers</div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3 tracking-tight">Everything you need to validate your idea</h2>
        <p className="text-center text-white/50 mb-14">Built for Uzbek founders who move fast</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🚀", title: "Launch in 2 minutes", desc: "Fill in your project name, tagline, and description. Your public waitlist page is live immediately with a shareable link." },
            { icon: "📊", title: "Validation score", desc: "0–100 score based on subscriber volume, commitment level (would use / would pay / pay now), and growth momentum." },
            { icon: "📧", title: "Collect real subscribers", desc: "Beautiful signup form with email validation. Every subscriber gets a confirmation email. You get notified instantly." },
          ].map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28, transition: "all 0.3s" }}
              className="hover:-translate-y-1 hover:border-indigo-500/40">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">How it works</p>
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3 tracking-tight">Three steps to validate your startup</h2>
        <p className="text-center text-white/50 mb-16">Simple enough to launch before your morning tea</p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { n: "1", title: "Create your page", desc: "Register, fill in your project details — name, tagline, description, and expected launch date." },
            { n: "2", title: "Share the link", desc: "Post your /p/your-project link on Telegram, social media, and anywhere your audience hangs out." },
            { n: "3", title: "Launch with confidence", desc: "When you're ready, export your subscriber list and send the launch email to people already waiting." },
          ].map(s => (
            <div key={s.n} className="text-center">
              <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>{s.n}</div>
              <h3 className="text-base font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">Pricing</p>
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3 tracking-tight">Simple, honest pricing</h2>
        <p className="text-center text-white/50 mb-14">Start free. Upgrade when you&apos;re ready to scale.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32 }}>
            <div className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Free</div>
            <div className="text-5xl font-black mb-1">$0</div>
            <div className="text-sm text-white/40 mb-8">forever</div>
            <ul className="space-y-3 mb-8 text-sm text-white/70">
              {["Up to 100 subscribers","1 waitlist page","Public page with custom slug","Countdown timer","Basic analytics"].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>{i}</li>
              ))}
            </ul>
            <Link href="/register" className="btn-glass w-full text-center block">Get started free</Link>
          </div>
          {/* Pro */}
          <div style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.5)", borderRadius: 24, padding: 32, boxShadow: "0 0 40px rgba(99,102,241,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Pro</span>
              <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">Popular</span>
            </div>
            <div className="text-5xl font-black mb-1">$5</div>
            <div className="text-sm text-white/40 mb-8">per month</div>
            <ul className="space-y-3 mb-8 text-sm text-white/70">
              {["Unlimited subscribers","Multiple waitlist pages","CSV export","Email notifications","Advanced analytics","Priority support"].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>{i}</li>
              ))}
            </ul>
            <a href="https://t.me/uzlaunch" target="_blank" className="btn-primary w-full text-center block" style={{ padding: "11px 20px" }}>Upgrade to Pro</a>
          </div>
          {/* Team */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 32 }}>
            <div className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Team</div>
            <div className="text-5xl font-black mb-1">$20</div>
            <div className="text-sm text-white/40 mb-8">per month</div>
            <ul className="space-y-3 mb-8 text-sm text-white/70">
              <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>Everything in Pro</li>
              <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>Team members access</li>
              <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>Custom domain <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold ml-1">Soon</span></li>
              <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>White-label pages <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold ml-1">Soon</span></li>
              <li className="flex items-center gap-2"><span className="text-indigo-400 font-bold">✓</span>API access <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold ml-1">Soon</span></li>
            </ul>
            <a href="https://t.me/uzlaunch" target="_blank" className="btn-glass w-full text-center block">Contact us</a>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-6 mb-24 max-w-4xl md:mx-auto rounded-3xl p-6 sm:p-12 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">Start validating your idea today</h2>
          <p className="text-white/75 mb-8">Join 100+ Uzbek founders who launched their waitlist with UZLaunch</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 text-sm">
            Create your page — it&apos;s free
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 text-center">
        <Link href="/" className="logo-text text-lg mb-4 inline-flex">
          <Image src="/favicon-32.png" width={20} height={20} alt="" style={{ borderRadius: 5 }}/>
          UZLaunch
        </Link>
        <div className="flex justify-center gap-6 mb-6 flex-wrap mt-4">
          <Link href="/" className="text-sm text-white/40 hover:text-white transition-colors">Home</Link>
          <Link href="/register" className="text-sm text-white/40 hover:text-white transition-colors">Get started</Link>
          <Link href="/login" className="text-sm text-white/40 hover:text-white transition-colors">Log in</Link>
          <a href="https://t.me/uzlaunch" target="_blank" className="text-sm text-white/40 hover:text-white transition-colors">Support</a>
        </div>
        <p className="text-xs text-white/25">© 2026 UZLaunch. Built for Uzbek founders.</p>
      </footer>
    </main>
  );
}
