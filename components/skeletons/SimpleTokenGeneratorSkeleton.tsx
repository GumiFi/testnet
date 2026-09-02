import Skel from "./Skel";

export default function SimpleTokenGeneratorSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <div className="w-full px-1 pb-6">
        <Skel className="h-3 w-40" />
        <Skel className="mt-4 h-3 w-28" />
        <Skel className="mt-2 h-7 w-40" />
        <Skel className="mt-1 h-4 w-56" />
      </div>

      <Skel className="mb-6 h-16 w-full" />

      <div className="rounded-2xl border border-gold/40 bg-panel px-5 py-6 md:px-6">
        <Skel className="h-3 w-28" />
        <Skel className="mt-2 h-12 w-full rounded-lg" />

        <Skel className="mt-5 h-3 w-28" />
        <Skel className="mt-2 h-12 w-full rounded-lg" />

        <Skel className="mt-5 h-3 w-32" />
        <Skel className="mt-2 h-40 w-full rounded-lg" />

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Skel className="h-12 w-full rounded-lg" />
          <Skel className="h-12 w-full rounded-lg" />
        </div>

        <Skel className="mt-5 h-3 w-40" />
        <Skel className="mt-2 h-20 w-full rounded-lg" />

        <Skel className="mt-6 h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
