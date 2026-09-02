import Skel from "./Skel";

export default function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm border border-line bg-panel px-6 py-8">
        <Skel className="mx-auto h-5 w-32" />
        <Skel className="mx-auto mt-6 h-12 w-full rounded-lg" />
        <Skel className="mt-4 h-12 w-full rounded-lg" />
        <Skel className="mt-4 h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
