import Skel from "./Skel";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-8 md:py-12">
      <div className="border border-line bg-panel p-5">
        <div className="flex items-center gap-4">
          <Skel className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skel className="h-4 w-32" />
            <Skel className="h-3 w-24" />
          </div>
        </div>
        <Skel className="mt-5 h-14 w-full" />
        <Skel className="mt-4 h-12 w-full" />
      </div>

      <Skel className="h-40 w-full" />

      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skel className="h-4 w-32" />
          <Skel className="h-24 w-full" />
        </div>
      ))}
    </div>
  );
}
