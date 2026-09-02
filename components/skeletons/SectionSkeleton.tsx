import Skel from "./Skel";

export default function SectionSkeleton() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skel key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
