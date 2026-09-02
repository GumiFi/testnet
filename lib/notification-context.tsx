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
  seedNotifications,
  type NotificationCategory,
  type NotificationSeed,
} from "./notifications-data";

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

function seedWithTimestamps(): NotificationItem[] {
  const now = Date.now();
  return seedNotifications.map((item, index) => ({
    ...item,
    createdAt: now - (index + 1) * 60_000,
  }));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(seedWithTimestamps);

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
    setNotifications((prev) => [item, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
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
