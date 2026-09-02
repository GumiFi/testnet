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

export const seedNotifications: NotificationSeed[] = [
  {
    id: "note-1",
    category: "transaction",
    title: "Swap Completed",
    message: "Your swap of 12.5 ETH for 48,210.34 GUMI confirmed on Giwa Testnet.",
    timeAgo: "2 min ago",
    href: "/swap/tx/tx-1",
    read: false,
  },
  {
    id: "note-2",
    category: "reward",
    title: "Booster Activated",
    message: "Your 2x liquidity mining booster is now active for the next 14 days.",
    timeAgo: "18 min ago",
    href: "/profile",
    read: false,
  },
  {
    id: "note-3",
    category: "launch",
    title: "New Token Launched",
    message: "KING just launched on Gumifi Launchpad and is live on the bonding curve.",
    timeAgo: "41 min ago",
    href: "/launchpad/coin/coin-0",
    read: false,
  },
  {
    id: "note-4",
    category: "nft",
    title: "NFT Sold",
    message: "Your Obsidian Vault #042 sold for 2.4 ETH on the marketplace.",
    timeAgo: "1 hr ago",
    href: "/nft/marketplace",
    read: false,
  },
  {
    id: "note-5",
    category: "liquidity",
    title: "Liquidity Position Updated",
    message: "Your GUMI / ETH position earned $128.40 in fees over the last 24 hours.",
    timeAgo: "3 hr ago",
    href: "/liquidity",
    read: false,
  },
  {
    id: "note-6",
    category: "transaction",
    title: "Swap Failed",
    message: "Your swap of 3.0 ETH to NOVA failed — price impact exceeded your slippage tolerance.",
    timeAgo: "5 hr ago",
    href: "/swap",
    read: true,
  },
  {
    id: "note-7",
    category: "system",
    title: "Scheduled Maintenance",
    message: "Gumifi Ecosystem will undergo brief maintenance on the Giwa Testnet relayer tonight.",
    timeAgo: "9 hr ago",
    read: true,
  },
  {
    id: "note-8",
    category: "launch",
    title: "Bonding Curve Milestone",
    message: "MOON reached 75% of its bonding curve target market cap.",
    timeAgo: "14 hr ago",
    href: "/launchpad",
    read: true,
  },
  {
    id: "note-9",
    category: "reward",
    title: "Daily Quest Reward",
    message: "You earned 240 GUMI points for providing liquidity today.",
    timeAgo: "Yesterday",
    href: "/profile",
    read: true,
  },
  {
    id: "note-10",
    category: "nft",
    title: "New Bid Received",
    message: "Someone placed a 1.8 ETH bid on your Astra Relic #017.",
    timeAgo: "Yesterday",
    href: "/nft/marketplace",
    read: true,
  },
  {
    id: "note-11",
    category: "liquidity",
    title: "Position Locked",
    message: "Your ETH / GUMI position is now locked for 90 days with a 2.5x APR boost.",
    timeAgo: "2 days ago",
    href: "/liquidity",
    read: true,
  },
  {
    id: "note-12",
    category: "system",
    title: "New Whitepaper Version",
    message: "Gumifi Whitepaper v3.2 is now live with updated tokenomics.",
    timeAgo: "3 days ago",
    href: "/whitepaper",
    read: true,
  },
  {
    id: "note-13",
    category: "transaction",
    title: "Swap Completed",
    message: "Your swap of 500 USDC for 0.118 ETH confirmed on Giwa Testnet.",
    timeAgo: "4 days ago",
    href: "/swap/tx/tx-2",
    read: true,
  },
  {
    id: "note-14",
    category: "launch",
    title: "Token Graduated",
    message: "GEUM graduated from the Launchpad and now trades directly on the Dex.",
    timeAgo: "1 week ago",
    href: "/dex",
    read: true,
  },
  {
    id: "note-15",
    category: "reward",
    title: "Referral Bonus",
    message: "You earned a referral bonus after a friend completed their first swap.",
    timeAgo: "1 week ago",
    href: "/profile",
    read: true,
  },
  {
    id: "note-16",
    category: "system",
    title: "Security Notice",
    message: "Always verify contract addresses before importing a custom token into Swap.",
    timeAgo: "2 weeks ago",
    read: true,
  },
];
