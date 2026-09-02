import type { IconProps } from "./types";

export default function CrownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M4 18h16l1-9-5 3-4-6-4 6-5-3 1 9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
