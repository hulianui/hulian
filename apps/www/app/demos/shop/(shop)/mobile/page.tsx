"use client";
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
        <h1 className="text-2xl font-bold text-foreground">H5 商城 · 移动端体验</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          瀚选移动版完整演示：TabBar 底导、PullToRefresh 下拉刷新、SwipeAction 左滑删除、
          ActionSheet 筛选、Picker 选规格、Fab 悬浮客服、SafeArea 安全区适配。
          所有浮层约束在手机屏幕内，不跑出外壳。
        </p>
      </div>

      {/* 手机展示区 — 并排放两台显示不同状态 */}
      <div className="flex flex-wrap items-start justify-center gap-10">
        {/* 主机：默认首页 tab */}
        <div className="flex flex-col items-center gap-3">
          <IPhone model="16-pro">
            <MobileStore />
          </IPhone>
          <p className="text-xs text-muted">iPhone 16 Pro · 首页 / 分类 / 购物车 / 我的</p>
        </div>

        {/* 说明卡片（桌面端 md 以上才显示） */}
        <div className="hidden max-w-xs space-y-4 rounded-xl border border-border bg-surface p-5 shadow-sm md:block">
          <h2 className="text-base font-semibold text-foreground">Mobile 组件族覆盖清单</h2>
          <ul className="space-y-2 text-sm text-muted">
            {[
              ["IPhone", "设备外壳，children 填充屏幕"],
              ["SafeArea", "顶部刘海 + 底部横条适配"],
              ["TabBar", "fixed={false} 随文档流贴屏底"],
              ["PullToRefresh", "首页商品列表下拉刷新"],
              ["ActionSheet", "分类页筛选排序弹单"],
              ["Picker", "规格/颜色滚轮选择"],
              ["SwipeAction", "分类商品行 + 购物车行左滑操作"],
              ["Fab", "右下角悬浮客服 speed-dial"],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2">
                <span className="font-mono text-xs font-medium text-primary">{name}</span>
                <span className="text-xs">{desc}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted">
              浮层定位方案：屏幕容器设 <code className="rounded bg-surface-hover px-1 font-mono text-xs">relative</code>，
              Fab 用 <code className="rounded bg-surface-hover px-1 font-mono text-xs">absolute</code> 覆盖层，
              TabBar 用 <code className="rounded bg-surface-hover px-1 font-mono text-xs">fixed=&#123;false&#125;</code>，
              ActionSheet 基于 Base UI Dialog Portal 挂根节点不影响屏内布局。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
