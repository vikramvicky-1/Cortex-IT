import ScrollReveal from "./ScrollReveal";
import prisma from "@/lib/prisma";

export default async function Partners() {
  // Fetch from DB with retry for Neon cold starts
  let partners: Awaited<ReturnType<typeof prisma.partner.findMany>> = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      partners = await prisma.partner.findMany();
      break;
    } catch {
      if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (partners.length === 0) return null;

  return (
    <section className="py-24 bg-black relative border-y border-white/5 overflow-hidden">
      <div className="w-full relative z-10 text-center">
        
        {/* Title */}
        <ScrollReveal>
          <h2 className="font-heading font-light text-3xl md:text-4xl text-white mb-16 tracking-wide">
            Partners. Destinations. Outcomes.
          </h2>
        </ScrollReveal>

        {/* Marquee Container */}
        <div className="flex w-full overflow-hidden mask-image-linear-edges relative">
          <div className="flex shrink-0 animate-infinite-scroll w-max gap-20 md:gap-32 items-center px-10">
            {/* Double mapping for seamless infinite scroll loop */}
            {partners.map((partner, i) => {
              let logoUrl = partner.logoUrl;
              if (logoUrl) {
                logoUrl = logoUrl.replace(/\\/g, "/");
                if (!logoUrl.startsWith("/") && !logoUrl.startsWith("http")) {
                  logoUrl = "/" + logoUrl;
                }
              }
              
              return (
                <a
                  key={`${partner.id ?? i}-${i}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-500 flex items-center justify-center shrink-0 hover:scale-110"
                >
                  <img 
                    src={logoUrl || ""} 
                    alt={`${partner.name} logo`} 
                    className="h-16 md:h-20 w-auto object-contain rounded-lg"
                  />
                </a>
              );
            })}
            {/* Repeat for seamless loop */}
            {partners.map((partner, i) => {
              let logoUrl = partner.logoUrl;
              if (logoUrl) {
                logoUrl = logoUrl.replace(/\\/g, "/");
                if (!logoUrl.startsWith("/") && !logoUrl.startsWith("http")) {
                  logoUrl = "/" + logoUrl;
                }
              }
              return (
                <a
                  key={`loop-${partner.id ?? i}-${i}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-500 flex items-center justify-center shrink-0 hover:scale-110"
                >
                  <img 
                    src={logoUrl || ""} 
                    alt={`${partner.name} logo`} 
                    className="h-16 md:h-20 w-auto object-contain rounded-lg"
                  />
                </a>
              );
            })}
          </div>
        </div>
        
      </div>
    </section>
  );
}
