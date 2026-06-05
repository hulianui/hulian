import { UserProfileBlock } from "../../blocks/_blocks/user-profile";
import { ActivityTimelineBlock } from "../../blocks/_blocks/activity-timeline";
import { ProductGridBlock } from "../../blocks/_blocks/product-grid";

// C 端个人中心页 —— 会员资料卡（指标 + 订单 Tabs）+ 近期动态时间线 + 为你推荐商品网格，账户主页范式。
export function UserCenterPage() {
  return (
    <div className="space-y-10 bg-bg px-6 py-10">
      <UserProfileBlock />
      <ActivityTimelineBlock />
      {/* ProductGridBlock 自带「猜你喜欢」标题区，故不再叠加内联小标题，避免重复 */}
      <ProductGridBlock />
    </div>
  );
}
