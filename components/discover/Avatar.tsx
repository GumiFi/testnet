import type { Accent } from "@/lib/discover-data";

const accentStyles: Record<Accent, string> = {
  gold: "border-gold/50 bg-gold/10 text-goldLight",
  emerald: "border-emeraldLight/50 bg-emerald/60 text-emeraldLight",
  garnet: "border-garnetLight/50 bg-garnet/60 text-garnetLight",
};

export default function Avatar({
  label,
  accent,
  className = "h-10 w-10 text-[11px]",
  shape = "circle",
}: {
  label: string;
  accent: Accent;
  className?: string;
  shape?: "circle" | "square";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center border font-display uppercase tracking-wider2 ${
        shape === "circle" ? "rounded-full" : ""
      } ${accentStyles[accent]} ${className}`}
    >
      {label}
    </div>
  );
}
