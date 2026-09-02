import Skel from "./Skel";

export default function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Skel className="h-6 w-56" />
      <Skel className="mt-3 h-3 w-40" />

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skel key={index} className="h-7 w-24 rounded-full" />
        ))}
      </div>

      <div className="mt-4 border border-line bg-panel">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 border-b border-line px-3.5 py-3 last:border-b-0"
          >
            <Skel className="h-8 w-8 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skel className="h-3 w-32" />
              <Skel className="h-2.5 w-full" />
              <Skel className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
