export default function PairFlowBar({
  label,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftRatio,
  isLast = false,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  leftRatio: number;
  isLast?: boolean;
}) {
  const pct = Math.max(4, Math.min(96, Math.round(leftRatio * 100)));

  return (
    <div className={`px-4 py-3 ${isLast ? "" : "border-b border-line"}`}>
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[10px]">
        <span className="text-emeraldLight">
          {leftLabel} {leftValue}
        </span>
        <span className="text-garnetLight">
          {rightLabel} {rightValue}
        </span>
      </div>
      <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-panel2">
        <div className="h-full bg-emeraldLight" style={{ width: `${pct}%` }} />
        <div className="h-full bg-garnetLight" style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}
