export type NotificationCategory =
  | "transaction"
  | "launch"
  | "liquidity"
  | "nft"
  | "reward"
  | "system";

export type NotificationSeed = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timeAgo: string;
  href?: string;
  read: boolean;
};

export const notificationCategories: { id: NotificationCategory; label: string }[] = [
  { id: "transaction", label: "Transactions" },
  { id: "launch", label: "Launches" },
  { id: "liquidity", label: "Liquidity" },
  { id: "nft", label: "NFTs" },
  { id: "reward", label: "Rewards" },
  { id: "system", label: "Announcements" },
];
