import type { IconProps } from "./types";

export default function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 5l6 7h-4v7h-4v-7H6l6-7Z" />
    </svg>
  );
}
