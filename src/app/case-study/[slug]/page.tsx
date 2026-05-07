import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({ select: { slug: true } });
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    // Neon DB may be sleeping — return empty so pages render on-demand
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await prisma.project.findUnique({ where: { slug } });

  if (!study) return { title: "Case Study — Cortex" };
  return {
    title: `${study.title} — Cortex Case Study`,
    description: study.overview,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rawStudy = await prisma.project.findUnique({ where: { slug } });

  if (!rawStudy) notFound();

  let normalizedLogo = rawStudy.logo;
  if (normalizedLogo) {
    normalizedLogo = normalizedLogo.replace(/\\/g, "/");
    if (!normalizedLogo.startsWith("/") && !normalizedLogo.startsWith("http")) {
      normalizedLogo = "/" + normalizedLogo;
    }
  }

  const study = {
    ...rawStudy,
    logo: normalizedLogo,
    tags: JSON.parse(rawStudy.tags) as string[],
    features: JSON.parse(rawStudy.features) as string[],
    results: JSON.parse(rawStudy.results) as string[],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Back Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link
            href="/#projects"
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-wide"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo-full.png"
              alt="Cortex Studio"
              width={100}
              height={32}
              style={{ width: "auto" }}
              className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            {study.tags.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-1.5 rounded-full border border-white/10 text-gray-300 text-xs font-sans tracking-widest uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-6">
            {study.logo && (
              <div className="relative h-20 sm:h-24 inline-flex overflow-hidden rounded bg-white/5 p-4 mix-blend-screen shrink-0">
                <img src={study.logo} alt={`${study.title} Logo`} className="object-contain h-full w-auto" />
              </div>
            )}
            <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
              {study.title}
            </h1>
          </div>
          <p className="text-gray-400 text-xl md:text-2xl font-light tracking-wide mb-10">
            {study.subtitle}
          </p>

          {study.websiteUrl && (
            <a
              href={study.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#C8F542] text-black font-sans font-medium text-sm tracking-wide hover:shadow-[0_0_15px_rgba(200,245,66,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              Visit Work
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Divider */}
          <div className="mt-16 h-[1px] bg-white/10" />
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-xs tracking-widest uppercase text-gray-500 mb-6">
            Overview
          </h2>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light">
            {study.overview}
          </p>
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="font-heading text-xs tracking-widest uppercase text-gray-500 mb-6">
              The Challenge
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light">
              {study.challenge}
            </p>
          </div>
          <div>
            <h2 className="font-heading text-xs tracking-widest uppercase text-gray-500 mb-6">
              Our Solution
            </h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light">
              {study.solution}
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-4xl px-6 md:px-12">
        <div className="h-[1px] bg-white/10" />
      </div>

      {/* Key Features */}
      <section className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-xs tracking-widest uppercase text-gray-500 mb-10">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {study.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-gray-400 text-xs font-heading font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-gray-300 text-base font-light leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto max-w-4xl px-6 md:px-12">
        <div className="h-[1px] bg-white/10" />
      </div>

      {/* Results */}
      <section className="py-16 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-heading text-xs tracking-widest uppercase text-gray-500 mb-10">
            Results & Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {study.results.map((result, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-secondary)] mt-2.5 shrink-0" />
                <p className="text-white text-lg font-light leading-relaxed">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading font-light text-3xl md:text-4xl text-white mb-8 tracking-tight">
            Ready to build something like this?
          </h2>
          <Link
            href="/#contact"
            className="inline-block px-12 py-4 rounded-full bg-white text-black font-sans font-medium text-lg tracking-wide hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Start Your Project
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 border-t border-white/5">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <span className="text-gray-500 text-sm">© {new Date().getFullYear()} Cortex</span>
          <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
