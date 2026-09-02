import type { IconProps } from "./types";

export default function CopyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path d="M15.5 8.5V6.5A1.5 1.5 0 0014 5H6a1.5 1.5 0 00-1.5 1.5V15a1.5 1.5 0 001.5 1.5h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
