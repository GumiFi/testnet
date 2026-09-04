import {
  ArrowDownIcon,
  ArrowUpIcon,
  FrameIcon,
  RocketIcon,
  type IconProps,
} from "@/components/icons";
import { formatTimeAgo, type ActivityEntry } from "@/lib/activity-onchain";

const activityIcons: Record<ActivityEntry["kind"], (props: IconProps) => JSX.Element> = {
  launch: RocketIcon,
  collection: FrameIcon,
  "token-in": ArrowDownIcon,
  "token-out": ArrowUpIcon,
  "nft-in": ArrowDownIcon,
  "nft-out": ArrowUpIcon,
};

export default function ActivitySection({
  activity,
  loading,
}: {
  activity: ActivityEntry[];
  loading: boolean;
}) {
  if (loading && activity.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Loading activity…</p>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="border border-line bg-panel px-4 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-wider2 text-bronze">Nothing here yet</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-panel">
      {activity.map((entry, index) => {
        const Icon = activityIcons[entry.kind];
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              index === activity.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-goldLight">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate font-body text-xs text-ivory">{entry.description}</p>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {formatTimeAgo(entry.timestampMs)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
