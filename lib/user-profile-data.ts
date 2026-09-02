import { creators, type Accent, type Creator } from "./discover-data";

export type UserProfile = Creator & {
  address: string;
  bio: string;
  joined: string;
  followers: number;
};

export type UserAsset = {
  id: string;
  symbol: string;
  monogram: string;
  accent: Accent;
  balance: number;
  valueUsd: number;
  change24h: number;
};

export type UserLaunch = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  marketCap: number;
  holders: number;
  graduated: boolean;
};

export type UserNft = {
  id: string;
  name: string;
  collection: string;
  monogram: string;
  accent: Accent;
};

export type UserActivityItem = {
  id: string;
  description: string;
  timeAgo: string;
};

const bios = [
  "Building the next generation of on-chain protocols.",
  "Minting stories, one collection at a time.",
  "Liquidity provider and long-term believer.",
  "Serial launcher. Community first, always.",
  "Curating the finest corners of Gumifi.",
];

const joinLabels = ["Jan 2024", "Mar 2024", "Jun 2024", "Sep 2024", "Dec 2024", "Feb 2025"];

const hexChars = "0123456789abcdef";

const assetPool: { symbol: string; monogram: string; accent: Accent }[] = [
  { symbol: "ETH", monogram: "ET", accent: "gold" },
  { symbol: "GUMI", monogram: "GU", accent: "gold" },
  { symbol: "GEUM", monogram: "GE", accent: "emerald" },
  { symbol: "KING", monogram: "KG", accent: "gold" },
  { symbol: "ONYX", monogram: "ON", accent: "garnet" },
  { symbol: "NOVA", monogram: "NO", accent: "emerald" },
];

const timeLabels = ["12m ago", "1h ago", "5h ago", "1d ago", "3d ago", "6d ago", "2w ago"];

function createRng(seed: number): () => number {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function randomHex(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += hexChars[Math.floor(rng() * hexChars.length)];
  }
  return out;
}

const accents: Accent[] = ["gold", "emerald", "garnet"];

function isAddressLike(value: string): boolean {
  return /^0x[a-fA-F0-9]+$/.test(value);
}

export function normalizeHandle(handle: string): string {
  let decoded = handle;
  try {
    decoded = decodeURIComponent(handle);
  } catch {
    decoded = handle;
  }
  if (isAddressLike(decoded)) return decoded;
  return decoded.startsWith("@") ? decoded : `@${decoded}`;
}

export function handleToSlug(handle: string): string {
  return handle.replace(/^@/, "");
}

function buildSyntheticCreator(target: string): Creator {
  const rng = createRng(hashString(target));
  const slug = handleToSlug(target).replace(/\.gumi$/, "");
  const label = slug.length > 0 ? slug : target;
  const name = isAddressLike(target)
    ? `${target.slice(0, 6)}…${target.slice(-4)}`
    : label.charAt(0).toUpperCase() + label.slice(1);
  const monogram = label.slice(0, 2).toUpperCase();

  return {
    id: `synthetic-${hashString(target)}`,
    name,
    handle: target,
    monogram,
    accent: accents[Math.floor(rng() * accents.length)],
    tokensCount: Math.floor(rng() * 8),
    nftsCount: Math.floor(rng() * 6),
    volumeUsd: Math.round(50_000 + rng() * 1_450_000),
  };
}

export function getUserProfile(handle: string): UserProfile | undefined {
  if (!handle) return undefined;
  const target = normalizeHandle(handle);
  const creator = creators.find((item) => item.handle === target) ?? buildSyntheticCreator(target);

  const rng = createRng(hashString(creator.id));
  return {
    ...creator,
    address: isAddressLike(target) ? target : `0x${randomHex(rng, 40)}`,
    bio: bios[Math.floor(rng() * bios.length)],
    joined: joinLabels[Math.floor(rng() * joinLabels.length)],
    followers: Math.round(400 + rng() * 24_000),
  };
}

export function getUserAssets(handle: string): UserAsset[] {
  const profile = getUserProfile(handle);
  if (!profile) return [];

  const rng = createRng(hashString(`${profile.id}-assets`));
  const count = 3 + Math.floor(rng() * 3);
  const shuffled = [...assetPool].sort(() => rng() - 0.5).slice(0, count);

  return shuffled
    .map((asset) => ({
      id: `${profile.id}-${asset.symbol.toLowerCase()}`,
      symbol: asset.symbol,
      monogram: asset.monogram,
      accent: asset.accent,
      balance: Math.round(rng() * 50_000 * 100) / 100,
      valueUsd: Math.round(rng() * 40_000 * 100) / 100,
      change24h: Math.round((rng() * 40 - 15) * 10) / 10,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

export function getUserLaunches(handle: string): UserLaunch[] {
  const profile = getUserProfile(handle);
  if (!profile) return [];

  const rng = createRng(hashString(`${profile.id}-launches`));
  return Array.from({ length: profile.tokensCount }, (_, index) => {
    const symbol = `${profile.name.slice(0, 3).toUpperCase()}${index + 1}`;
    return {
      id: `${profile.id}-launch-${index}`,
      symbol,
      name: `${profile.name} Token ${index + 1}`,
      monogram: symbol.slice(0, 2),
      accent: profile.accent,
      marketCap: Math.round(rng() * 400_000),
      holders: Math.round(50 + rng() * 2_000),
      graduated: rng() > 0.5,
    };
  });
}

export function getUserNfts(handle: string): UserNft[] {
  const profile = getUserProfile(handle);
  if (!profile) return [];

  const rng = createRng(hashString(`${profile.id}-nfts`));
  return Array.from({ length: profile.nftsCount }, (_, index) => ({
    id: `${profile.id}-nft-${index}`,
    name: `${profile.name} Relic #${100 + Math.floor(rng() * 900)}`,
    collection: `${profile.name} Collection`,
    monogram: profile.monogram,
    accent: profile.accent,
  }));
}

export function getUserActivity(handle: string): UserActivityItem[] {
  const profile = getUserProfile(handle);
  if (!profile) return [];

  const rng = createRng(hashString(`${profile.id}-activity`));
  const assets = getUserAssets(handle);
  const verbs = ["Bought", "Sold", "Added liquidity to", "Launched", "Minted"];

  return Array.from({ length: 5 }, (_, index) => {
    const verb = verbs[Math.floor(rng() * verbs.length)];
    const asset = assets[Math.floor(rng() * assets.length)] ?? assetPool[0];
    const subject = verb === "Launched" ? `$${profile.name.slice(0, 3).toUpperCase()}1` : asset.symbol;
    return {
      id: `${profile.id}-activity-${index}`,
      description: `${verb} ${subject}`,
      timeAgo: timeLabels[index] ?? "recently",
    };
  });
}
