export type TokenStandard = "standard" | "antiWhale" | "reflection" | "deflationary" | "liquidityGenerator";

export type TeamAllocationRow = {
  id: string;
  wallet: string;
  percent: string;
  cliffDays: string;
  vestingDays: string;
};

export type AllocationRow = {
  id: string;
  label: string;
  pct: number;
  color: string;
};

export type AdvancedTokenGeneratorValue = {
  tokenStandard: TokenStandard;
  mintable: boolean;
  maxSupplyCap: string;
  burnable: boolean;
  pausable: boolean;
  limitsEnabled: boolean;
  maxTxPct: number;
  maxWalletPct: number;
  buyTaxPct: number;
  sellTaxPct: number;
  transferTaxPct: number;
  liquidityFeeShare: number;
  marketingFeeShare: number;
  reflectionFeeShare: number;
  burnFeeShare: number;
  devFeeShare: number;
  marketingWallet: string;
  devWallet: string;
  treasuryWallet: string;
  autoLiquidity: boolean;
  antiBotEnabled: boolean;
  blacklistBots: boolean;
  cooldownSeconds: number;
  launchProtectionBlocks: number;
  renounceOwnership: boolean;
  timelockEnabled: boolean;
  timelockDelayHours: number;
  blacklistFunction: boolean;
  initialLiquidityEth: string;
  lockLiquidity: boolean;
  lockDurationDays: number;
  teamRevocable: boolean;
  team: TeamAllocationRow[];
  supplyAllocation: AllocationRow[];
};

export const TOKEN_STANDARDS: { id: TokenStandard; label: string; description: string }[] = [
  {
    id: "standard",
    label: "Standard",
    description: "A plain ERC-20 token with no built-in taxes or reflections.",
  },
  {
    id: "antiWhale",
    label: "Anti-Whale",
    description: "Caps max transaction and max wallet size to slow down whales.",
  },
  {
    id: "reflection",
    label: "Reflection",
    description: "Automatically redistributes a share of every trade to holders.",
  },
  {
    id: "deflationary",
    label: "Deflationary",
    description: "Burns a portion of every transaction, shrinking supply over time.",
  },
  {
    id: "liquidityGenerator",
    label: "Liquidity Generator",
    description: "Routes part of every trade straight back into the liquidity pool.",
  },
];

export const DEFAULT_SUPPLY_ALLOCATION: AllocationRow[] = [
  { id: "liquidity", label: "Liquidity Pool", pct: 35, color: "#C9A227" },
  { id: "founder", label: "Founder & Treasury", pct: 20, color: "#C1615F" },
  { id: "treasury", label: "Reserve Fund", pct: 15, color: "#4CAF7D" },
  { id: "marketing", label: "Marketing & Partners", pct: 15, color: "#E8C766" },
  { id: "community", label: "Community & Airdrop", pct: 15, color: "#8A7148" },
];

export const FEE_SPLIT_META: { id: keyof AdvancedTokenGeneratorValue; label: string; color: string }[] = [
  { id: "liquidityFeeShare", label: "Liquidity", color: "#C9A227" },
  { id: "marketingFeeShare", label: "Marketing", color: "#E8C766" },
  { id: "reflectionFeeShare", label: "Reflection", color: "#4CAF7D" },
  { id: "burnFeeShare", label: "Burn", color: "#C1615F" },
  { id: "devFeeShare", label: "Dev", color: "#8A7148" },
];

export const DEFAULT_ADVANCED_TOKEN: AdvancedTokenGeneratorValue = {
  tokenStandard: "standard",
  mintable: false,
  maxSupplyCap: "",
  burnable: true,
  pausable: false,
  limitsEnabled: false,
  maxTxPct: 2,
  maxWalletPct: 3,
  buyTaxPct: 0,
  sellTaxPct: 0,
  transferTaxPct: 0,
  liquidityFeeShare: 40,
  marketingFeeShare: 30,
  reflectionFeeShare: 0,
  burnFeeShare: 10,
  devFeeShare: 20,
  marketingWallet: "",
  devWallet: "",
  treasuryWallet: "",
  autoLiquidity: true,
  antiBotEnabled: false,
  blacklistBots: false,
  cooldownSeconds: 30,
  launchProtectionBlocks: 3,
  renounceOwnership: false,
  timelockEnabled: false,
  timelockDelayHours: 24,
  blacklistFunction: false,
  initialLiquidityEth: "0.5",
  lockLiquidity: true,
  lockDurationDays: 180,
  teamRevocable: true,
  team: [],
  supplyAllocation: DEFAULT_SUPPLY_ALLOCATION,
};

export function generateMockContractAddress(seed: string): string {
  let hash1 = 0;
  let hash2 = 0;
  const source = `${seed}-${Date.now()}-${Math.random()}`;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    hash1 = (hash1 * 31 + code) >>> 0;
    hash2 = (hash2 * 17 + code + i) >>> 0;
  }
  const hex1 = hash1.toString(16).padStart(8, "0");
  const hex2 = hash2.toString(16).padStart(8, "0");
  const body = `${hex1}${hex2}${hex1}${hex2}${hex1}`.slice(0, 40);
  return `0x${body}`;
}

export function teamAllocationTotalPct(team: TeamAllocationRow[]): number {
  return team.reduce((total, row) => total + (parseFloat(row.percent) || 0), 0);
}

function round1(input: number): number {
  return Math.round(input * 10) / 10;
}

export function rebalanceAllocation(rows: AllocationRow[], changedId: string, rawNext: number): AllocationRow[] {
  const next = Math.min(100, Math.max(0, round1(rawNext)));
  const others = rows.filter((row) => row.id !== changedId);

  if (others.length === 0) {
    return rows.map((row) => (row.id === changedId ? { ...row, pct: 100 } : row));
  }

  const othersTotal = others.reduce((sum, row) => sum + row.pct, 0);
  const remaining = round1(100 - next);

  let updated: AllocationRow[];
  if (othersTotal <= 0) {
    const share = round1(remaining / others.length);
    updated = rows.map((row) => (row.id === changedId ? { ...row, pct: next } : { ...row, pct: share }));
  } else {
    const scale = remaining / othersTotal;
    updated = rows.map((row) =>
      row.id === changedId ? { ...row, pct: next } : { ...row, pct: round1(row.pct * scale) }
    );
  }

  const drift = round1(100 - updated.reduce((sum, row) => sum + row.pct, 0));
  if (drift !== 0) {
    const fixIndex = updated.findIndex((row) => row.id !== changedId);
    if (fixIndex !== -1) {
      updated[fixIndex] = { ...updated[fixIndex], pct: round1(updated[fixIndex].pct + drift) };
    }
  }

  return updated;
}

export function feeSplitRows(value: AdvancedTokenGeneratorValue): AllocationRow[] {
  return FEE_SPLIT_META.map((meta) => ({
    id: meta.id,
    label: meta.label,
    color: meta.color,
    pct: Number(value[meta.id]),
  }));
}

export function applyFeeSplitRows(
  value: AdvancedTokenGeneratorValue,
  rows: AllocationRow[]
): AdvancedTokenGeneratorValue {
  const patch = Object.fromEntries(rows.map((row): [string, number] => [row.id, row.pct]));
  return { ...value, ...patch };
}
