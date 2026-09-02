import type { IconProps } from "./types";

export default function FrameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5-6 6M11 21l-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
