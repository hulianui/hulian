# 移动端 Demo 设计（第 7 个内置示例）

> 日期：2026-06-04 ｜ 触发：真实化审计发现 `mobile` 整类 7 件 0 覆盖（无任何移动端 demo），demo 矩阵级战略盲区。本 demo 填平该盲区，同时把覆盖率推向 60%。

## 1. 命题

库里有完整移动端原语（TabBar/Fab/ActionSheet/Picker/SwipeAction/PullToRefresh/SafeArea），但 6 个 demo 全是桌面中后台/营销，移动端组件用户无处参考。建一个**手机视口的真实 App demo**，把这 7 件放进自然场景。

## 2. 主题与形态

**同城到家服务 App**（家政/维修/美甲上门下单）——移动 C 端高频场景，下单流、订单流、个人中心齐全。

- **形态**：桌面下居中 390px 手机视口列（圆角手机外壳 + 状态栏），`SafeArea` 处理顶部状态栏与底部 TabBar 安全区。
- **路由**：`(app)` 路由组，底部 `TabBar` 4 tab：首页 / 分类 / 订单 / 我的；外加服务详情下单页 `services/[id]`。

## 3. 组件覆盖（mobile 7 件 × 自然场景）

| 组件 | 落点 |
|---|---|
| `SafeArea` | shell 顶部状态栏 inset + 底部 TabBar inset（edges top/bottom） |
| `TabBar` | 底部主导航 4 tab（带未读 dot/badge） |
| `PullToRefresh` | 首页 feed 下拉刷新（`onRefresh` 走 sleep 模拟） |
| `Fab` | 首页右下角悬浮「一键下单 / 在线客服」（多 action 展开） |
| `SwipeAction` | 订单列表左滑「联系师傅」右滑「删除」（danger） |
| `ActionSheet` | 订单「更多」→ 取消订单/改约/联系；服务详情分享 |
| `Picker` | 下单页选预约时间（日期列 + 时段列 双列滚轮） |

## 4. 顺带覆盖的高频件（冲 60%，自然场景不堆砌）

`Rating`（师傅评价/评分）、`Stepper` 或 `NumberField`（数量/时长加减）、`Empty`（空订单）、`Avatar`(fallback 首字)、`Tag`、`Card`、`Divider`、`Statistic`（我的页累计）、`Stack`。加载用 `useMockData` + `ListSkeleton`；操作 `toast`；危险操作 ActionSheet danger / `Popconfirm`。

## 5. 交互态（沿用 README 铁律）

- 首页 feed / 订单列表 `useMockData` 加载骨架 + 下拉刷新。
- 每个 mutation（下单/取消/改约/评价）`toast` 反馈。
- 取消订单走 ActionSheet danger 二次确认。
- 空订单 `Empty`。

## 6. 资源本地化（铁律四，门禁强制 0 外链）

服务封面/师傅头像**禁止外链**：头像 `Avatar fallback` 首字；服务封面程序化 SVG data-URI（参考 `projects/_data/photos.ts` `photoArt()` 或 `ai-workflow/_lib/artwork.ts` mesh gradient，按品类配色）。

## 7. 结构

```
apps/www/app/demos/mobile/
  (app)/layout.tsx              手机外壳: SafeArea top + 内容 + 底部 TabBar(client shell)
  (app)/page.tsx                首页 feed(PullToRefresh + Fab + 服务卡片)
  (app)/categories/page.tsx     分类
  (app)/orders/page.tsx         订单(SwipeAction 列表 + ActionSheet 更多 + Empty)
  (app)/profile/page.tsx        我的(Statistic + 列表)
  (app)/services/[id]/page.tsx  服务详情下单(Picker 预约时间 + Stepper 时长 + 下单 toast) —— server page + generateStaticParams + client 子组件
  _components/mobile-shell.tsx  client: TabBar 受控导航 + 手机 chrome
  _components/*                 feed/order/detail 子件
  _data/{services,orders,types}.ts
  _lib/cover.ts                 程序化封面 SVG 生成器(本地)
```

静态导出：`[id]` 必须 `generateStaticParams` 且拆 server page + client 子组件（记忆 `hulian-output-export-dynamic-route`）。

## 8. 注册

`apps/www/app/demos/lib/demos.ts` 加第 7 条：slug `mobile`、category「移动端」、status `done`、tags `[TabBar, SwipeAction, Picker, PullToRefresh]`。

## 9. 验收

- mobile 7 件全部在 demo 出现，`demos:coverage` 的 mobile 类盲区清零。
- 覆盖率冲 ≥ 60%。
- 远程外链 0；typecheck 0 错；路由运行时 200。
- 真实手机视口下 TabBar 切换、下拉刷新、左滑、Picker 滚轮、ActionSheet 弹出像素可见。
