import type { IconProps } from "./types";

export default function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 4 14h6l-1 8 10-14h-6l1-6Z" />
    </svg>
  );
}
