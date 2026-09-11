"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CrownIcon, CheckIcon, LockIcon } from "@/components/icons";
import { useWallet } from "@/lib/wallet-context";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { handleToSlug } from "@/lib/user-profile-data";
import {
  GUMI_HANDLE_SUFFIX,
  GUMI_HANDLE_BASE_MAX_LENGTH,
  GUMI_MINT_PRICE_ETH,
  GUMI_MINT_PRICE_WEI,
  buildGumiHandle,
  createRpcCaller,
  decodeAbiBool,
  extractMintedTokenId,
  isHandleAvailableCalldata,
  isValidGumiHandleBase,
  mintGumiHandleCalldata,
  sanitizeGumiHandleBase,
} from "@/lib/nft-onchain";
import { sendLaunchpadTransaction, waitForTransactionReceipt } from "@/lib/launchpad-onchain";
import { CONTRACT_ADDRESSES, NETWORK } from "@/config/contracts.config";
import LiquiditySuccessModal from "@/components/liquidity/LiquiditySuccessModal";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

type MintStage = "idle" | "switching-network" | "awaiting-signature" | "confirming";

const STAGE_LABELS: Record<MintStage, string> = {
  idle: "",
  "switching-network": "Switching To Giwa Sepolia...",
  "awaiting-signature": "Confirm In Your Wallet...",
  confirming: "Waiting For Confirmation...",
};

type MintedResult = {
  handle: string;
  tokenId: string;
  txHash: string;
};

export default function MintGumiIdentityApp() {
  const router = useRouter();
  const { isConnected, connect, address, provider, chainId, refreshGumiHoldings } = useWallet();

  const [baseName, setBaseName] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [stage, setStage] = useState<MintStage>("idle");
  const [mintError, setMintError] = useState<string | null>(null);
  const [minted, setMinted] = useState<MintedResult | null>(null);

  const debouncedBase = useDebouncedValue(baseName, 450);

  useEffect(() => {
    if (!debouncedBase) {
      setAvailability("idle");
      return;
    }
    if (!isValidGumiHandleBase(debouncedBase)) {
      setAvailability("invalid");
      return;
    }
    let cancelled = false;
    setAvailability("checking");
    const call = createRpcCaller(NETWORK.rpcUrl);
    call(CONTRACT_ADDRESSES.gumiCustomNFT, isHandleAvailableCalldata(buildGumiHandle(debouncedBase)))
      .then((raw) => {
        if (cancelled) return;
        setAvailability(decodeAbiBool(raw) ? "available" : "taken");
      })
      .catch(() => {
        if (!cancelled) setAvailability("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedBase]);

  async function ensureGiwaNetwork() {
    if (!provider) return;
    if (chainId === NETWORK.chainIdHex) return;
    setStage("switching-network");
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

  async function handleMint() {
    if (!provider || !address) {
      connect();
      return;
    }
    if (availability !== "available") return;

    setMintError(null);
    try {
      await ensureGiwaNetwork();

      const handle = buildGumiHandle(baseName);
      setStage("awaiting-signature");
      const data = mintGumiHandleCalldata(handle);
      const txHash = await sendLaunchpadTransaction(
        provider,
        address,
        CONTRACT_ADDRESSES.gumiCustomNFT,
        data,
        GUMI_MINT_PRICE_WEI
      );

      setStage("confirming");
      const receipt = await waitForTransactionReceipt(provider, txHash);
      if (!receipt || receipt.status !== "0x1") {
        throw new Error("Transaction failed or timed out");
      }

      const tokenId = extractMintedTokenId(receipt, CONTRACT_ADDRESSES.gumiCustomNFT);

      setStage("idle");
      refreshGumiHoldings();
      setBaseName("");
      setAvailability("idle");
      setMinted({ handle, tokenId: tokenId ?? "—", txHash });
    } catch (caughtError) {
      setStage("idle");
      const code = (caughtError as { code?: number })?.code;
      if (code === 4001) {
        setMintError("Transaction was rejected in your wallet.");
      } else {
        setMintError(caughtError instanceof Error ? caughtError.message : "Mint failed. Please try again.");
      }
    }
  }

  const isBusy = stage !== "idle";
  const previewHandle = baseName ? buildGumiHandle(baseName) : `yourname${GUMI_HANDLE_SUFFIX}`;

  let ctaLabel = "Mint Your NFT";
  let ctaDisabled = false;
  let ctaAction: () => void = handleMint;

  if (isBusy) {
    ctaLabel = STAGE_LABELS[stage];
    ctaDisabled = true;
  } else if (!isConnected) {
    ctaLabel = "Connect Wallet";
    ctaAction = connect;
  } else if (!baseName) {
    ctaLabel = "Enter A Name";
    ctaDisabled = true;
  } else if (availability === "invalid") {
    ctaLabel = "Invalid Characters";
    ctaDisabled = true;
  } else if (availability === "checking") {
    ctaLabel = "Checking Availability...";
    ctaDisabled = true;
  } else if (availability === "taken") {
    ctaLabel = "Name Already Taken";
    ctaDisabled = true;
  }

  let statusText = "";
  let statusClass = "text-bronze";
  if (availability === "checking") {
    statusText = "Checking availability...";
  } else if (availability === "available") {
    statusText = "Available";
    statusClass = "text-emeraldLight";
  } else if (availability === "taken") {
    statusText = "Already taken";
    statusClass = "text-garnetLight";
  } else if (availability === "invalid") {
    statusText = "Only letters, numbers, _ and - are allowed";
    statusClass = "text-garnetLight";
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <div className="w-full px-1 pb-6">
        <span className="font-mono text-xs uppercase tracking-wider3 text-bronze">
          Gumifi Identity
        </span>
        <h1 className="mt-2 font-display text-2xl uppercase tracking-wider2 text-ivory text-shadow-gold">
          Mint Your .gumi Identity
        </h1>
        <p className="mt-1 font-body text-sm text-bronze">
          Choose a permanent on-chain name. It is minted as an NFT you truly own.
        </p>
      </div>

      <div className="relative mx-auto mb-6 flex aspect-square w-full max-w-[13.75rem] items-center justify-center overflow-hidden border border-gold/50 bg-gradient-to-b from-panel to-void">
        <div className="pointer-events-none absolute inset-[0.5rem] border border-gold/30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,162,39,0.18),transparent_65%)]" />
        <div className="relative flex flex-col items-center gap-3 px-4 text-center">
          <span className="font-display text-[0.625rem] uppercase tracking-wider3 text-goldLight">
            Gumifi
          </span>
          <div className="flex h-10 w-10 items-center justify-center border border-gold/60 text-goldLight">
            <CrownIcon className="h-5 w-5" />
          </div>
          <span
            className={`max-w-[10.625rem] truncate font-display text-sm text-ivory ${
              baseName ? "" : "opacity-40"
            }`}
          >
            {previewHandle}
          </span>
          <span className="font-mono text-[0.5rem] uppercase tracking-wider3 text-bronze">
            Gumi Identity
          </span>
        </div>
      </div>

      <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
        <div className="flex h-5 items-center justify-between">
          <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">
            Choose Your Name
          </p>
          <span className="font-mono text-[0.5625rem] text-bronze">
            {baseName.length}/{GUMI_HANDLE_BASE_MAX_LENGTH}
          </span>
        </div>
        <div className="mt-2 flex items-stretch border border-line bg-panel2 focus-within:border-gold/60">
          <input
            value={baseName}
            onChange={(event) => setBaseName(sanitizeGumiHandleBase(event.target.value))}
            type="text"
            maxLength={GUMI_HANDLE_BASE_MAX_LENGTH}
            placeholder="yourname"
            className="w-full bg-transparent px-4 py-3 font-display text-base text-ivory placeholder:text-bronze/50 focus:outline-none"
          />
          <span className="flex shrink-0 items-center pr-4 font-display text-base text-bronze">
            {GUMI_HANDLE_SUFFIX}
          </span>
        </div>
        {statusText && (
          <p className={`mt-2 font-mono text-[0.625rem] uppercase tracking-wider2 ${statusClass}`}>
            {statusText}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">Mint Price</p>
            <p className="mt-1 font-display text-lg text-goldLight">{GUMI_MINT_PRICE_ETH} ETH</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[0.625rem] uppercase tracking-wider2 text-bronze">Ownership</p>
            <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider2 text-goldLight">
              <LockIcon className="h-3 w-3" />
              Permanent
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={ctaDisabled}
          onClick={ctaAction}
          className={`mt-6 w-full border px-4 py-3 font-mono text-[0.6875rem] uppercase tracking-wider2 transition-colors ${
            ctaDisabled
              ? "cursor-not-allowed border-line bg-panel2 text-bronze"
              : "border-gold text-goldLight hover:bg-gold hover:text-void"
          }`}
        >
          {ctaLabel}
        </button>
        {mintError && (
          <p className="mt-3 text-center font-mono text-[0.625rem] uppercase tracking-wider2 text-garnetLight">
            {mintError}
          </p>
        )}
        <p className="mt-3 text-center font-mono text-[0.5625rem] uppercase tracking-wider2 text-bronze">
          Deploys On Giwa Chain • One NFT, One Identity
        </p>

        <ul className="mt-6 space-y-2 border-t border-line pt-5">
          {[
            "Verified .gumi handle across Gumifi",
            "Gold crown badge on your wallet & profile",
            "True on-chain ownership (ERC-721)",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 font-body text-xs text-ivory/80">
              <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {minted && (
        <LiquiditySuccessModal
          title="Identity Minted"
          message={`${minted.handle} is now live on-chain as Gumi Identity #${minted.tokenId}.`}
          primaryLabel="View My Profile"
          onPrimary={() => router.push(`/profile/${handleToSlug(minted.handle)}`)}
          onClose={() => setMinted(null)}
        />
      )}
    </div>
  );
}
