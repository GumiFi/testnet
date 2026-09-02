import { BoltIcon } from "@/components/icons";

export default function BoosterBadge({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gradient-to-b from-goldLight/25 via-gold/15 to-goldDim/25 px-1.5 py-[1px] font-mono text-[8px] uppercase tracking-wider2 text-goldLight shadow-[0_0_5px_rgba(201,162,39,0.45)] ring-1 ring-inset ring-gold/60 ${className}`}
    >
      <BoltIcon className="h-2 w-2" />
      {value}
    </span>
  );
}
