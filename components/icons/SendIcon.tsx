import type { IconProps } from "./types";

export default function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M21 3 3 10.5l6.5 2.5L21 3Zm0 0-8 15-2.5-6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
