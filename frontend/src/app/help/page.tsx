"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";

const FAQS = [
  {
    category: "Getting started",
    items: [
      {
        q: "How do I create my first waitlist?",
        a: "Sign up, click 'New project' (or pick a template from /templates), fill in name + tagline. Your public page goes live instantly at /p/{your-slug}."
      },
      {
        q: "What's the difference between FREE and PRO plans?",
        a: "FREE: 1 project, see up to 100 confirmed subscribers, 7-day analytics. PRO: unlimited projects, unlimited subscribers, CSV export, email broadcasts, webhooks, 30-day analytics, custom email templates."
      },
      {
        q: "Do I need a credit card to start?",
        a: "No. FREE plan requires only email."
      },
    ],
  },
  {
    category: "Subscribers",
    items: [
      {
        q: "What is double opt-in?",
        a: "When someone subscribes, we send them a confirmation email. They click the link → they're confirmed. This prevents spam, fake emails, and protects your sender reputation."
      },
      {
        q: "What are commitment levels?",
        a: "Each subscriber picks how interested they are: 'I'd use it' (low), 'I'd pay for it' (medium), 'Pay now' (high). This signal is more useful than raw email count for validating demand."
      },
      {
        q: "What is the validation score?",
        a: "A 0-100 score combining subscriber count, commitment levels, confirmation rate, and momentum. Scores >70 = strong demand signal. Scores <40 = weak — iterate on positioning."
      },
      {
        q: "How do referrals work?",
        a: "Each confirmed subscriber gets a unique referral link. When they share it and someone signs up via that link, the referrer moves up the waitlist. Builds viral growth."
      },
      {
        q: "How can subscribers unsubscribe?",
        a: "Every email has an unsubscribe footer link. Subscribers can also visit /manage?token=<their-token> to update name, commitment, or unsubscribe."
      },
    ],
  },
  {
    category: "Sharing and growth",
    items: [
      {
        q: "Can I embed the signup form on my own site?",
        a: "Yes. From your project page click '🔗 Embed' to get a script tag. Drop it on Carrd, Framer, Webflow, raw HTML — works anywhere."
      },
      {
        q: "What is /explore?",
        a: "Public directory of waitlists that opted in. Founders share their profile/projects for free traffic + social proof."
      },
      {
        q: "How do I make my project private?",
        a: "Project settings → Visibility → Private. Hidden from /explore, but the direct /p/{slug} link still works."
      },
      {
        q: "What is my founder profile URL?",
        a: "/founders/<your-username>. Edit username + bio in /settings. Share it on Twitter/LinkedIn → traffic to all your waitlists in one link."
      },
    ],
  },
  {
    category: "Emails and broadcasts",
    items: [
      {
        q: "What emails does UZLaunch send to my subscribers?",
        a: "Confirmation email (after signup), welcome email (after confirm), launch announcement (at scheduled launch time), broadcasts you send manually."
      },
      {
        q: "Can I customize email content?",
        a: "Yes on PRO plan — you can set custom subject + body for the confirm email and launch email per project."
      },
      {
        q: "How do broadcasts work?",
        a: "PRO plan only. From your project page → 📧 Broadcasts → compose subject + body, send to all confirmed subscribers. Use {{name}} for personalization. Limit: 5 broadcasts per project per day."
      },
    ],
  },
  {
    category: "Integrations",
    items: [
      {
        q: "How do webhooks work?",
        a: "PRO plan. From your project → 🔌 Webhooks → add a URL, pick events (subscriber.created, confirmed, unsubscribed, broadcast.sent). We POST JSON to your URL with retries + HMAC signing. Connect to Zapier, n8n, Slack, your CRM."
      },
      {
        q: "Can I export my subscriber list?",
        a: "PRO plan — click 'Export CSV' on the project page."
      },
      {
        q: "Is there an API?",
        a: "Public endpoints for explore, leaderboard, founders, subscribe (used by the widget). Authenticated endpoints for project CRUD. Swagger docs at /swagger-ui.html on the backend."
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "I forgot my password",
        a: "Click 'Forgot password?' on the login page. We'll email you a reset link."
      },
      {
        q: "Can I sign in with Google or GitHub?",
        a: "Yes, both supported on the login + register pages."
      },
      {
        q: "I used Google OAuth before — can I set a password?",
        a: "Yes. Use the 'Forgot password' flow with your OAuth email. The reset link will let you set a password and you can use either method going forward."
      },
      {
        q: "How do I delete my account?",
        a: "Email us via the support link below. Account + all data (including subscribers) removed within 7 days."
      },
    ],
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpen(s => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div className="min-h-screen page-bg">
      <MarketingNav/>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white tracking-tight mb-4">Help &amp; FAQ</h1>
        <p className="text-base text-white/60 mb-10">Common questions. Can&apos;t find what you need? <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 underline">Message us on Telegram</a>.</p>

        {FAQS.map(section => (
          <div key={section.category} className="mb-10">
            <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">{section.category}</h2>
            <div className="space-y-2">
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isOpen = open.has(key);
                return (
                  <button key={key} onClick={() => toggle(key)}
                    className="w-full text-left rounded-2xl p-5 transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-start gap-3">
                      <span className="text-white/40 mt-0.5">{isOpen ? "−" : "+"}</span>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white">{item.q}</h3>
                        {isOpen && <p className="text-sm text-white/60 mt-2 leading-relaxed">{item.a}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 p-6 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-xl font-black text-white mb-2">Still stuck?</h2>
          <p className="text-sm text-white/60 mb-5">We respond to support within 24 hours.</p>
          <a href="https://t.me/uzlaunch" target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-block px-6 py-2.5 text-sm">Message support →</a>
          <p className="text-xs text-white/40 mt-3">Or browse <Link href="/explore" className="underline hover:text-white/60">live examples</Link> on UZLaunch.</p>
        </div>
      </main>
      <SiteFooter/>
    </div>
  );
}
