"use client";

import { useState, type MouseEvent } from "react";

type Ripple = { id: number; x: number; y: number };

function TradeButton({
  label,
  symbol,
  textClass,
  bgClass,
  hoverBgClass,
  borderClass,
  rippleClass,
  ringClass,
  onClick,
}: {
  label: string;
  symbol: string;
  textClass: string;
  bgClass: string;
  hoverBgClass: string;
  borderClass: string;
  rippleClass: string;
  ringClass: string;
  onClick: () => void;
}) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [popKey, setPopKey] = useState(0);
  const [pressed, setPressed] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 500);
    setPopKey((value) => value + 1);
    setPressed(true);
    window.setTimeout(() => setPressed(false), 260);
    onClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      key={popKey}
      className={`relative flex items-center justify-center gap-1.5 overflow-hidden rounded-md border ${borderClass} ${bgClass} py-2 transition-shadow duration-300 ${hoverBgClass} active:scale-90 animate-popBounce ${pressed ? ringClass : "shadow-none"}`}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={`pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${rippleClass} animate-ripple`}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      <span className={`relative font-display text-xs uppercase tracking-wider2 ${textClass}`}>{label}</span>
      <span className="relative font-mono text-[9px] uppercase tracking-wider2 text-ivory/60">${symbol}</span>
    </button>
  );
}

export default function CoinTradeButtons({
  symbol,
  onBuy,
  onSell,
}: {
  symbol: string;
  onBuy: () => void;
  onSell: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <TradeButton
        label="Buy"
        symbol={symbol}
        textClass="text-emeraldLight"
        bgClass="bg-emerald"
        hoverBgClass="hover:bg-emeraldLight/25"
        borderClass="border-emeraldLight"
        rippleClass="bg-emeraldLight/50"
        ringClass="shadow-[0_0_0_3px_rgba(232,199,102,0.35)]"
        onClick={onBuy}
      />
      <TradeButton
        label="Sell"
        symbol={symbol}
        textClass="text-garnetLight"
        bgClass="bg-garnet"
        hoverBgClass="hover:bg-garnetLight/25"
        borderClass="border-garnetLight"
        rippleClass="bg-garnetLight/50"
        ringClass="shadow-[0_0_0_3px_rgba(232,199,102,0.35)]"
        onClick={onSell}
      />
    </div>
  );
}
