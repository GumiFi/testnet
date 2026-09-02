import Skel from "./Skel";

export default function SwapTxSkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Skel className="h-3 w-24" />

      <div className="mt-6 border border-line bg-panel p-5">
        <div className="flex items-center justify-center gap-2">
          <Skel className="h-10 w-10 rounded-full" />
          <Skel className="h-10 w-10 rounded-full" />
        </div>
        <Skel className="mx-auto mt-4 h-4 w-32" />
        <Skel className="mx-auto mt-2 h-3 w-20" />
      </div>

      <div className="mt-4 space-y-3 border border-line bg-panel p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <Skel className="h-3 w-20" />
            <Skel className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
