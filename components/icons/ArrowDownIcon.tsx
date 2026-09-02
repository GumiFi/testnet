import type { IconProps } from "./types";

export default function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 19l-6-7h4V5h4v7h4l-6 7Z" />
    </svg>
  );
}
