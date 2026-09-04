export type PortfolioSnapshot = { timestampMs: number; valueUsd: number };

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;
const MAX_SNAPSHOTS = 500;

function storageKey(address: string): string {
  return `gumifi.portfolioHistory.${address.toLowerCase()}`;
}

export function loadPortfolioHistory(address: string): PortfolioSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PortfolioSnapshot =>
        typeof item?.timestampMs === "number" && typeof item?.valueUsd === "number"
    );
  } catch {
    return [];
  }
}

export function recordPortfolioSnapshot(address: string, valueUsd: number): PortfolioSnapshot[] {
  if (typeof window === "undefined") return [];
  const existing = loadPortfolioHistory(address);
  const now = Date.now();
  const last = existing[existing.length - 1];
  const next: PortfolioSnapshot[] =
    last && now - last.timestampMs < SNAPSHOT_INTERVAL_MS
      ? [...existing.slice(0, -1), { timestampMs: now, valueUsd }]
      : [...existing, { timestampMs: now, valueUsd }];
  const trimmed = next.slice(-MAX_SNAPSHOTS);
  try {
    window.localStorage.setItem(storageKey(address), JSON.stringify(trimmed));
  } catch {}
  return trimmed;
}

export function filterHistoryByRange(
  history: PortfolioSnapshot[],
  rangeMs: number | null
): PortfolioSnapshot[] {
  if (rangeMs === null) return history;
  const cutoff = Date.now() - rangeMs;
  return history.filter((point) => point.timestampMs >= cutoff);
}

export function computeChangePct(history: PortfolioSnapshot[], currentValueUsd: number): number {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const baseline = [...history].reverse().find((point) => point.timestampMs <= dayAgo);
  if (!baseline || baseline.valueUsd === 0) return 0;
  return ((currentValueUsd - baseline.valueUsd) / baseline.valueUsd) * 100;
}
