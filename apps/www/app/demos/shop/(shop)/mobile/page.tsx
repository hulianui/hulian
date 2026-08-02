"use client";
import { copy } from "./page.content";
import { IPhone } from "@hulianui/ui";
import { MobileStore } from "../../_components/mobile-store";

// 瀚选 HanShop · H5 商城移动端预览页
// 核心价值：把 7 件 mobile 组件（IPhone/TabBar/Fab/ActionSheet/SwipeAction/PullToRefresh/Picker/SafeArea）
// 塞进一个「活的」手机购物界面，全部 0 覆盖 → 首次覆盖。

export default function MobilePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center gap-8 px-4 py-10">
      {/* 标题说明 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{copy("mobileStorefrontExperience")}</h1>
        <p className="mt-2 max-w-md text-sm text-muted">

          {copy("aCompleteHanshopMobileDemoFeaturingBottomTabNavigationPullToRefreshSwipeActionsFilterSheetsVaria")}
        </p>
      </div>

      {/* 手机展示区 — 并排放两台显示不同状态 */}
      <div className="flex flex-wrap items-start justify-center gap-10">
        {/* 主机：默认首页 tab */}
        <div className="flex flex-col items-center gap-3">
          <IPhone model="16-pro">
            <MobileStore />
          </IPhone>
          <p className="text-xs text-muted">{copy("iphone16ProHomeCategoriesCartAccount")}</p>
        </div>

        {/* 说明卡片（桌面端 md 以上才显示） */}
        <div className="hidden max-w-xs space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm md:block">
          <h2 className="text-base font-semibold text-foreground">{copy("mobileComponentCoverage")}</h2>
          <ul className="space-y-2 text-sm text-muted">
            {[
              ["IPhone", copy("deviceFrameWithChildrenFillingTheScreen")],
              ["SafeArea", copy("topNotchAndHomeIndicatorAdaptation")],
              ["TabBar", copy("fixedFalseKeepsTheBarAtTheBottomOfTheDocumentFlow")],
              ["PullToRefresh", copy("pullToRefreshProductListOnHome")],
              ["ActionSheet", copy("filterAndSortSheetOnCategories")],
              ["Picker", copy("wheelPickerForVariantsAndColors")],
              ["SwipeAction", copy("swipeActionsOnCategoryProductsAndCartRows")],
              ["Fab", copy("floatingSupportSpeedDialInTheLowerRightCorner")],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2">
                <span className="font-mono text-xs font-medium text-primary">{name}</span>
                <span className="text-xs">{desc}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted">

              {copy("overlayLayoutTheScreenContainerUses")} <code className="rounded bg-surface-hover px-1 font-mono text-xs">relative</code>{copy("fabUses")} <code className="rounded bg-surface-hover px-1 font-mono text-xs">absolute</code>  {copy("overlayPositioningTabbarUses")} <code className="rounded bg-surface-hover px-1 font-mono text-xs">fixed=&#123;false&#125;</code>{copy("andActionsheetUsesABaseUiDialogPortalWithoutAffectingTheInFrameLayout")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
