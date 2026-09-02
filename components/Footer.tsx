import Link from "next/link";
import Logo from "./Logo";

const links = [
  { label: "Docs" },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "GitHub", href: "https://github.com/GumiFi", external: true },
  { label: "X", href: "https://x.com/GumiFiEcosystem", external: true },
  { label: "Discord" },
  { label: "Telegram", href: "https://t.me/gumifiecosystem", external: true },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-panel pb-20 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center">
        <Logo className="h-7 w-auto opacity-90" />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                prefetch={link.external ? undefined : false}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-goldLight"
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.label}
                className="cursor-default font-mono text-[10px] uppercase tracking-wider2 text-bronze/60"
              >
                {link.label}
              </span>
            )
          )}
        </nav>
        <p className="font-mono text-[10px] uppercase tracking-wider3 text-bronze">
          Gumifi Ecosystem
        </p>
        <p className="font-mono text-[10px] text-bronze">
          &#169; 2026 Gumifi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
