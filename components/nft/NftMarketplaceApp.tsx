"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon, CloseIcon } from "@/components/icons";
import FilterChips from "@/components/discover/FilterChips";
import WalletTag from "@/components/WalletTag";
import BuyNftModal from "./BuyNftModal";
import ListNftModal from "./ListNftModal";
import { useWallet } from "@/lib/wallet-context";
import { useNotifications } from "@/lib/notification-context";
import { createProviderCaller } from "@/lib/nft-onchain";
import { parseEtherToWei, sendLaunchpadTransaction, waitForTransactionReceipt } from "@/lib/launchpad-onchain";
import { approveCalldata } from "@/lib/swap-onchain";
import {
  buyItemCalldata,
  listItemCalldata,
  fetchOwnerOf,
  fetchIsApprovedForMarketplace,
  type MarketListing,
} from "@/lib/nft-marketplace-onchain";
import { useMarketListings, refreshMarketListings } from "@/lib/nft-marketplace-live";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import { formatEth } from "@/lib/format";

const marketplaceFilters = ["Newest", "Price: Low to High", "Price: High to Low"] as const;
type MarketplaceFilter = (typeof marketplaceFilters)[number];

function filterListings(listings: MarketListing[], filter: MarketplaceFilter, query: string): MarketListing[] {
  let list = [...listings];
  const trimmedQuery = query.trim().toLowerCase();
  if (trimmedQuery) {
    list = list.filter(
      (listing) =>
        listing.name.toLowerCase().includes(trimmedQuery) || listing.tokenId.includes(trimmedQuery)
    );
  }
  switch (filter) {
    case "Price: Low to High":
      return list.sort((a, b) => (a.priceWei < b.priceWei ? -1 : a.priceWei > b.priceWei ? 1 : 0));
    case "Price: High to Low":
      return list.sort((a, b) => (a.priceWei > b.priceWei ? -1 : a.priceWei < b.priceWei ? 1 : 0));
    default:
      return list.sort((a, b) => b.listingId - a.listingId);
  }
}

export default function NftMarketplaceApp() {
  const { connect, address, provider, chainId } = useWallet();
  const { addNotification } = useNotifications();
  const { listings, loaded } = useMarketListings();
  const [filter, setFilter] = useState<MarketplaceFilter>("Newest");
  const [query, setQuery] = useState("");
  const [buyTarget, setBuyTarget] = useState<MarketListing | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [txStage, setTxStage] = useState("");
  const [txError, setTxError] = useState<string | null>(null);

  const filteredListings = useMemo(() => filterListings(listings, filter, query), [listings, filter, query]);
  const isSearching = query.trim().length > 0;

  async function ensureGiwaNetwork() {
    if (!provider) return;
    if (chainId === NETWORK.chainIdHex) return;
    setTxStage("Switching To Giwa Sepolia...");
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainIdHex }],
      });
    } catch (switchError) {
      const code = (switchError as { code?: number })?.code;
      if (code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: NETWORK.chainIdHex,
              chainName: NETWORK.name,
              rpcUrls: [NETWORK.rpcUrl],
              blockExplorerUrls: [NETWORK.explorerUrl],
              nativeCurrency: NETWORK.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  function openBuy(listing: MarketListing) {
    setTxError(null);
    setTxStage("");
    setBuyTarget(listing);
  }

  function closeBuy() {
    if (txStage) return;
    setBuyTarget(null);
    setTxError(null);
  }

  function openList() {
    setTxError(null);
    setTxStage("");
    setShowListModal(true);
  }

  function closeList() {
    if (txStage) return;
    setShowListModal(false);
    setTxError(null);
  }

  async function handleBuy() {
    if (!buyTarget) return;
    if (!provider || !address) {
      connect();
      return;
    }
    setTxError(null);
    try {
      await ensureGiwaNetwork();
      setTxStage("Confirm In Your Wallet...");
      const data = buyItemCalldata(BigInt(buyTarget.listingId));
      const txHash = await sendLaunchpadTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.nftMarketplace,
        data,
        buyTarget.priceWei
      );
      setTxStage("Waiting For Confirmation...");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") throw new Error("Transaction failed or timed out");

      setTxStage("Updating Listings...");
      await refreshMarketListings();
      setTxStage("");
      setBuyTarget(null);
      addNotification({
        category: "nft",
        title: "NFT Purchase Completed",
        message: `Bought ${buyTarget.name} (#${buyTarget.tokenId}) on the marketplace.`,
        href: "/nft/marketplace",
      });
    } catch (caughtError) {
      setTxStage("");
      setTxError(caughtError instanceof Error ? caughtError.message : "Purchase failed");
      addNotification({
        category: "nft",
        title: "NFT Purchase Failed",
        message: `Your purchase of ${buyTarget.name} (#${buyTarget.tokenId}) didn't go through.`,
        href: "/nft/marketplace",
      });
    }
  }

  async function handleList(nftAddress: string, tokenIdStr: string, priceEthStr: string) {
    if (!provider || !address) {
      connect();
      return;
    }
    setTxError(null);
    try {
      await ensureGiwaNetwork();
      const tokenId = BigInt(tokenIdStr);
      const priceWei = parseEtherToWei(priceEthStr);
      if (priceWei <= 0n) throw new Error("Enter a price greater than zero");

      setTxStage("Checking Ownership...");
      const owner = await fetchOwnerOf(nftAddress, tokenId);
      if (!owner || owner.toLowerCase() !== address.toLowerCase()) {
        throw new Error("This wallet doesn't own that token");
      }

      const call = createProviderCaller(provider);
      const isApproved = await fetchIsApprovedForMarketplace(call, nftAddress, address, tokenId);
      if (!isApproved) {
        setTxStage("Approve Marketplace...");
        const approveData = approveCalldata(CONTRACT_ADDRESSES.nftMarketplace, tokenId);
        const approveTxHash = await sendLaunchpadTransaction(provider, address, nftAddress, approveData, 0n);
        setTxStage("Confirming Approval...");
        const approveReceipt = await waitForTransactionReceipt(provider, approveTxHash);
        if (!approveReceipt || approveReceipt.status !== "0x1") throw new Error("Approval failed or timed out");
      }

      setTxStage("Confirm In Your Wallet...");
      const listData = listItemCalldata(nftAddress, tokenId, priceWei);
      const listTxHash = await sendLaunchpadTransaction(provider, address, CONTRACT_ADDRESSES.nftMarketplace, listData, 0n);
      setTxStage("Waiting For Confirmation...");
      const listReceipt = await waitForTransactionReceipt(provider, listTxHash);
      if (!listReceipt || listReceipt.status !== "0x1") throw new Error("Listing failed or timed out");

      setTxStage("Updating Listings...");
      await refreshMarketListings();
      setTxStage("");
      setShowListModal(false);
      addNotification({
        category: "nft",
        title: "NFT Listed For Sale",
        message: `Token #${tokenIdStr} is now listed for ${priceEthStr} ETH.`,
        href: "/nft/marketplace",
      });
    } catch (caughtError) {
      setTxStage("");
      setTxError(caughtError instanceof Error ? caughtError.message : "Listing failed");
      addNotification({
        category: "nft",
        title: "NFT Listing Failed",
        message: `Listing token #${tokenIdStr} didn't go through.`,
        href: "/nft/marketplace",
      });
    }
  }

  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="animate-fadeUp">
              <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
                Live listings on GUMIFI
              </span>
              <h1 className="mt-3 font-display text-3xl uppercase tracking-wider2 text-ivory text-shadow-gold md:text-4xl">
                NFT Marketplace
              </h1>
              <p className="mt-3 max-w-xl font-body text-sm text-bronze">
                Buy and sell NFTs directly on-chain across the ecosystem.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={openList}
                className="inline-flex items-center justify-center gap-2 border border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-bronze transition-colors hover:border-gold/40 hover:text-ivory"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                List NFT
              </button>
              <Link
                href="/nft/create"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 border border-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-goldLight transition-colors hover:bg-gold hover:text-void"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Create Collection
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 transition-colors focus-within:border-gold/60">
            <SearchIcon className="h-4 w-4 shrink-0 text-bronze" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search by name or token ID..."
              className="w-full bg-transparent font-body text-sm text-ivory placeholder:text-bronze/70 focus:outline-none"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Close search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-bronze transition-colors hover:border-gold hover:text-goldLight"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="mt-5">
            <FilterChips options={marketplaceFilters} active={filter} onChange={setFilter} />
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {filteredListings.length === 0 ? (
            <p className="px-4 py-16 text-center font-mono text-xs uppercase tracking-wider2 text-bronze">
              {!loaded ? "Loading listings from chain..." : "No active listings found"}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredListings.map((listing) => {
                const priceEth = Number(listing.priceWei) / 1e18;
                return (
                  <button
                    key={listing.listingId}
                    type="button"
                    onClick={() => openBuy(listing)}
                    className="border border-line bg-panel p-4 text-left transition-colors hover:border-gold/40"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-panel2">
                      {listing.image ? (
                        <img src={listing.image} alt={listing.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <p className="mt-3 truncate font-display text-sm uppercase tracking-wider2 text-ivory">
                      {listing.name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
                      Token #{listing.tokenId}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider2 text-bronze">Price</p>
                        <p className="mt-0.5 font-mono text-xs text-goldLight">{formatEth(priceEth)}</p>
                      </div>
                      <WalletTag address={listing.seller} className="max-w-[100px]" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {buyTarget && (
        <BuyNftModal
          listing={buyTarget}
          priceEth={Number(buyTarget.priceWei) / 1e18}
          stageLabel={txStage}
          errorMessage={txError}
          onConfirm={handleBuy}
          onClose={closeBuy}
        />
      )}

      {showListModal && (
        <ListNftModal stageLabel={txStage} errorMessage={txError} onConfirm={handleList} onClose={closeList} />
      )}
    </div>
  );
}
