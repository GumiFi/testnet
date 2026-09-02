export default function CoinStatBox({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-line bg-panel px-1 py-2 text-center ${className}`}>
      <p className="font-mono text-[8px] uppercase tracking-wider2 text-bronze">{label}</p>
      <div className="mt-1 truncate font-display text-xs text-ivory sm:text-sm">{children}</div>
    </div>
  );
}
