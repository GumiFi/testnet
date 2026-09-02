"use client";

import Link from "next/link";
import {
  SwapIcon,
  RocketIcon,
  DropletIcon,
  FrameIcon,
  StarIcon,
  FlagIcon,
  type IconProps,
} from "@/components/icons";
import type { NotificationItem } from "@/lib/notification-context";
import type { NotificationCategory } from "@/lib/notifications-data";

const CATEGORY_ICON: Record<NotificationCategory, (props: IconProps) => JSX.Element> = {
  transaction: SwapIcon,
  launch: RocketIcon,
  liquidity: DropletIcon,
  nft: FrameIcon,
  reward: StarIcon,
  system: FlagIcon,
};

const CATEGORY_COLOR: Record<NotificationCategory, string> = {
  transaction: "border-gold/50 text-goldLight",
  launch: "border-gold/50 text-goldLight",
  liquidity: "border-emeraldLight/50 text-emeraldLight",
  nft: "border-gold/50 text-goldLight",
  reward: "border-gold/50 text-goldLight",
  system: "border-bronze/50 text-bronze",
};

export default function NotificationRow({
  item,
  isLast = false,
  onSelect,
}: {
  item: NotificationItem;
  isLast?: boolean;
  onSelect?: () => void;
}) {
  const Icon = CATEGORY_ICON[item.category];
  const colorClass = CATEGORY_COLOR[item.category];

  const content = (
    <div
      className={`flex items-start gap-3 px-3.5 py-3 text-left transition-colors hover:bg-panel2 ${
        isLast ? "" : "border-b border-line"
      } ${item.read ? "" : "bg-gold/5"}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center border ${colorClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-goldLight" />}
          <p className="truncate font-display text-xs uppercase tracking-wider2 text-ivory">
            {item.title}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-bronze">
          {item.message}
        </p>
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider2 text-bronze/70">
          {item.timeAgo}
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} prefetch={false} onClick={onSelect} className="block">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onSelect} className="block w-full">
      {content}
    </button>
  );
}
