"use client";

import { useMemo, useState } from "react";
import {
  BellIcon,
  SwapIcon,
  RocketIcon,
  DropletIcon,
  FrameIcon,
  StarIcon,
  FlagIcon,
  type IconProps,
} from "@/components/icons";
import { useNotifications } from "@/lib/notification-context";
import { notificationCategories, type NotificationCategory } from "@/lib/notifications-data";
import NotificationRow from "@/components/NotificationRow";

const CATEGORY_ICONS: Record<NotificationCategory, (props: IconProps) => JSX.Element> = {
  transaction: SwapIcon,
  launch: RocketIcon,
  liquidity: DropletIcon,
  nft: FrameIcon,
  reward: StarIcon,
  system: FlagIcon,
};

type FilterOption = "all" | NotificationCategory;

export default function NotificationCenterApp() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState<FilterOption>("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? notifications : notifications.filter((item) => item.category === filter),
    [notifications, filter]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="flex items-center gap-2">
        <BellIcon className="h-5 w-5 text-goldLight" />
        <h1 className="font-display text-xl uppercase tracking-wider2 text-ivory text-shadow-gold">
          Notification Center
        </h1>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
        {unreadCount === 0
          ? "You are all caught up"
          : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
              filter === "all"
                ? "border-gold bg-gold/10 text-goldLight"
                : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
            }`}
          >
            All
          </button>
          {notificationCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const isActive = filter === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilter(category.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition-colors ${
                  isActive
                    ? "border-gold bg-gold/10 text-goldLight"
                    : "border-line text-bronze hover:border-gold/40 hover:text-ivory"
                }`}
              >
                <Icon className="h-3 w-3" />
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:text-gold"
            >
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:text-garnetLight"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 border border-line bg-panel">
        {filtered.length === 0 ? (
          <p className="px-4 py-14 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
            No notifications in this category
          </p>
        ) : (
          filtered.map((item, index) => (
            <NotificationRow
              key={item.id}
              item={item}
              isLast={index === filtered.length - 1}
              onSelect={() => markAsRead(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
