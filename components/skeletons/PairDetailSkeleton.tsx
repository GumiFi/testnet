import Skel from "./Skel";

export default function PairDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-10">
      <Skel className="h-3 w-24" />

      <div className="mt-4 flex items-center gap-3">
        <Skel className="h-11 w-11 rounded-full" />
        <div className="flex-1">
          <Skel className="h-4 w-24" />
          <Skel className="mt-1.5 h-3 w-32" />
        </div>
      </div>

      <Skel className="mt-5 h-28 w-full" />

      <div className="mt-3 flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skel key={index} className="h-7 w-20" />
        ))}
      </div>

      <Skel className="mt-3 h-16 w-full" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skel key={index} className="h-14 w-full" />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skel key={index} className="h-14 w-full" />
        ))}
      </div>

      <Skel className="mt-4 h-16 w-full" />
      <Skel className="mt-3 h-24 w-full" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skel key={index} className="h-14 w-full" />
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skel key={index} className="h-12 w-full" />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skel className="h-10 w-full" />
        <Skel className="h-10 w-full" />
      </div>
      <Skel className="mt-3 h-12 w-full" />
    </div>
  );
}
