import MarketingNav from "@/components/MarketingNav";
import SiteFooter from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UZLaunch",
  description: "How UZLaunch collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen page-bg">
      <MarketingNav/>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/40 mb-10">Last updated: June 2026</p>

        <section className="prose-section">
          <h2>The short version</h2>
          <p>We collect what we need to run the service. We don&apos;t sell your data. We don&apos;t use creepy tracking. If you delete your account, we delete your data.</p>
        </section>

        <section className="prose-section">
          <h2>What we collect</h2>
          <p><strong>Account data:</strong> email, name, password hash (bcrypt — we never see your password), optional username/bio/avatar URL/social handles.</p>
          <p><strong>Project data:</strong> the waitlist content you create — name, tagline, description, logo URL, launch date.</p>
          <p><strong>Subscriber data:</strong> emails + names of people who join your waitlists, their commitment level, their feedback answers, their UTM source if attached.</p>
          <p><strong>Page analytics:</strong> anonymous page views and form-start events for funnel analysis. No tracking cookies, no fingerprinting, no third-party trackers.</p>
          <p><strong>Login providers:</strong> if you sign in with Google or GitHub, we receive your email and name from them. Nothing else.</p>
        </section>

        <section className="prose-section">
          <h2>What we don&apos;t collect</h2>
          <ul>
            <li>No third-party analytics (no Google Analytics, no Mixpanel, no Hotjar)</li>
            <li>No advertising trackers</li>
            <li>No cross-site tracking</li>
            <li>No IP address logging beyond what&apos;s needed for rate limiting</li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>How we use it</h2>
          <ul>
            <li>Run the service: show your dashboard, send transactional emails, render public pages</li>
            <li>Send confirmation, welcome, launch, and password reset emails (we use <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a> as the email provider)</li>
            <li>Send broadcast emails that founders write to their own subscribers</li>
            <li>Prevent abuse via rate limiting</li>
            <li>Improve the product (we look at aggregate metrics, never individual emails)</li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>Who we share it with</h2>
          <p><strong>Resend</strong> — to send emails on our behalf. Subscriber emails are transmitted to Resend.</p>
          <p><strong>Railway</strong> — our hosting provider. They store the database.</p>
          <p><strong>Google / GitHub</strong> — only if you choose OAuth login.</p>
          <p><strong>Webhook URLs you configure</strong> — when subscribers join your waitlists, we POST the event data to URLs you set up. We are not responsible for what receivers do with it.</p>
          <p>We don&apos;t sell data. We don&apos;t share it with advertisers. We don&apos;t have advertisers.</p>
        </section>

        <section className="prose-section">
          <h2>Cookies</h2>
          <p>
            We use one cookie: a session token after you log in, stored as a JWT in localStorage.
            That&apos;s it. No tracking cookies.
          </p>
        </section>

        <section className="prose-section">
          <h2>Your rights</h2>
          <ul>
            <li><strong>Access</strong> — your dashboard shows everything we have. CSV export available on PRO.</li>
            <li><strong>Edit</strong> — change anything via your profile settings.</li>
            <li><strong>Delete</strong> — delete your account → all your data including subscribers is permanently removed.</li>
            <li><strong>Subscriber rights</strong> — your subscribers can unsubscribe via the email footer or <code>/manage?token=...</code> link.</li>
          </ul>
        </section>

        <section className="prose-section">
          <h2>Data retention</h2>
          <p>While your account is active: we keep your data. When you delete your account: data is removed within 7 days.</p>
          <p>Email delivery logs from Resend may persist on Resend&apos;s side per their policy.</p>
        </section>

        <section className="prose-section">
          <h2>Security</h2>
          <p>
            Passwords are bcrypt-hashed. HTTPS in transit. JWT tokens for auth. Reasonable industry practices for a small team.
            We&apos;re not a bank — don&apos;t store anything you wouldn&apos;t put in a Notion doc.
          </p>
          <p>Spotted a vulnerability? Email us — we&apos;ll fix it fast and credit you if you want.</p>
        </section>

        <section className="prose-section">
          <h2>Children</h2>
          <p>Not for kids under 13. Don&apos;t use UZLaunch if you&apos;re under 13.</p>
        </section>

        <section className="prose-section">
          <h2>Changes</h2>
          <p>If we change this policy materially, we&apos;ll email registered users.</p>
        </section>

        <section className="prose-section">
          <h2>Contact</h2>
          <p>Privacy questions or data requests → <a href="/help">/help</a>.</p>
        </section>
      </main>
      <SiteFooter/>
    </div>
  );
}
