export function formatCompactUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

export function formatPrice(value: number): string {
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatEth(value: number): string {
  const amount = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `${amount} ETH`;
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatSignedUsd(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type PriceDisplayParts = {
  plain: string;
  leadingZeros: number | null;
  digits: string;
};

export function getPriceDisplayParts(value: number): PriceDisplayParts {
  if (!Number.isFinite(value) || value <= 0) {
    return { plain: "$0.00", leadingZeros: null, digits: "" };
  }
  if (value >= 1) {
    return { plain: `$${value.toFixed(2)}`, leadingZeros: null, digits: "" };
  }

  const fixed = value.toFixed(12);
  const afterDecimal = fixed.split(".")[1] ?? "";
  let zeroCount = 0;
  while (zeroCount < afterDecimal.length && afterDecimal[zeroCount] === "0") {
    zeroCount++;
  }

  if (zeroCount < 3) {
    return {
      plain: value >= 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(6)}`,
      leadingZeros: null,
      digits: "",
    };
  }

  const digits = afterDecimal.slice(zeroCount, zeroCount + 4);
  return { plain: "", leadingZeros: zeroCount - 1, digits };
}

export type EthPriceDisplayParts = {
  plain: string;
  leadingZeros: number | null;
  digits: string;
};

export function getEthPriceDisplayParts(value: number): EthPriceDisplayParts {
  if (!Number.isFinite(value) || value <= 0) {
    return { plain: "0.00 ETH", leadingZeros: null, digits: "" };
  }
  if (value >= 1) {
    return { plain: `${value.toFixed(4)} ETH`, leadingZeros: null, digits: "" };
  }

  const fixed = value.toFixed(14);
  const afterDecimal = fixed.split(".")[1] ?? "";
  let zeroCount = 0;
  while (zeroCount < afterDecimal.length && afterDecimal[zeroCount] === "0") {
    zeroCount++;
  }

  if (zeroCount < 3) {
    return {
      plain: value >= 0.0001 ? `${value.toFixed(6)} ETH` : `${value.toFixed(8)} ETH`,
      leadingZeros: null,
      digits: "",
    };
  }

  const digits = afterDecimal.slice(zeroCount, zeroCount + 4);
  return { plain: "", leadingZeros: zeroCount - 1, digits };
}

export function formatTradeUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  if (value >= 1_000) return formatCompactUsd(value);
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

export function formatBalance(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString("en-US");
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
