# 内置 Demo · C 端买家商城「瀚选 HanShop」设计

> 日期：2026-06-04　·　状态：已批准（用户 /goal「按最全的做完」）
> 配套铁律：`apps/www/app/demos/README.md`　·　覆盖率门禁：`pnpm --filter www demos:coverage`

## 0. 目标与第一性原则

这是瑚琏第 7 个内置 demo，也是**首个 C 端电商**。它的根本目的不是「做个好看的商城」，而是**用一个真实电商全链路把当前 87 个零覆盖组件尽可能多地塞进合理场景**，以 dogfood 驱动组件库迭代并暴露缺口。

- 当前覆盖率 **54%（101/188）**。本 demo 目标把覆盖率拉到 **≥ 72%**。
- 缺口在 build 过程中浮现就回 `@hulian/ui` 补，**demo 内零 CSS 补丁**（铁律一）。
- 全 mock 内存态，无后端；所有「网络」走 `demos/lib/async.ts` 的 `useMockData` / `usePending` 异步化（铁律二）。
- 所有图片/头像/banner **程序化生成**（语义配色 SVG / data-URI），零外链（铁律四）。

## 1. 新建组件（真缺口）

### 1.1 Coupon 优惠券（锁定，必建）
- 归类：`data-display` / `info`，slug `coupon`，name `Coupon`。
- 造型：撕票卡片 —— 左右半圆穿孔 + 中缝虚线撕边，纯 CSS（`radial-gradient` 凿孔 + `border-dashed` 缝线 + `mask`），不可由现有组件干净拼出。
- 形态：满减 / 折扣 / 无门槛三类，由 `kind` + `amount`/`discount` 派生主视觉大字。
- 态：`available`（可领）/ `claimed`（已领）/ `used`（已用）/ `expired`（已过期），驱动右侧按钮文案与置灰。
- 槽：面额区（左）+ 信息区（标题/门槛/有效期，中）+ 操作区（按钮/状态，右，沿穿孔切分）。
- 受控 `onClaim`/`onUse` 回调；纯 CSS 皮肤吃语义 token；带 `coupon.test.tsx` + `coupon.showcase.tsx`。
- 接线：`src/coupon/index.ts` → `src/index.ts` barrel → `src/showcase.ts` → `apps/www/lib/registry.tsx` → `apps/www/lib/manifest.ts`。

### 1.2 Price 价格（待定，build 中按需）
- 若 demo 中价格排印反复手搓（货币符 + 千分位 + 划线原价 + 折扣角标）则建为 `data-display`/`info` 小原语；否则用 `Text` 组合不强建。

## 2. 路由与页面（`/demos/shop`）

公开店铺壳（仿 `website` 范式），账户区轻量。`(shop)` 路由组共享 `ShopShell`。

| 路由 | 内容 | 主覆盖组件 |
|---|---|---|
| `(shop)/layout.tsx` | ShopShell：顶栏 Logo + 搜索(Combobox) + 分类 MegaMenu(NavigationMenu) + 购物车 Badge + 主题切换 | NavigationMenu, Combobox, Badge |
| `(shop)/page.tsx` | 首页：Hero 轮播 + 限时秒杀条(Statistic.Countdown) + 分类入口 + 优惠券领取(Coupon) + 商品流(网格→分页) + 营销标题(SparklesText/AnimatedGradientText) | Carousel, Statistic.Countdown, Coupon, MagicCard, SparklesText, ShineBorder |
| `(shop)/products/page.tsx` | 商品列表：侧栏筛选(价格区间 Slider/品牌 CheckboxGroup/规格 Chip) + 排序 + 网格 + 分页 / 无限滚动(InfiniteScroll) + Empty / 失败重试 | CheckboxGroup, Chip, Pagination, InfiniteScroll, Empty, Rating, Slider |
| `(shop)/product/[id]/page.tsx` | 商品详情：图廊(Carousel+Lens 放大) + 价格(Price/Countdown) + SKU(ColorSwatchPicker 颜色 + Chip 尺码) + 数量(NumberField) + Affix 吸底购买栏 + Anchor 锚点(详情/规格/评价) + 评价区(Rating 分布 Meter + AvatarCircles + Comment) + 快速查看 Modal + 移动端「扫码体验」入口 | Lens, ColorSwatchPicker, NumberField, Affix, Anchor, Meter, AvatarCircles, Comment, Modal, Collapsible |
| `(shop)/cart/page.tsx` | 购物车：CheckboxGroup 多选 + NumberField 改数量 + Popconfirm 删除 + 合计 + 去结算 + Empty 空车 | CheckboxGroup, NumberField, Popconfirm, Empty |
| `(shop)/checkout/page.tsx` | 结算：Steps 三步(确认订单→支付→完成) + 收货地址(RegionCascader) + 配送方式(Radio) + 支付方式(Radio) + 用券(Coupon) + 提交(usePending+Spinner) | Steps, RegionCascader, RadioGroup, Coupon, Result |
| `(shop)/orders/page.tsx` | 我的订单：Tabs 状态分组 + 列表 + 状态 Tag + 物流详情(Drawer + Timeline) + 退款(Popconfirm) + 评价(Rating) | Tabs, Tag, Drawer, Timeline, Rating, Popconfirm |
| `(shop)/compare/page.tsx` | 商品对比：Table 横向参数对比(高亮差异) + 移除 | Table, Chip |
| `(shop)/favorites/page.tsx` | 收藏夹：网格 + 取消收藏(Popconfirm) + Empty + 批量加购 | Card, Popconfirm, Empty |
| `(shop)/account/page.tsx` | 会员中心：等级进度(Progress/Meter) + 我的优惠券(Coupon Tabs) + 资料表单(ProForm) + 地址簿(RegionCascader) + 注销(AlertDialog) | Statistic, Coupon, ProForm, Descriptions, AlertDialog |
| `(shop)/mobile/page.tsx` | 移动端店铺预览：iPhone 外壳包一套「活的」手机商城 | iPhone, TabBar, Fab, ActionSheet, SwipeAction, PullToRefresh, Picker, SafeArea |
| `login/page.tsx` | 账户登录（轻量，仿 crm/login） | ProForm, Button |

## 3. 移动端迷你商城（`(shop)/mobile`）

桌面页居中放 `iPhone` 外壳，内含**可交互**迷你商城（独立子组件树，受 SafeArea 约束）：
- 首页：`PullToRefresh` 下拉刷新 + 商品瀑布流。
- 底部 `TabBar`（首页/分类/购物车[角标]/我的）。
- `Fab` 悬浮客服 speed-dial。
- 购物车 tab：`SwipeAction` 左滑删除。
- 分类/筛选：`ActionSheet` 底部弹起。
- 选规格/选地区：`Picker` 滚轮。
- 全程 `SafeArea` 吃刘海/底部横条。

## 4. 数据层（`shop/_data/`）

全内存 mock，程序化生成图：
- `types.ts` — Product / Sku / Category / CartItem / Order / Coupon / Review / Address 类型。
- `products.ts` — 商品目录（含多 SKU、价格/原价、库存、评分、销量），`productArt(seed)` 按品类语义配色生成 SVG 图（仿 `projects/_data/photos.ts`）。
- `categories.ts` — 分类树（MegaMenu + 筛选）。
- `coupons.ts` — 优惠券池。
- `reviews.ts` — 评价（含评分分布、追评、晒图）。
- `orders.ts` — 订单（多状态 + 物流轨迹）。
- `regions.ts` — 省市区级联数据（精简，供 RegionCascader）。
- `metrics.ts` — 会员中心统计。

`_components/` — `shop-shell.tsx`、`product-card.tsx`、`sku-selector.tsx`、`review-section.tsx`、`mobile-store.tsx`、`nav-config.ts` 等。

## 5. 铁律合规自检（提交门槛）

- [ ] 列表/详情首屏 ≥300ms 可见 Skeleton/Spinner（useMockData 驱动）。
- [ ] 每个增删改（加购/删购/下单/退款/领券/收藏）都有 `toast` 反馈。
- [ ] 危险操作（删购/清空/注销/退款/结单）有 Popconfirm/AlertDialog 二次确认。
- [ ] 纯图标按钮全部 Tooltip。
- [ ] 筛选无果 Empty；模拟一次加载失败 Alert/Result + 重试。
- [ ] 零外链：商品图/banner/头像全程序化生成或 `Avatar` fallback。
- [ ] `demos:coverage` 覆盖率只升不降，远程资源外链 = 0。

## 6. 验证

- 真实浏览器/隔离 Chrome-for-Testing 截图（headless CLI 全站空白，见记忆 `www-msw-gate-blanks-headless-screenshots`）。
- `pnpm --filter @hulian/ui test`（Coupon 测试随全套绿）。
- `pnpm --filter www demos:coverage`（覆盖率 + 外链门禁）。
- 起预览 `pnpm --filter www dev`（勿在根目录 `pnpm dev`，会杀桌面 app 5514）。

## 7. 落盘

- 共享文件（`lib/manifest.ts`/`lib/registry.tsx`/`showcase.ts`/`src/index.ts`）带其它会话 WIP，落盘用 hunk 级 `git apply --cached` 只暂存自己改动。
- `product/[id]` 静态导出：`generateStaticParams` + server page 拆 client 子组件。
