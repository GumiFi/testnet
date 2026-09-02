import { SearchIcon, CloseIcon } from "@/components/icons";

export default function DiscoverHeader({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const isSearching = query.trim().length > 0;

  return (
    <section className="border-b border-line px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="animate-fadeUp">
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Explore the GUMIFI ecosystem
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
            Discover
          </h1>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 transition-colors focus-within:border-gold/60">
          <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            type="text"
            placeholder="Search tokens, NFTs, collections, creators..."
            className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Close search"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
