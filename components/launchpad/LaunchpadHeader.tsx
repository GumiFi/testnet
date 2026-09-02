export default function LaunchpadHeader() {
  return (
    <section className="border-b border-line px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="animate-fadeUp">
          <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
            Every coin minted on GUMIFI
          </span>
          <h1 className="mt-3 font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
            Launchpad
          </h1>
          <p className="mt-3 max-w-xl font-body text-sm text-bronze">
            Browse live launches across the ecosystem, sorted by momentum, volume, and freshness.
          </p>
        </div>
      </div>
    </section>
  );
}
