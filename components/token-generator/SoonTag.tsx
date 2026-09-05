export default function SoonTag({ label = "Soon" }: { label?: string }) {
  return (
    <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
      {label}
    </span>
  );
}
