import Skel from "./Skel";

export default function DexSkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-3 w-32" />
          <Skel className="mt-3 h-9 w-24" />
          <div className="mt-8 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skel key={index} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skel key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skel key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
