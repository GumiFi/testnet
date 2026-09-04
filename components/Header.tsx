"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import HeaderSearch from "./HeaderSearch";
import ComingSoonModal from "./ComingSoonModal";
import GumiBadge from "./GumiBadge";
import { useWallet } from "@/lib/wallet-context";
import { useNotifications } from "@/lib/notification-context";
import WalletDropdown from "./WalletDropdown";
import NotificationPanel from "./NotificationPanel";
import {
  CompassIcon,
  DocIcon,
  RocketIcon,
  ChartIcon,
  SwapIcon,
  FrameIcon,
  PlusIcon,
  GridIcon,
  SearchIcon,
  BellIcon,
  CloseIcon,
  ChevronDownIcon,
  type IconProps,
} from "./icons";

type NavChild = {
  label: string;
  href: string;
  icon: (props: IconProps) => JSX.Element;
};

type NavItem = {
  label: string;
  href?: string;
  icon: (props: IconProps) => JSX.Element;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { label: "Discover", href: "/", icon: CompassIcon },
  { label: "Whitepaper", href: "/whitepaper", icon: DocIcon },
  { label: "Launchpad", href: "/launchpad", icon: RocketIcon },
  { label: "Dex", href: "/dex", icon: ChartIcon },
  { label: "Swap", href: "/swap", icon: SwapIcon },
  {
    label: "NFTs",
    icon: FrameIcon,
    children: [
      { label: "Create NFT", href: "/nft/create", icon: PlusIcon },
      { label: "Marketplace", href: "/nft/marketplace", icon: GridIcon },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [nftMenuOpen, setNftMenuOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [mobileNftOpen, setMobileNftOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  const { isConnected, handle, isGumiHolder, connect } = useWallet();
  const { unreadCount } = useNotifications();
  const walletRef = useRef<HTMLDivElement>(null);
  const nftMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (walletMenuOpen && !walletRef.current?.contains(target)) {
        setWalletMenuOpen(false);
      }
      if (nftMenuOpen && !nftMenuRef.current?.contains(target)) {
        setNftMenuOpen(false);
      }
      if (notifPanelOpen && !notifRef.current?.contains(target)) {
        setNotifPanelOpen(false);
      }
      if (
        open &&
        !mobileMenuRef.current?.contains(target) &&
        !mobileMenuButtonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setWalletMenuOpen(false);
        setNftMenuOpen(false);
        setNotifPanelOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [walletMenuOpen, nftMenuOpen, notifPanelOpen, open]);

  useEffect(() => {
    if (!open) setMobileNftOpen(false);
  }, [open]);

  function toggleSearch() {
    setWalletMenuOpen(false);
    setNftMenuOpen(false);
    setNotifPanelOpen(false);
    setSearchOpen((value) => !value);
  }

  function toggleWalletMenu() {
    setSearchOpen(false);
    setNftMenuOpen(false);
    setNotifPanelOpen(false);
    setWalletMenuOpen((value) => !value);
  }

  function toggleNftMenu() {
    setSearchOpen(false);
    setWalletMenuOpen(false);
    setNotifPanelOpen(false);
    setNftMenuOpen((value) => !value);
  }

  function toggleNotifPanel() {
    setSearchOpen(false);
    setWalletMenuOpen(false);
    setNftMenuOpen(false);
    setNotifPanelOpen((value) => !value);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-void/90 backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              ref={mobileMenuButtonRef}
              className="group flex h-9 w-9 items-center justify-center border border-gold/40 bg-panel/60 transition-all duration-300 hover:border-gold hover:bg-gold/10 md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Open menu"
            >
              <span className="flex flex-col items-end gap-[5px]">
                <span className="h-px w-5 bg-goldLight transition-all duration-300 group-hover:w-4" />
                <span className="h-px w-3.5 bg-gold transition-all duration-300 group-hover:w-5" />
                <span className="h-px w-5 bg-goldLight transition-all duration-300 group-hover:w-4" />
              </span>
            </button>
            <Link href="/" prefetch={false} className="flex items-center">
              <Logo className="h-9 w-auto" />
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} ref={nftMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={toggleNftMenu}
                      aria-haspopup="true"
                      aria-expanded={nftMenuOpen}
                      className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider2 text-goldLight transition-colors"
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={`h-3 w-3 transition-transform ${nftMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {nftMenuOpen && (
                      <div className="absolute left-1/2 top-full z-40 mt-3 w-44 -translate-x-1/2 border border-gold/40 bg-panel shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              prefetch={false}
                              onClick={() => setNftMenuOpen(false)}
                              className="flex items-center gap-2.5 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-panel2"
                            >
                              <ChildIcon className="h-3.5 w-3.5 shrink-0 text-goldLight" />
                              <span className="font-mono text-[10px] uppercase tracking-wider2 text-ivory">
                                {child.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
                  className="font-mono text-xs uppercase tracking-wider2 text-goldLight"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="font-mono text-xs uppercase tracking-wider2 text-bronze"
                >
                  {item.label}
                </span>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              className={`flex h-8 w-8 items-center justify-center border text-bronze transition-colors hover:border-gold hover:text-goldLight ${
                searchOpen ? "border-gold text-goldLight" : "border-line"
              }`}
              onClick={toggleSearch}
              aria-label="Search"
            >
              <SearchIcon className="h-3.5 w-3.5" />
            </button>

            <div ref={notifRef} className="relative inline-block">
              <button
                className={`relative flex h-8 w-8 items-center justify-center border text-bronze transition-colors hover:border-gold hover:text-goldLight ${
                  notifPanelOpen ? "border-gold text-goldLight" : "border-line"
                }`}
                onClick={toggleNotifPanel}
                aria-label="Notifications"
                aria-haspopup="true"
                aria-expanded={notifPanelOpen}
              >
                <BellIcon className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-garnetLight px-1 font-mono text-[8.5px] leading-none text-ivory">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifPanelOpen && (
                <NotificationPanel onClose={() => setNotifPanelOpen(false)} />
              )}
            </div>

            {isConnected ? (
              <div ref={walletRef} className="relative inline-block">
                <button
                  onClick={toggleWalletMenu}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-goldDim/25 via-panel2 to-goldDim/25 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight shadow-[0_0_5px_rgba(201,162,39,0.35)] ring-1 ring-inset ring-gold/50 transition-shadow hover:shadow-[0_0_10px_rgba(201,162,39,0.5)]"
                >
                  <span className="max-w-[140px] truncate">{handle}</span>
                  {isGumiHolder && <GumiBadge />}
                  <ChevronDownIcon className="h-3 w-3 shrink-0" />
                </button>
                {walletMenuOpen && <WalletDropdown onClose={() => setWalletMenuOpen(false)} />}
              </div>
            ) : (
              <button
                onClick={connect}
                className="border border-gold px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <HeaderSearch onClose={() => setSearchOpen(false)} onAction={setComingSoon} />
      )}

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fadeIn bg-void/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            className="relative flex h-full w-[280px] animate-slideInLeft flex-col border-r border-line bg-panel"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <Link
                href="/"
                prefetch={false}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3"
              >
                <Logo className="h-8 w-auto" />
                <span className="font-display text-xs tracking-wider3 text-ivory">
                  GUMIFI ECOSYSTEM
                </span>
              </Link>
              <button
                className="flex h-8 w-8 items-center justify-center border border-line text-ivory transition-colors hover:border-gold hover:text-goldLight"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase tracking-wider2">
                      {item.label}
                    </span>
                  </>
                );

                if (item.children) {
                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() => setMobileNftOpen((value) => !value)}
                        aria-expanded={mobileNftOpen}
                        className="flex w-full items-center justify-between gap-3 px-6 py-3 text-goldLight transition-colors hover:bg-panel2"
                      >
                        <span className="flex items-center gap-3">{content}</span>
                        <ChevronDownIcon
                          className={`h-3 w-3 shrink-0 transition-transform ${
                            mobileNftOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileNftOpen && (
                        <div className="flex flex-col border-t border-line bg-void/40 py-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                prefetch={false}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 py-2.5 pl-14 pr-6 text-bronze transition-colors hover:bg-panel2 hover:text-goldLight"
                              >
                                <ChildIcon className="h-3.5 w-3.5" />
                                <span className="font-mono text-[11px] uppercase tracking-wider2">
                                  {child.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-6 py-3 text-goldLight transition-colors hover:bg-panel2"
                  >
                    {content}
                  </Link>
                ) : (
                  <span
                    key={item.label}
                    className="flex cursor-default items-center gap-3 px-6 py-3 text-bronze"
                  >
                    {content}
                  </span>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {comingSoon && <ComingSoonModal label={comingSoon} onClose={() => setComingSoon(null)} />}
    </>
  );
}
