import {
  creators,
  discoverTokens,
  nftCollections,
  pools,
  type Creator,
  type DiscoverToken,
  type NftCollection,
  type Pool,
} from "./discover-data";

export type EcosystemSearchResults = {
  tokens: DiscoverToken[];
  collections: NftCollection[];
  pools: Pool[];
  creators: Creator[];
};

export function searchEcosystem(query: string): EcosystemSearchResults {
  const q = query.trim().toLowerCase();

  if (!q) {
    return { tokens: [], collections: [], pools: [], creators: [] };
  }

  return {
    tokens: discoverTokens.filter(
      (token) => token.symbol.toLowerCase().includes(q) || token.name.toLowerCase().includes(q)
    ),
    collections: nftCollections.filter((collection) => collection.name.toLowerCase().includes(q)),
    pools: pools.filter((pool) => pool.pair.toLowerCase().includes(q)),
    creators: creators.filter(
      (creator) => creator.name.toLowerCase().includes(q) || creator.handle.toLowerCase().includes(q)
    ),
  };
}

export function countResults(results: EcosystemSearchResults): number {
  return (
    results.tokens.length + results.collections.length + results.pools.length + results.creators.length
  );
}
