import Skel from "./Skel";

export default function DiscoverSkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-3 w-48" />
          <Skel className="mt-3 h-9 w-40" />
          <Skel className="mt-8 h-12 w-full rounded-xl" />
        </div>
      </section>

      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-4 w-32" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skel key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-4 w-36" />
          <div className="mt-6 flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skel key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skel key={index} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
