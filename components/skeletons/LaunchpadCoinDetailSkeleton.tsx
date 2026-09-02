import Skel from "./Skel";

export default function LaunchpadCoinDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <Skel className="h-3 w-32" />

      <div className="mt-4 flex items-start gap-3">
        <Skel className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 pt-0.5">
          <Skel className="h-5 w-32" />
          <Skel className="mt-2 h-4 w-40" />
        </div>
      </div>

      <Skel className="mt-4 h-16 w-full rounded-2xl" />
      <Skel className="mt-4 h-28 w-full rounded-2xl" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skel className="h-12 w-full rounded-xl" />
        <Skel className="h-12 w-full rounded-xl" />
      </div>

      <Skel className="mt-4 h-56 w-full rounded-2xl" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skel key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skel key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skel key={index} className="h-8 w-20 shrink-0 rounded-xl" />
        ))}
      </div>

      <Skel className="mt-4 h-20 w-full rounded-2xl" />
      <Skel className="mt-4 h-40 w-full rounded-2xl" />
      <Skel className="mt-4 h-24 w-full rounded-2xl" />
      <Skel className="mt-4 h-24 w-full rounded-2xl" />

      <div className="mt-5 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skel key={index} className="h-11 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
