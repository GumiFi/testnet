import { StarIcon } from "@/components/icons";
import Avatar from "./Avatar";
import { featuredProjects } from "@/lib/discover-data";

export default function FeaturedSection({
  onAction,
}: {
  onAction: (label: string) => void;
}) {
  return (
    <section className="border-b border-line px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2">
          <StarIcon className="h-4 w-4 text-goldLight" />
          <h2 className="font-display text-lg uppercase tracking-wider2 text-ivory">Featured</h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => onAction(project.name)}
              className="group relative overflow-hidden border border-gold/50 bg-panel px-6 py-8 text-left transition-colors hover:border-gold"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 animate-glow rounded-full bg-gold/20 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <Avatar label={project.monogram} accent="gold" className="h-14 w-14 text-base" />
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider3 text-bronze">
                    {project.category}
                  </span>
                  <h3 className="mt-1 font-display text-xl uppercase tracking-wider2 text-ivory">
                    {project.name}
                  </h3>
                </div>
              </div>
              <p className="relative mt-4 font-body text-sm text-ivory/80">{project.tagline}</p>
              <span className="relative mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider2 text-goldLight">
                Explore
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
