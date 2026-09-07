import Skel from "./Skel";

export default function UpgradePlanSkeleton() {
  return (
    <div>
      <section className="border-b border-line px-6 py-20 text-center">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <Skel className="h-14 w-14 rounded-full" />
          <Skel className="h-3 w-24" />
          <Skel className="h-9 w-72" />
          <Skel className="h-4 w-full" />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index} className="border border-line bg-panel px-6 py-8 md:px-8 md:py-10">
              <Skel className="h-3 w-20" />
              <Skel className="mt-2 h-6 w-32" />
              <Skel className="mt-4 h-9 w-24" />
              <div className="mt-6 space-y-3 border-t border-line pt-6">
                <Skel className="h-3 w-full" />
                <Skel className="h-3 w-5/6" />
                <Skel className="h-3 w-4/6" />
                <Skel className="h-3 w-3/6" />
              </div>
              <Skel className="mt-8 h-11 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
