import Skel from "./Skel";

export default function SwapHistoryChunkSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
          <Skel className="h-7 w-7 rounded-full" />
          <Skel className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skel className="h-3 w-24" />
          </div>
          <Skel className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
