"use client";

import { useState, type ReactNode } from "react";
import { ChevronDownIcon, type IconProps } from "@/components/icons";

type CollapsibleSectionProps = {
  icon: (props: IconProps) => JSX.Element;
  label: string;
  children: ReactNode;
};

export default function CollapsibleSection({ icon: Icon, label, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 border border-line bg-panel2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-bronze" />
          <span className="font-mono text-[11px] uppercase tracking-wider2 text-ivory">{label}</span>
          <span className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">(Optional)</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-bronze transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-line px-4 py-4">{children}</div>}
    </div>
  );
}
