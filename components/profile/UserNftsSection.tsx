import Avatar from "@/components/discover/Avatar";
import type { UserNft } from "@/lib/user-profile-data";

export default function UserNftsSection({ nfts }: { nfts: UserNft[] }) {
  if (nfts.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">No NFTs yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {nfts.map((nft) => (
        <div key={nft.id} className="border border-line bg-panel p-3">
          <Avatar label={nft.monogram} accent={nft.accent} className="h-12 w-12 text-[10px]" shape="square" />
          <p className="mt-2 truncate font-display text-[11px] uppercase tracking-wider2 text-ivory">
            {nft.name}
          </p>
          <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider2 text-bronze">
            {nft.collection}
          </p>
        </div>
      ))}
    </div>
  );
}
