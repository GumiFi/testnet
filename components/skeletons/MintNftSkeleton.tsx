import Skel from "./Skel";

export default function MintNftSkeleton() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-8 md:py-12">
      <div className="w-full px-1 pb-6">
        <Skel className="h-3 w-32" />
        <Skel className="mt-2 h-7 w-56" />
        <Skel className="mt-1 h-4 w-64" />
      </div>

      <Skel className="mx-auto mb-6 aspect-square w-full max-w-[13.75rem]" />

      <div className="border border-gold/40 bg-panel px-5 py-6 md:px-6">
        <Skel className="h-3 w-28" />
        <Skel className="mt-2 h-12 w-full" />

        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <Skel className="h-9 w-24" />
          <Skel className="h-9 w-24" />
        </div>

        <Skel className="mt-6 h-12 w-full" />

        <div className="mt-6 space-y-2 border-t border-line pt-5">
          <Skel className="h-3 w-full" />
          <Skel className="h-3 w-5/6" />
          <Skel className="h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
}
