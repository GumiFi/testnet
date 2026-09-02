"use client";

import { CloseIcon, PlusIcon } from "@/components/icons";

export type TraitRow = {
  id: string;
  traitType: string;
  values: string;
};

type TraitsSectionProps = {
  traits: TraitRow[];
  onChange: (next: TraitRow[]) => void;
  collectionSize: number;
};

function countValues(values: string): number {
  return values
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean).length;
}

export default function TraitsSection({ traits, onChange, collectionSize }: TraitsSectionProps) {
  function updateRow(id: string, patch: Partial<TraitRow>) {
    onChange(traits.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...traits, { id: `trait-${Date.now()}`, traitType: "", values: "" }]);
  }

  function removeRow(id: string) {
    onChange(traits.filter((row) => row.id !== id));
  }

  const activeTraits = traits.filter((row) => row.traitType.trim() && countValues(row.values) > 0);
  const totalCombinations = activeTraits.reduce((total, row) => total * countValues(row.values), 1);
  const showShortfall = activeTraits.length > 0 && collectionSize > 0 && totalCombinations < collectionSize;

  return (
    <div className="space-y-4">
      <p className="font-body text-[11px] text-bronze">
        Add trait types for a generative collection. Each NFT gets one value per trait, picked at random.
      </p>

      {traits.length > 0 && (
        <div className="space-y-3">
          {traits.map((row) => (
            <div key={row.id} className="border border-line bg-panel p-3">
              <div className="flex items-center gap-2">
                <input
                  value={row.traitType}
                  onChange={(event) => updateRow(row.id, { traitType: event.target.value })}
                  type="text"
                  placeholder="Trait type, e.g. Background"
                  className="w-full border border-line bg-panel2 px-3 py-2 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove trait type"
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-bronze transition-colors hover:text-goldLight"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={row.values}
                onChange={(event) => updateRow(row.id, { values: event.target.value })}
                type="text"
                placeholder="Values, comma separated, e.g. Red, Blue, Green"
                className="mt-2 w-full border border-line bg-panel2 px-3 py-2 font-mono text-xs text-ivory placeholder:text-bronze/50 focus:border-gold/60 focus:outline-none"
              />
              {row.values.trim() && (
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-bronze">
                  {countValues(row.values)} value{countValues(row.values) === 1 ? "" : "s"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-line py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-goldLight"
      >
        <PlusIcon className="h-3 w-3" />
        Add Trait Type
      </button>

      {activeTraits.length > 0 && (
        <div className="border-t border-line pt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">
            Possible Combinations: {totalCombinations.toLocaleString()}
          </p>
          {showShortfall && (
            <p className="mt-1 font-body text-[11px] text-bronze">
              That is fewer than your collection size ({collectionSize.toLocaleString()}), so some NFTs will repeat.
              Add more values or trait types to keep every NFT unique.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
