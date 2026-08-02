import { UserProfileBlock } from "../../blocks/_blocks/user-profile.en";
import { ActivityTimelineBlock } from "../../blocks/_blocks/activity-timeline.en";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid.en";
export function UserCenterPage() {
    return (<div className="space-y-10 bg-bg px-6 py-10">
      <UserProfileBlock />
      <ActivityTimelineBlock />

      <ProductGridBlock />
    </div>);
}
