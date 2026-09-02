import Skel from "./Skel";

export default function NftMarketplaceSkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Skel className="h-3 w-40" />
              <Skel className="mt-3 h-9 w-64" />
              <Skel className="mt-3 h-4 w-72" />
            </div>
            <Skel className="h-10 w-44" />
          </div>
          <Skel className="mt-8 h-12 w-full rounded-xl" />
          <div className="mt-5 flex gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skel key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skel key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
