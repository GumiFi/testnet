import type { IconProps } from "./types";

export default function RocketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M8 16c-2 1-3 3-3 6 3 0 5-1 6-3M16 16c2 1 3 3 3 6-3 0-5-1-6-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
