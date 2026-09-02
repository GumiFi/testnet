import type { IconProps } from "./types";

export default function EyeOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        d="M9.9 10.1a2.75 2.75 0 003.9 3.9M7.4 7.37A15.4 15.4 0 002.5 12s3.5 6.5 9.5 6.5a9.9 9.9 0 004.6-1.13M10.6 5.67A10.6 10.6 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 01-3.4 4.13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.5 3.5l17 17" strokeLinecap="round" />
    </svg>
  );
}
