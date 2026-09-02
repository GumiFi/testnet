import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";

export default function SimpleTokenGeneratorHeader() {
  return (
    <div className="w-full px-1 pb-6">
      <Link
        href="/token-generator"
        prefetch={false}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
      >
        <ChevronLeftIcon className="h-3 w-3" />
        Back To Token Generator
      </Link>
      <span className="mt-4 block font-mono text-xs uppercase tracking-wider3 text-bronze">Gumifi Create</span>
      <h1 className="mt-2 font-display text-2xl uppercase tracking-wider2 text-ivory text-shadow-gold">
        Simple Mode
      </h1>
      <p className="mt-1 font-body text-sm text-bronze">
        Launch a standard token in a few quick steps — name, symbol, and supply.
      </p>
    </div>
  );
}
