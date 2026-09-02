import type { ReactNode } from "react";
import type { IconProps } from "@/components/icons";

export default function SectionCard({
  icon: Icon,
  label,
  optional,
  children,
}: {
  icon: (props: IconProps) => JSX.Element;
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel2 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold/30 text-goldLight">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">{label}</span>
        {optional && (
          <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">(Optional)</span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
