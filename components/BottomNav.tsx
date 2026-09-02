"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ComingSoonModal from "./ComingSoonModal";
import {
  CompassIcon,
  PlusIcon,
  CoinIcon,
  GearIcon,
  FrameIcon,
  SwapIcon,
  DropletIcon,
  ChartIcon,
  RocketIcon,
  type IconProps,
} from "./icons";

type ChildItem = {
  label: string;
  icon: (props: IconProps) => JSX.Element;
  href?: string;
};

type TabItem = {
  label: string;
  icon: (props: IconProps) => JSX.Element;
  href?: string;
  children?: ChildItem[];
};

const tabs: TabItem[] = [
  { label: "Discover", icon: CompassIcon, href: "/" },
  {
    label: "Create",
    icon: PlusIcon,
    children: [
      { label: "Create Coin", icon: CoinIcon, href: "/launchpad/create" },
      { label: "Token Generator", icon: GearIcon, href: "/token-generator" },
      { label: "NFT Maker", icon: FrameIcon, href: "/nft/create" },
    ],
  },
  { label: "Launchpad", icon: RocketIcon, href: "/launchpad" },
  { label: "Dex", icon: ChartIcon, href: "/dex" },
  { label: "Swap", icon: SwapIcon, href: "/swap" },
  { label: "Liquidity", icon: DropletIcon, href: "/liquidity" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuLeft, setMenuLeft] = useState(0);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      const insideMenu = menuRef.current?.contains(target);
      const insideToggle = buttonRefs.current[openMenu as string]?.contains(target);
      if (!insideMenu && !insideToggle) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [openMenu]);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  function handleTabClick(tab: TabItem) {
    if (tab.children) {
      if (openMenu === tab.label) {
        setOpenMenu(null);
        return;
      }
      const buttonEl = buttonRefs.current[tab.label];
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        setMenuLeft(rect.left + rect.width / 2);
      }
      setOpenMenu(tab.label);
      return;
    }
    setOpenMenu(null);
    if (!tab.href) {
      setComingSoon(tab.label);
    }
  }

  function handleChildClick(child: ChildItem) {
    setOpenMenu(null);
    if (!child.href) {
      setComingSoon(child.label);
    }
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-line bg-panel/95 backdrop-blur md:hidden">
        <div
          className="flex items-stretch justify-between px-1"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href ? pathname === tab.href : false;
            const isOpen = openMenu === tab.label;
            const activeColor = isActive || isOpen ? "text-goldLight" : "text-bronze";

            const content = (
              <>
                <Icon className={`h-5 w-5 shrink-0 ${activeColor}`} />
                <span
                  className={`whitespace-nowrap text-center font-mono text-[8.5px] uppercase leading-[1.15] ${activeColor}`}
                >
                  {tab.label}
                </span>
              </>
            );

            if (tab.href) {
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  prefetch={false}
                  className="flex flex-col items-center justify-center gap-0.5 px-1 py-2.5"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={tab.label} className="relative flex flex-col items-center px-1">
                <button
                  type="button"
                  ref={(el: HTMLButtonElement | null) => {
                    buttonRefs.current[tab.label] = el;
                  }}
                  onClick={() => handleTabClick(tab)}
                  className="flex flex-col items-center justify-center gap-0.5 py-2.5"
                  aria-haspopup={tab.children ? "true" : undefined}
                  aria-expanded={tab.children ? isOpen : undefined}
                >
                  {content}
                </button>
              </div>
            );
          })}
        </div>

        {openMenu &&
          (() => {
            const activeTab = tabs.find((tab) => tab.label === openMenu);
            if (!activeTab?.children) return null;
            return (
              <div
                ref={menuRef}
                style={{ left: menuLeft }}
                className="fixed bottom-full mb-3 w-44 origin-bottom -translate-x-1/2 animate-fadeUp overflow-hidden rounded-xl border border-gold/40 bg-panel2 shadow-[0_-8px_30px_rgba(0,0,0,0.45)]"
              >
                {activeTab.children.map((child) => {
                  const ChildIcon = child.icon;
                  const content = (
                    <>
                      <ChildIcon className="h-4 w-4 shrink-0 text-goldLight" />
                      <span className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">
                        {child.label}
                      </span>
                    </>
                  );
                  if (child.href) {
                    return (
                      <Link
                        key={child.label}
                        href={child.href}
                        prefetch={false}
                        onClick={() => handleChildClick(child)}
                        className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel"
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={child.label}
                      type="button"
                      onClick={() => handleChildClick(child)}
                      className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            );
          })()}
      </nav>

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </>
  );
}
