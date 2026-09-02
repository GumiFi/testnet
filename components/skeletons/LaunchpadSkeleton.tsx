import Skel from "./Skel";

export default function LaunchpadSkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-3 w-48" />
          <Skel className="mt-3 h-9 w-52" />
          <Skel className="mt-3 h-4 w-72" />
        </div>
      </section>

      <section className="border-b border-line px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-4 w-40" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skel key={index} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skel key={index} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skel key={index} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
