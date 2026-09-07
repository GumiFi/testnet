"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type NotificationCategory,
  type NotificationSeed,
} from "./notifications-data";
import { useWallet } from "./wallet-context";
import { useOnchainPortfolio } from "./use-onchain-portfolio";
import { formatTimeAgo, type ActivityEntry } from "./activity-onchain";

export type NotificationItem = NotificationSeed & { createdAt: number };

export type AddNotificationInput = {
  category: NotificationCategory;
  title: string;
  message: string;
  href?: string;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (input: AddNotificationInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

let notificationIdSeed = 0;
function nextNotificationId(): string {
  notificationIdSeed += 1;
  return `note-live-${Date.now().toString(36)}-${notificationIdSeed}`;
}

const ACTIVITY_CATEGORY: Record<ActivityEntry["kind"], NotificationCategory> = {
  launch: "launch",
  collection: "nft",
  "token-in": "transaction",
  "token-out": "transaction",
  "nft-in": "nft",
  "nft-out": "nft",
};

const ACTIVITY_HREF: Record<ActivityEntry["kind"], string> = {
  launch: "/launchpad",
  collection: "/nft/marketplace",
  "token-in": "/swap",
  "token-out": "/swap",
  "nft-in": "/nft/marketplace",
  "nft-out": "/nft/marketplace",
};

const ACTIVITY_TITLE: Record<ActivityEntry["kind"], string> = {
  launch: "Token Launched",
  collection: "Collection Created",
  "token-in": "Tokens Received",
  "token-out": "Tokens Sent",
  "nft-in": "NFT Received",
  "nft-out": "NFT Sent",
};

function activityToNotification(entry: ActivityEntry): NotificationItem {
  return {
    id: entry.id,
    category: ACTIVITY_CATEGORY[entry.kind],
    title: ACTIVITY_TITLE[entry.kind],
    message: entry.description,
    timeAgo: formatTimeAgo(entry.timestampMs),
    href: ACTIVITY_HREF[entry.kind],
    read: true,
    createdAt: entry.timestampMs,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const { activity } = useOnchainPortfolio(address);
  const [liveNotifications, setLiveNotifications] = useState<NotificationItem[]>([]);
  const [dismissedActivityIds, setDismissedActivityIds] = useState<Set<string>>(new Set());

  const activityNotifications = useMemo(
    () => activity.filter((entry) => !dismissedActivityIds.has(entry.id)).map(activityToNotification),
    [activity, dismissedActivityIds]
  );

  const notifications = useMemo(
    () => [...liveNotifications, ...activityNotifications].sort((a, b) => b.createdAt - a.createdAt),
    [liveNotifications, activityNotifications]
  );

  const addNotification = useCallback((input: AddNotificationInput) => {
    const item: NotificationItem = {
      id: nextNotificationId(),
      category: input.category,
      title: input.title,
      message: input.message,
      href: input.href,
      timeAgo: "Just now",
      read: false,
      createdAt: Date.now(),
    };
    setLiveNotifications((prev) => [item, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setLiveNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setLiveNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setLiveNotifications([]);
    setDismissedActivityIds((prev) => {
      const next = new Set(prev);
      activity.forEach((entry) => next.add(entry.id));
      return next;
    });
  }, [activity]);

  const unreadCount = useMemo(
    () => liveNotifications.filter((item) => !item.read).length,
    [liveNotifications]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
