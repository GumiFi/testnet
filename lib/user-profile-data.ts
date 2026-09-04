import type { Accent } from "./discover-data";

export type UserProfile = {
  address: string;
  name: string;
  monogram: string;
  accent: Accent;
};

const WALLET_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isWalletAddress(value: string): boolean {
  return WALLET_ADDRESS_RE.test(value.trim());
}

export function normalizeAddressParam(param: string): string | null {
  let decoded = param;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    decoded = param;
  }
  const trimmed = decoded.trim();
  return isWalletAddress(trimmed) ? trimmed.toLowerCase() : null;
}

export function handleToSlug(handle: string): string {
  return handle.replace(/^@/, "");
}

function monogramFor(address: string): string {
  return address.slice(2, 4).toUpperCase();
}

function accentFor(address: string): Accent {
  const accents: Accent[] = ["gold", "emerald", "garnet"];
  const lastChar = address.slice(-1).toLowerCase();
  const index = parseInt(lastChar, 16);
  return accents[Number.isFinite(index) ? index % accents.length : 0];
}

export function getWalletProfile(address: string): UserProfile {
  const normalized = address.toLowerCase();
  return {
    address: normalized,
    name: `${normalized.slice(0, 6)}…${normalized.slice(-4)}`,
    monogram: monogramFor(normalized),
    accent: accentFor(normalized),
  };
}

export type UserActivityItem = {
  id: string;
  description: string;
  timeAgo: string;
};
