import type { IconProps } from "./types";

export default function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M5 5l14 14M19 5 5 19" strokeLinecap="round" />
    </svg>
  );
}
