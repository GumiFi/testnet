import { ActivityIcon } from "@/components/icons";
import type { UserActivityItem } from "@/lib/user-profile-data";

export default function UserActivitySection({ activity }: { activity: UserActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-panel">
      {activity.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 px-4 py-3 ${
            index === activity.length - 1 ? "" : "border-b border-line"
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-goldLight">
            <ActivityIcon className="h-3.5 w-3.5" />
          </span>
          <p className="min-w-0 flex-1 truncate font-body text-xs text-ivory">{item.description}</p>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
            {item.timeAgo}
          </span>
        </div>
      ))}
    </div>
  );
}
