export type Accent = "gold" | "emerald" | "garnet";

export type DiscoverToken = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  priceUsd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  trendScore: number;
  isNew: boolean;
  sparkline: number[];
  boost: number | null;
};

export type DiscoverLaunch = {
  id: string;
  symbol: string;
  name: string;
  monogram: string;
  accent: Accent;
  creator: string;
  bondingCurvePct: number;
  age: string;
  marketCap: number;
  boost: number | null;
};

export type FeaturedProject = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  monogram: string;
};

export type NftCollection = {
  id: string;
  name: string;
  monogram: string;
  accent: Accent;
  floorEth: number;
  change24h: number;
  volume24hEth: number;
  owners: number;
  items: number;
  isNew: boolean;
};

export type Pool = {
  id: string;
  pair: string;
  tvlUsd: number;
  volume24hUsd: number;
  aprPct: number;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  monogram: string;
  accent: Accent;
  tokensCount: number;
  nftsCount: number;
  volumeUsd: number;
};

export function isGumiHandle(creator: string): boolean {
  return creator.startsWith("@");
}

export const discoverTokens: DiscoverToken[] = [];
export const discoverLaunches: DiscoverLaunch[] = [];
export const pools: Pool[] = [];

export function setDiscoverTokens(tokens: DiscoverToken[]): void {
  discoverTokens.length = 0;
  discoverTokens.push(...tokens);
}

export function setDiscoverLaunches(launches: DiscoverLaunch[]): void {
  discoverLaunches.length = 0;
  discoverLaunches.push(...launches);
}

export function setPools(list: Pool[]): void {
  pools.length = 0;
  pools.push(...list);
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: "gumi-protocol",
    name: "GUMI Protocol",
    category: "DeFi Infrastructure",
    tagline:
      "The instant-bonding launchpad and buyback-burn engine powering the GUMIFI ecosystem.",
    monogram: "GU",
  },
  {
    id: "onyx-vaults",
    name: "Onyx Vaults",
    category: "Yield & Staking",
    tagline: "Automated $GUMI vault strategies with weekly compounding rewards.",
    monogram: "ON",
  },
];

export const nftCollections: NftCollection[] = [];
export const creators: Creator[] = [];

export function setNftCollections(list: NftCollection[]): void {
  nftCollections.length = 0;
  nftCollections.push(...list);
}

export function setCreators(list: Creator[]): void {
  creators.length = 0;
  creators.push(...list);
}
