import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — UZLaunch",
  description: "Why we built UZLaunch — a waitlist tool for Uzbek and CIS founders.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen page-bg">
      <MarketingNav/>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">About UZLaunch</h1>
        <p className="text-lg text-white/60 mb-10">A waitlist tool built for founders who care about validation, not vanity metrics.</p>

        <section className="prose-section">
          <h2>Why we built this</h2>
          <p>
            Most waitlist tools count emails. We count <strong>signal</strong>.
          </p>
          <p>
            A pre-launch waitlist isn&apos;t just an email collector — it&apos;s the cheapest demand validation
            you can run. Done right, you learn whether people will pay before you build. Done wrong, you
            collect 1,000 emails for an idea nobody actually wants.
          </p>
          <p>
            UZLaunch is the tool we wanted when launching our own side projects. Commitment levels
            (would use / would pay / pay now) replace meaningless email totals. Referrals let real
            customers do your marketing. And every feature is built so a solo founder can ship a
            launch page in 5 minutes.
          </p>
        </section>

        <section className="prose-section">
          <h2>Built for CIS founders</h2>
          <p>
            We&apos;re based in Tashkent, Uzbekistan. The global waitlist tools don&apos;t take Uzcard,
            don&apos;t support Russian or Uzbek, and price in dollars that don&apos;t map to local salaries.
            We&apos;re fixing that.
          </p>
          <p>
            That doesn&apos;t mean we&apos;re for CIS founders only — UZLaunch works for anyone. But we lean
            into being a local tool first.
          </p>
        </section>

        <section className="prose-section">
          <h2>What you can do</h2>
          <ul>
            <li><strong>Launch in 5 minutes</strong> — pick a template, fill 2 fields, ship the page</li>
            <li><strong>Validate demand</strong> — collect commitment levels, not just emails</li>
            <li><strong>Grow organically</strong> — referrals, public profiles, leaderboard</li>
            <li><strong>Embed anywhere</strong> — drop a <code>&lt;script&gt;</code> on any site</li>
            <li><strong>Integrate</strong> — webhooks pipe events into Zapier, n8n, your CRM</li>
            <li><strong>Email subscribers</strong> — broadcast updates pre-launch</li>
            <li><strong>Track everything</strong> — conversion funnel, UTM sources, daily trends</li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>The honest pitch</h2>
          <p>
            We&apos;re a small team building this in public. The free plan is generous because we want
            you to ship — Pro pays the bills only if the tool earns it. No dark patterns, no trial-then-paywall.
          </p>
          <p>
            If you find a bug, tell us. If you ship a project using UZLaunch, we want to feature you.
          </p>
        </section>

        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
          <h2 className="text-2xl font-black text-white mb-2">Ready to launch?</h2>
          <p className="text-sm text-white/60 mb-5">Free plan. 1 waitlist. No credit card.</p>
          <Link href="/register" className="btn-primary inline-block px-6 py-2.5 text-sm">Create your waitlist →</Link>
        </div>
      </main>
      <SiteFooter/>
    </div>
  );
}
