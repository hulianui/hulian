import { UserProfileBlock } from "../../blocks/_blocks/user-profile";
import { ActivityTimelineBlock } from "../../blocks/_blocks/activity-timeline";

// C 端个人中心页 —— 会员资料卡（指标 + 订单 Tabs）+ 近期动态时间线，账户主页范式。
export function UserCenterPage() {
  return (
    <div className="space-y-10 bg-bg px-6 py-10">
      <UserProfileBlock />
      <ActivityTimelineBlock />
    </div>
  );
}
