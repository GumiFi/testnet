import Skel from "./Skel";

export default function LiquiditySkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <Skel className="h-3 w-40" />
          <Skel className="mt-3 h-9 w-44" />
          <Skel className="mt-3 h-4 w-64" />
        </div>
      </section>

      <div className="border-b border-line px-6">
        <div className="mx-auto flex max-w-6xl gap-8 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skel key={index} className="h-4 w-24" />
          ))}
        </div>
      </div>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skel key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
