import Link from "next/link";
import { BoltIcon, GearIcon, ChevronRightIcon, type IconProps } from "@/components/icons";
import TokenGeneratorHeader from "./TokenGeneratorHeader";

const MODES: { href: string; label: string; icon: (props: IconProps) => JSX.Element; description: string }[] = [
  {
    href: "/token-generator/simple",
    label: "Simple Mode",
    icon: BoltIcon,
    description: "Launch a standard token in a few quick steps — name, symbol, and supply.",
  },
  {
    href: "/token-generator/advance",
    label: "Advance Mode",
    icon: GearIcon,
    description: "Fine-tune tokenomics, taxes, mint authority, and advanced contract settings.",
  },
];

export default function TokenGeneratorApp() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <TokenGeneratorHeader />

      <div className="flex flex-col gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              prefetch={false}
              className="flex items-start gap-3 border border-line bg-panel px-4 py-4 text-left transition-colors hover:border-gold/50 hover:bg-panel2"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-gold/40 text-goldLight">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm uppercase tracking-wider2 text-ivory">{mode.label}</span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-bronze" />
                </span>
                <span className="mt-1 block font-body text-xs leading-relaxed text-bronze">
                  {mode.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
