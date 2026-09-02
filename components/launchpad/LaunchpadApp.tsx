import LaunchpadHeader from "./LaunchpadHeader";
import TrendingLaunchesSection from "./TrendingLaunchesSection";
import ExploreCoinsSection from "./ExploreCoinsSection";

export default function LaunchpadApp() {
  return (
    <div>
      <LaunchpadHeader />
      <TrendingLaunchesSection />
      <ExploreCoinsSection />
    </div>
  );
}
