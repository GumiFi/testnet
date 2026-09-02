import Skel from "./Skel";

export default function SwapSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8 md:py-12">
      <div className="w-full text-center">
        <Skel className="mx-auto h-8 w-24" />
        <Skel className="mx-auto mt-3 h-4 w-56" />
      </div>

      <div className="mt-8 w-full rounded-2xl border border-line bg-panel p-5">
        <div className="flex items-center justify-between">
          <Skel className="h-4 w-16" />
          <Skel className="h-8 w-8 rounded-full" />
        </div>

        <Skel className="mt-4 h-24 w-full rounded-xl" />
        <Skel className="mx-auto -my-3 h-8 w-8 rounded-full" />
        <Skel className="h-24 w-full rounded-xl" />

        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <Skel className="h-3 w-24" />
              <Skel className="h-3 w-12" />
            </div>
          ))}
        </div>

        <Skel className="mt-4 h-12 w-full rounded-xl" />
      </div>

      <Skel className="mt-6 h-40 w-full rounded-xl" />
    </div>
  );
}
