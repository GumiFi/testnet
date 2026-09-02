import {
  ArrowDownIcon,
  ArrowUpIcon,
  DropletIcon,
  FrameIcon,
  RocketIcon,
  type IconProps,
} from "@/components/icons";
import { recentActivity, type ActivityType } from "@/lib/portfolio-data";

const activityIcons: Record<ActivityType, (props: IconProps) => JSX.Element> = {
  buy: ArrowDownIcon,
  sell: ArrowUpIcon,
  liquidity: DropletIcon,
  nft: FrameIcon,
  launch: RocketIcon,
};

export default function ActivitySection() {
  return (
    <div className="border border-line bg-panel">
      {recentActivity.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        return (
          <div
            key={activity.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              index === recentActivity.length - 1 ? "" : "border-b border-line"
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-line text-goldLight">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate font-body text-xs text-ivory">{activity.description}</p>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-bronze">
              {activity.timeAgo}
            </span>
          </div>
        );
      })}
    </div>
  );
}
