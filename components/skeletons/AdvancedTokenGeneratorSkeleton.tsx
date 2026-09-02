import Skel from "./Skel";

export default function AdvancedTokenGeneratorSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <div className="w-full px-1 pb-6">
        <Skel className="h-3 w-40" />
        <Skel className="mt-4 h-3 w-28" />
        <Skel className="mt-2 h-7 w-44" />
        <Skel className="mt-1 h-4 w-60" />
      </div>

      <div className="mb-6 flex items-center gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex flex-1 items-center last:flex-none">
            <Skel className="h-9 w-9 shrink-0 rounded-full" />
            {index < 3 && <Skel className="mx-2 h-px flex-1" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
        <Skel className="h-3 w-28" />
        <Skel className="mt-2 h-12 w-full rounded-lg" />

        <Skel className="mt-5 h-3 w-28" />
        <Skel className="mt-2 h-12 w-full rounded-lg" />

        <Skel className="mt-5 h-3 w-32" />
        <Skel className="mt-2 h-40 w-full rounded-xl" />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Skel className="h-12 w-full rounded-lg" />
          <Skel className="h-12 w-full rounded-lg" />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Skel className="h-11 w-24 rounded-lg" />
          <Skel className="h-11 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
