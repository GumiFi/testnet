"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/notification-context";
import NotificationRow from "./NotificationRow";

const PANEL_LIMIT = 8;

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const recent = notifications.slice(0, PANEL_LIMIT);

  function handleSelect(id: string) {
    markAsRead(id);
    onClose();
  }

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-gold/40 bg-panel shadow-[0_20px_40px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-3">
        <p className="font-display text-xs uppercase tracking-wider2 text-ivory">Notifications</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="font-mono text-[9px] uppercase tracking-wider2 text-goldLight transition-colors hover:text-gold"
          >
            Mark All Read
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="px-4 py-10 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze">
          No notifications yet
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto overscroll-contain">
          {recent.map((item, index) => (
            <NotificationRow
              key={item.id}
              item={item}
              isLast={index === recent.length - 1}
              onSelect={() => handleSelect(item.id)}
            />
          ))}
        </div>
      )}

      <Link
        href="/notifications"
        prefetch={false}
        onClick={onClose}
        className="block border-t border-line px-3.5 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-panel2"
      >
        View All Notifications
      </Link>
    </div>
  );
}
