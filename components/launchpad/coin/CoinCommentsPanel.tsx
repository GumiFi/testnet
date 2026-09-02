"use client";

import { MessageIcon, SendIcon } from "@/components/icons";

export default function CoinCommentsPanel({
  commentCount,
  onAction,
}: {
  commentCount: number;
  onAction: (label: string) => void;
}) {
  return (
    <div className="border border-t-0 border-line">
      {commentCount === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <MessageIcon className="h-6 w-6 text-bronze" />
          <p className="font-mono text-xs uppercase tracking-wider2 text-bronze">No comments yet</p>
          <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze/70">Be the first to say gm</p>
        </div>
      ) : (
        <p className="px-4 py-6 text-center font-mono text-[10px] uppercase tracking-wider2 text-bronze">
          {commentCount} comments · connect a wallet to view the thread
        </p>
      )}
      <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        <MessageIcon className="h-4 w-4 shrink-0 text-bronze" />
        <input
          type="text"
          placeholder="Add a comment..."
          onFocus={() => onAction("Comments")}
          className="w-full bg-transparent font-body text-xs text-ivory placeholder:text-bronze/70 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onAction("Comments")}
          aria-label="Post comment"
          className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
        >
          <SendIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
