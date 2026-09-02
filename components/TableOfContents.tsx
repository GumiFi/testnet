const sections = [
  { id: "vision", label: "1. Ecosystem Vision" },
  { id: "features", label: "2. Core Ecosystem Features" },
  { id: "launchpad", label: "2.1 Instant Launchpad" },
  { id: "generator", label: "2.2 Token Generator" },
  { id: "dex", label: "2.3 Decentralized Exchange" },
  { id: "nft", label: "2.4 NFT Suite" },
  { id: "infrastructure", label: "3. Relayer & Burn Infrastructure" },
  { id: "mechanism", label: "3.1 Fee Burn Mechanism" },
];

export default function TableOfContents() {
  return (
    <nav className="sticky top-28 hidden w-56 shrink-0 flex-col gap-1 lg:flex">
      <span className="mb-3 font-mono text-[10px] uppercase tracking-wider3 text-bronze">
        Contents
      </span>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="border-l border-line py-1.5 pl-4 font-mono text-[11px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold hover:text-goldLight"
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
