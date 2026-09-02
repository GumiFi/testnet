"use client";

import { useTransactions } from "@/lib/transaction-context";
import TransactionTrayCard from "./TransactionTrayCard";

const TRAY_LIMIT = 4;

export default function TransactionTray() {
  const { transactions, dismissTransaction } = useTransactions();

  if (transactions.length === 0) return null;

  const visible = transactions.slice(0, TRAY_LIMIT);

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 flex flex-col-reverse gap-3 md:inset-x-auto md:bottom-6 md:right-6 md:w-96">
      {visible.map((transaction) => (
        <TransactionTrayCard
          key={transaction.id}
          transaction={transaction}
          onDismiss={() => dismissTransaction(transaction.id)}
        />
      ))}
    </div>
  );
}
