import type { IconProps } from "./types";

export default function FilterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M4 5h16L14 13v6l-4 2v-8L4 5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
