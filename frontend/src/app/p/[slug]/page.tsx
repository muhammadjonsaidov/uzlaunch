import { publicApi, Project } from "@/lib/api";
import PublicPageClient from "./PublicPageClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await publicApi.getProject(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.uzlaunch.uz";
    return {
      title: `${p.name} — Coming Soon`,
      description: p.tagline ?? undefined,
      openGraph: {
        title: `${p.name} — Coming Soon`,
        description: p.tagline ?? undefined,
        type: "website",
        url: `${siteUrl}/p/${p.slug}`,
        siteName: "UZLaunch",
      },
      twitter: {
        card: "summary",
        title: `${p.name} — Coming Soon`,
        description: p.tagline ?? undefined,
      },
    };
  } catch {
    return { title: "Coming Soon — UZLaunch" };
  }
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let project: Project | null = null;
  try {
    project = await publicApi.getProject(slug);
  } catch {
    return (
      <main className="min-h-screen page-bg flex items-center justify-center text-white text-center px-4">
        <div>
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-black mb-2">Page not found</h1>
          <p className="text-white/50">This waitlist doesn&apos;t exist or has been removed.</p>
        </div>
      </main>
    );
  }
  return <PublicPageClient project={project}/>;
}
