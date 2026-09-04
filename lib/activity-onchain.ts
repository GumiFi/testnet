import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { formatBalance } from "./format";

export type ActivityEntry = {
  id: string;
  kind: "launch" | "collection" | "token-in" | "token-out" | "nft-in" | "nft-out";
  description: string;
  timestampMs: number;
};

type RawLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
};

const TRANSFER_TOPIC0 = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function addressToTopic(address: string): string {
  return `0x${address.replace(/^0x/, "").toLowerCase().padStart(64, "0")}`;
}

async function rpcRequest(method: string, params: unknown[]): Promise<unknown> {
  const response = await fetch(NETWORK.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message ?? "RPC error");
  return payload.result;
}

async function getLogs(address: string, topics: (string | null)[]): Promise<RawLog[]> {
  try {
    const result = await rpcRequest("eth_getLogs", [{ address, topics, fromBlock: "0x0", toBlock: "latest" }]);
    return (result as RawLog[]) ?? [];
  } catch {
    return [];
  }
}

const blockTimestampCache = new Map<string, number>();

async function getBlockTimestampMs(blockNumberHex: string): Promise<number> {
  const cached = blockTimestampCache.get(blockNumberHex);
  if (cached !== undefined) return cached;
  try {
    const block = (await rpcRequest("eth_getBlockByNumber", [blockNumberHex, false])) as {
      timestamp: string;
    } | null;
    const timestampMs = block ? Number(BigInt(block.timestamp)) * 1000 : Date.now();
    blockTimestampCache.set(blockNumberHex, timestampMs);
    return timestampMs;
  } catch {
    return Date.now();
  }
}

async function fetchDirectionalTransfers(
  tokenAddress: string,
  wallet: string,
  direction: "from" | "to"
): Promise<RawLog[]> {
  const walletTopic = addressToTopic(wallet);
  const topics =
    direction === "from" ? [TRANSFER_TOPIC0, walletTopic, null] : [TRANSFER_TOPIC0, null, walletTopic];
  return getLogs(tokenAddress, topics);
}

export async function fetchErc20TransferActivity(
  tokenAddress: string,
  wallet: string,
  symbol: string,
  decimals = 18
): Promise<ActivityEntry[]> {
  const [outgoing, incoming] = await Promise.all([
    fetchDirectionalTransfers(tokenAddress, wallet, "from"),
    fetchDirectionalTransfers(tokenAddress, wallet, "to"),
  ]);

  const tagged = [
    ...outgoing.map((log) => ({ log, kind: "token-out" as const })),
    ...incoming.map((log) => ({ log, kind: "token-in" as const })),
  ];

  return Promise.all(
    tagged.map(async ({ log, kind }) => {
      const amount = Number(BigInt(log.data)) / 10 ** decimals;
      const timestampMs = await getBlockTimestampMs(log.blockNumber);
      return {
        id: `${log.transactionHash}-${log.logIndex}`,
        kind,
        description:
          kind === "token-out"
            ? `Sent ${formatBalance(amount)} ${symbol}`
            : `Received ${formatBalance(amount)} ${symbol}`,
        timestampMs,
      };
    })
  );
}

export async function fetchErc721TransferActivity(
  tokenAddress: string,
  wallet: string,
  label: string
): Promise<ActivityEntry[]> {
  const [outgoing, incoming] = await Promise.all([
    fetchDirectionalTransfers(tokenAddress, wallet, "from"),
    fetchDirectionalTransfers(tokenAddress, wallet, "to"),
  ]);

  const tagged = [
    ...outgoing.map((log) => ({ log, kind: "nft-out" as const })),
    ...incoming.map((log) => ({ log, kind: "nft-in" as const })),
  ];

  return Promise.all(
    tagged.map(async ({ log, kind }) => {
      const tokenId = log.topics[3] ? BigInt(log.topics[3]).toString() : "?";
      const timestampMs = await getBlockTimestampMs(log.blockNumber);
      return {
        id: `${log.transactionHash}-${log.logIndex}`,
        kind,
        description: kind === "nft-out" ? `Sent ${label} #${tokenId}` : `Received ${label} #${tokenId}`,
        timestampMs,
      };
    })
  );
}

export async function fetchWalletActivity(
  wallet: string,
  context: {
    launches: { symbol: string; createdAt: number; txHash: string }[];
    collections: { name: string; createdAt: number; txHash: string }[];
  }
): Promise<ActivityEntry[]> {
  const [gumiTransfers, nftTransfers] = await Promise.all([
    fetchErc20TransferActivity(CONTRACT_ADDRESSES.gumiToken, wallet, "GUMI"),
    fetchErc721TransferActivity(CONTRACT_ADDRESSES.gumiCustomNFT, wallet, "Gumi Custom NFT"),
  ]);

  const launchEntries: ActivityEntry[] = context.launches.map((launch) => ({
    id: `launch-${launch.txHash}`,
    kind: "launch",
    description: `Launched $${launch.symbol}`,
    timestampMs: launch.createdAt,
  }));

  const collectionEntries: ActivityEntry[] = context.collections.map((record) => ({
    id: `collection-${record.txHash}`,
    kind: "collection",
    description: `Created NFT collection ${record.name}`,
    timestampMs: record.createdAt,
  }));

  return [...launchEntries, ...collectionEntries, ...gumiTransfers, ...nftTransfers]
    .sort((a, b) => b.timestampMs - a.timestampMs)
    .slice(0, 10);
}

export function formatTimeAgo(timestampMs: number): string {
  const seconds = Math.max(0, (Date.now() - timestampMs) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}
