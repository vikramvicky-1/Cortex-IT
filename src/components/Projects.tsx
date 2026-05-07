import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import prisma from "@/lib/prisma";

export default async function Projects() {
  // Fetch from DB with retry for Neon cold starts
  let rawProjects: Awaited<ReturnType<typeof prisma.project.findMany>> = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      rawProjects = await prisma.project.findMany();
      break;
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (rawProjects.length === 0) return null;
  
  // Transform JSON strings to arrays
  const projects = rawProjects.map((p) => {
    let normalizedLogo = p.logo;
    if (normalizedLogo) {
      // Normalize backslashes to forward slashes
      normalizedLogo = normalizedLogo.replace(/\\/g, "/");
      // If it doesn't start with a slash or http, add a leading slash
      if (!normalizedLogo.startsWith("/") && !normalizedLogo.startsWith("http")) {
        normalizedLogo = "/" + normalizedLogo;
      }
    }

    return {
      ...p,
      logo: normalizedLogo,
      tags: JSON.parse(p.tags) as string[],
      desc: p.overview
    };
  });

  return (
    <section id="projects" className="py-32 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <ScrollReveal>
              <div className="inline-block text-[var(--color-accent-secondary)] font-heading font-bold text-xs tracking-widest uppercase mb-6">
                Work
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-[var(--color-text-primary)] tracking-tight">
                Featured Projects
              </h2>
            </ScrollReveal>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {projects.map((project, index) => (
            <ScrollReveal key={project.id} delay={(index % 3) * 0.1}>
              <Link href={`/case-study/${project.slug}`} className="block h-full">
                {/* Sleek, minimal card wrapper */}
                <div className="relative group rounded-2xl p-[1px] bg-white/5 hover:bg-gradient-to-br hover:from-white/40 hover:via-white/5 hover:to-transparent transition-all duration-700 h-full cursor-pointer flex flex-col">
                  <div className="bg-[#0a0a0a] rounded-2xl h-full w-full p-8 md:p-10 flex flex-col justify-between group-hover:bg-black transition-colors duration-700">
                    
                    <div>
                      {project.logo && (
                        <div className="mb-6 relative h-12 sm:h-16 inline-flex overflow-hidden rounded">
                          <img 
                            src={project.logo} 
                            alt={`${project.title} Logo`} 
                            className="object-contain object-left h-full w-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
                          />
                        </div>
                      )}
                      <h3 className="font-heading font-light text-2xl md:text-3xl text-white mb-4">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 font-light text-base md:text-lg mb-8 leading-relaxed line-clamp-3">
                        {project.desc}
                      </p>
                    </div>
                    
                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="px-3 py-1 rounded-full border border-white/10 text-gray-300 text-[10px] sm:text-xs font-sans tracking-widest uppercase bg-transparent whitespace-nowrap overflow-hidden text-ellipsis">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-white/40 group-hover:text-white font-sans font-bold text-xs tracking-widest uppercase mt-4 transition-colors duration-300">
                        View Case Study
                        <svg className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
