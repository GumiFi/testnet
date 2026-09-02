import Skel from "./Skel";
import SwapHistoryChunkSkeleton from "./SwapHistoryChunkSkeleton";

export default function SwapHistorySkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Skel className="h-3 w-32" />
      <Skel className="mt-3 h-8 w-48" />

      <div className="mt-6 border border-line bg-panel">
        <SwapHistoryChunkSkeleton rows={6} />
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skel key={index} className="h-8 w-8" />
        ))}
      </div>
    </div>
  );
}
