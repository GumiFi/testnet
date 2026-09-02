import Skel from "./Skel";

export default function TokenGeneratorSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <div className="w-full px-1 pb-6">
        <Skel className="h-3 w-28" />
        <Skel className="mt-2 h-7 w-44" />
        <Skel className="mt-1 h-4 w-56" />
      </div>

      <div className="flex flex-col gap-3">
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
      </div>
    </div>
  );
}
