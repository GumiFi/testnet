import type { IconProps } from "./types";

export default function FlameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.4-2-1-3 1.5 1 3 3 3 6a8 8 0 1 1-16 0c0-4 2.5-6 4-8 .5 2 1 3 2 3 0-2-.5-3.5 2-5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
