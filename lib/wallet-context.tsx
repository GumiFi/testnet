"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import WalletConnectModal from "@/components/WalletConnectModal";

export type EIP1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export type EIP6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
};

const GUMI_NFT_CONTRACT_ADDRESS = "";
const STORAGE_KEY = "gumifi.wallet.rdns";

type WalletContextValue = {
  isConnected: boolean;
  connecting: boolean;
  address: string | null;
  handle: string | null;
  name: string | null;
  monogram: string | null;
  chainId: string | null;
  isGumiHolder: boolean;
  providers: EIP6963ProviderDetail[];
  pickerOpen: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  selectProvider: (uuid: string) => void;
  closePicker: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function toBalanceOfCalldata(address: string): string {
  return `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [activeUuid, setActiveUuid] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isGumiHolder, setIsGumiHolder] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providersRef = useRef<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    function handleAnnounce(event: Event) {
      const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
      if (!detail) return;
      const exists = providersRef.current.some((item) => item.info.uuid === detail.info.uuid);
      if (exists) return;
      const next = [...providersRef.current, detail];
      providersRef.current = next;
      setProviders(next);
    }
    window.addEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
    };
  }, []);

  useEffect(() => {
    if (providers.length > 0) return;
    const legacy = (window as unknown as { ethereum?: EIP1193Provider }).ethereum;
    if (!legacy) return;
    const timer = window.setTimeout(() => {
      if (providersRef.current.length > 0) return;
      const detail: EIP6963ProviderDetail = {
        info: { uuid: "legacy-injected", name: "Browser Wallet", icon: "", rdns: "legacy.injected" },
        provider: legacy,
      };
      providersRef.current = [detail];
      setProviders([detail]);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [providers.length]);

  useEffect(() => {
    const savedRdns = window.localStorage.getItem(STORAGE_KEY);
    if (!savedRdns) return;
    const match = providers.find((item) => item.info.rdns === savedRdns);
    if (!match) return;
    let cancelled = false;
    match.provider
      .request({ method: "eth_accounts" })
      .then((result) => {
        if (cancelled) return;
        const accounts = result as string[];
        if (accounts && accounts.length > 0) {
          setActiveUuid(match.info.uuid);
          setAddress(accounts[0]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [providers]);

  const activeProvider = useMemo(
    () => providers.find((item) => item.info.uuid === activeUuid)?.provider ?? null,
    [providers, activeUuid]
  );

  useEffect(() => {
    if (!activeProvider || !address) {
      setChainId(null);
      return;
    }
    let cancelled = false;
    activeProvider
      .request({ method: "eth_chainId" })
      .then((result) => {
        if (!cancelled) setChainId(result as string);
      })
      .catch(() => {
        if (!cancelled) setChainId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProvider, address]);

  useEffect(() => {
    if (!activeProvider) return;
    function handleAccountsChanged(...args: unknown[]) {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        setAddress(null);
        setActiveUuid(null);
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setAddress(accounts[0]);
    }
    function handleChainChanged(...args: unknown[]) {
      setChainId(args[0] as string);
    }
    activeProvider.on?.("accountsChanged", handleAccountsChanged);
    activeProvider.on?.("chainChanged", handleChainChanged);
    return () => {
      activeProvider.removeListener?.("accountsChanged", handleAccountsChanged);
      activeProvider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [activeProvider]);

  useEffect(() => {
    if (!address || !activeProvider || !GUMI_NFT_CONTRACT_ADDRESS) {
      setIsGumiHolder(false);
      return;
    }
    let cancelled = false;
    activeProvider
      .request({
        method: "eth_call",
        params: [{ to: GUMI_NFT_CONTRACT_ADDRESS, data: toBalanceOfCalldata(address) }, "latest"],
      })
      .then((result) => {
        if (cancelled) return;
        const raw = result as string;
        setIsGumiHolder(Boolean(raw) && raw !== "0x" && BigInt(raw) > BigInt(0));
      })
      .catch(() => {
        if (!cancelled) setIsGumiHolder(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, activeProvider]);

  const connect = useCallback(() => {
    setError(null);
    setPickerOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    setError(null);
  }, []);

  const selectProvider = useCallback((uuid: string) => {
    const target = providersRef.current.find((item) => item.info.uuid === uuid);
    if (!target) return;
    setConnecting(true);
    setError(null);
    target.provider
      .request({ method: "eth_requestAccounts" })
      .then((result) => {
        const accounts = result as string[];
        if (!accounts || accounts.length === 0) {
          throw new Error("No account returned");
        }
        setActiveUuid(target.info.uuid);
        setAddress(accounts[0]);
        window.localStorage.setItem(STORAGE_KEY, target.info.rdns);
        setPickerOpen(false);
      })
      .catch(() => {
        setError("Connection request was rejected");
      })
      .finally(() => {
        setConnecting(false);
      });
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setActiveUuid(null);
    setChainId(null);
    setIsGumiHolder(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isConnected = address !== null;
  const handle = address ? truncateAddress(address) : null;
  const name = handle;
  const monogram = address ? address.slice(2, 4).toUpperCase() : null;

  const value = useMemo<WalletContextValue>(
    () => ({
      isConnected,
      connecting,
      address,
      handle,
      name,
      monogram,
      chainId,
      isGumiHolder,
      providers,
      pickerOpen,
      error,
      connect,
      disconnect,
      selectProvider,
      closePicker,
    }),
    [
      isConnected,
      connecting,
      address,
      handle,
      name,
      monogram,
      chainId,
      isGumiHolder,
      providers,
      pickerOpen,
      error,
      connect,
      disconnect,
      selectProvider,
      closePicker,
    ]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      {pickerOpen && (
        <WalletConnectModal
          providers={providers}
          connecting={connecting}
          error={error}
          onSelect={selectProvider}
          onClose={closePicker}
        />
      )}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
