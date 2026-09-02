import type { IconProps } from "./types";

export default function PieIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M12 3a9 9 0 1 0 9 9h-9Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3a9 9 0 0 1 9 9h-9Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
