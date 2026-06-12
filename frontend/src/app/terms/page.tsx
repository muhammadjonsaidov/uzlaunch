import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — UZLaunch",
  description: "Terms and conditions for using UZLaunch.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen page-bg">
      <MarketingNav/>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: June 2026</p>

        <section className="prose-section">
          <h2>1. Acceptance</h2>
          <p>By creating an account on UZLaunch, you agree to these Terms. If you don&apos;t agree, don&apos;t use the service.</p>
        </section>

        <section className="prose-section">
          <h2>2. What you can do</h2>
          <p>You can use UZLaunch to:</p>
          <ul>
            <li>Build pre-launch waitlist pages for your own projects</li>
            <li>Collect email subscribers with double opt-in</li>
            <li>Send broadcast emails to subscribers who joined your waitlists</li>
            <li>Embed sign-up widgets on third-party sites</li>
            <li>Receive webhooks for subscriber events</li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>3. What you can&apos;t do</h2>
          <ul>
            <li>Spam — sending emails to people who didn&apos;t opt in via your UZLaunch page</li>
            <li>Upload subscribers you didn&apos;t collect with proper consent</li>
            <li>Use the service for illegal content, fraud, malware, or harassment</li>
            <li>Reverse-engineer, scrape, or abuse the API</li>
            <li>Impersonate someone else or create accounts for someone without permission</li>
            <li>Resell UZLaunch as a white-label service without written permission</li>
          </ul>
          <p>Violation = account suspension without notice.</p>
        </section>

        <section className="prose-section">
          <h2>4. Your content</h2>
          <p>
            You own everything you upload — project content, subscriber data, broadcast emails.
            We don&apos;t claim rights to it. We do need permission to store, process, and display
            it for the purpose of providing the service.
          </p>
        </section>

        <section className="prose-section">
          <h2>5. Plans and payment</h2>
          <p>
            FREE plan: 1 project, up to 100 confirmed subscribers visible (we store more, you just can&apos;t see the rest until you upgrade).
          </p>
          <p>
            PRO plan: unlimited projects, unlimited subscribers, CSV export, email broadcasts, webhooks, 30-day analytics.
            Pricing on our pricing page. Paid monthly. Cancel anytime.
          </p>
          <p>No refunds for partial months. You keep PRO features until your billing period ends.</p>
        </section>

        <section className="prose-section">
          <h2>6. Service availability</h2>
          <p>
            We aim for high uptime but don&apos;t guarantee 100%. Scheduled maintenance and unexpected outages happen.
            We won&apos;t be liable for losses caused by downtime.
          </p>
        </section>

        <section className="prose-section">
          <h2>7. Termination</h2>
          <p>
            You can delete your account anytime. We can suspend or terminate accounts that violate these Terms,
            spam subscribers, or harm the service. We&apos;ll try to give notice but aren&apos;t required to.
          </p>
        </section>

        <section className="prose-section">
          <h2>8. Liability</h2>
          <p>
            UZLaunch is provided &quot;as is&quot;. We&apos;re not liable for indirect damages (lost profits,
            lost data, business interruption). Maximum liability for any claim is the amount you paid us in the
            past 12 months.
          </p>
        </section>

        <section className="prose-section">
          <h2>9. Changes</h2>
          <p>
            We can change these Terms. Material changes will be announced via email or dashboard banner.
            Continuing to use UZLaunch after changes = acceptance.
          </p>
        </section>

        <section className="prose-section">
          <h2>10. Contact</h2>
          <p>Questions? Reach us via the support link on <a href="/help">/help</a>.</p>
        </section>
      </main>
      <SiteFooter/>
    </div>
  );
}
