export default function PairStatBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-line bg-panel px-3 py-3 text-center ${className}`}>
      <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-1 font-display text-sm text-ivory sm:text-base">{children}</div>
    </div>
  );
}
