import type { IconProps } from "./types";

export default function CoinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M12 7v10M9.5 9.5c0-1.4 1.2-2.5 2.5-2.5 1.6 0 2.7 1 2.7 2.1 0 1.3-1 1.9-2.7 2.4-1.7.5-2.7 1.1-2.7 2.4 0 1.1 1.1 2.1 2.7 2.1 1.3 0 2.5-1.1 2.5-2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
