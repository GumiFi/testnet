"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNotifications } from "./notification-context";

export const GIWA_EXPLORER_TX_URL = "https://explorer.giwa.io/tx";

export type TransactionKind = "swap" | "liquidity" | "launch" | "nft";
export type TransactionStatus = "pending" | "confirming" | "success" | "failed";

export type TransactionRecord = {
  id: string;
  kind: TransactionKind;
  title: string;
  subtitle?: string;
  status: TransactionStatus;
  txHash: string;
  blockNumber: number | null;
  createdAt: number;
};

export type SubmitTransactionInput = {
  kind: TransactionKind;
  title: string;
  subtitle?: string;
};

type TransactionContextValue = {
  transactions: TransactionRecord[];
  submitTransaction: (input: SubmitTransactionInput) => string;
  dismissTransaction: (id: string) => void;
};

const TransactionContext = createContext<TransactionContextValue | null>(null);

const CONFIRMING_DELAY_MS = 900;
const SETTLE_DELAY_MS = 2500;
const SUCCESS_AUTO_DISMISS_MS = 6000;
const SUCCESS_RATE = 0.88;

const TRANSACTION_NOTIFICATION_META: Record<
  TransactionKind,
  { success: string; failed: string; href: string }
> = {
  swap: { success: "Swap Completed", failed: "Swap Failed", href: "/swap/history" },
  liquidity: {
    success: "Liquidity Updated",
    failed: "Liquidity Transaction Failed",
    href: "/liquidity",
  },
  launch: { success: "Token Launched", failed: "Token Launch Failed", href: "/launchpad" },
  nft: {
    success: "NFT Transaction Completed",
    failed: "NFT Transaction Failed",
    href: "/nft/marketplace",
  },
};

let transactionIdSeed = 0;
function nextTransactionId(): string {
  transactionIdSeed += 1;
  return `tx-live-${Date.now().toString(36)}-${transactionIdSeed}`;
}

function randomHex(length: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function randomBlockNumber(): number {
  return 4_900_000 + Math.floor(Math.random() * 40_000);
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const { addNotification } = useNotifications();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const dismissTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const submitTransaction = useCallback(
    (input: SubmitTransactionInput) => {
      const id = nextTransactionId();
      const record: TransactionRecord = {
        id,
        kind: input.kind,
        title: input.title,
        subtitle: input.subtitle,
        status: "pending",
        txHash: `0x${randomHex(64)}`,
        blockNumber: null,
        createdAt: Date.now(),
      };

      setTransactions((prev) => [record, ...prev]);

      const confirmingTimer = window.setTimeout(() => {
        setTransactions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: "confirming" } : item))
        );
      }, CONFIRMING_DELAY_MS);
      timers.current.push(confirmingTimer);

      const settleTimer = window.setTimeout(() => {
        const isSuccess = Math.random() < SUCCESS_RATE;
        const finalStatus: TransactionStatus = isSuccess ? "success" : "failed";
        const blockNumber = isSuccess ? randomBlockNumber() : null;

        setTransactions((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: finalStatus, blockNumber } : item
          )
        );

        const meta = TRANSACTION_NOTIFICATION_META[input.kind];
        addNotification({
          category: "transaction",
          title: isSuccess ? meta.success : meta.failed,
          message: input.subtitle ? `${input.title} — ${input.subtitle}` : input.title,
          href: meta.href,
        });

        if (isSuccess) {
          const dismissTimer = window.setTimeout(() => {
            setTransactions((prev) => prev.filter((item) => item.id !== id));
          }, SUCCESS_AUTO_DISMISS_MS);
          timers.current.push(dismissTimer);
        }
      }, SETTLE_DELAY_MS);
      timers.current.push(settleTimer);

      return id;
    },
    [addNotification]
  );

  const value = useMemo<TransactionContextValue>(
    () => ({ transactions, submitTransaction, dismissTransaction }),
    [transactions, submitTransaction, dismissTransaction]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return ctx;
}
