# 瀚播 HanLive · AI 实时直播工作站 — 设计 spec

- 日期：2026-06-05
- 类型：内置 demo + 6 个新组件（demo 驱动 UI 库成长）
- 路由：`/demos/live`
- 状态：设计已确认，待实现

## 1. 命题与目的

**根本目的：用 demo 驱动 @hulianui/ui 库成长。** 这个 demo 的真正交付物不是页面，而是它从「实时直播」这个真实场景里逼出来的一批新组件。库里此前**没有任何直播类组件**（grep 仅命中 emoji-data），`Video` 是 vidstack 的 VOD 播放器，撑不了直播态——这是一整块空白。

场景采用「主播中控 + C 端观众」**融合**：一套实时引擎驱动两张脸。

- **主播 AI 中控台**（B 端）：AI 副驾实时看弹幕/在线/带货，自动答弹幕、智能提词、提醒上小黄车、情绪与转化分析。
- **C 端观众直播间**：竖屏直播 + 弹幕 + 礼物连击 + 飘心点赞 + 小黄车抢购 + AI 客服浮层。

## 2. 硬约束（来自用户 + 项目规范）

1. **100% 由 @hulianui/ui 组件实现**，demo 里**不允许打 CSS 补丁 / 行为 hack**。需要补丁 = 组件有缺口 → 去库里修组件/造组件（参考既有 skill `fix-component-not-demo-css-patch`）。
2. **禁止远程资源**（gallery 门禁）：图片/视频/字体全本地化。直播画面复用现成本地 `public/demo/sample-video.mp4`。
3. **static export 友好**：动态路由须 `generateStaticParams` + server page 拆 client 子组件（skill `nextjs-output-export-dynamic-route-server-static-params`）。
4. 新组件遵循库工程约定：四件套 + 5 处注册链（见 §6）。

## 3. 6 个新组件（交付物）

每个都是「小而边界清」的独立件，可单独复用，各带 `.showcase.tsx`；含纯函数/可测逻辑的另带 `.test.ts(x)`。

### 3.1 Danmaku（弹幕引擎）· `packages/ui/src/danmaku/`
- **归类**：`data-display` / `collection`
- **本质**：轨道分配防重叠的滚动弹幕层。Marquee 做不了轨道碰撞 → 真缺口，旗舰件。
- **API**：
  ```ts
  type DanmakuMode = "scroll" | "top" | "bottom";
  interface DanmakuItem {
    id: string;             // 受控去重键：组件内部记已上屏 id，只对「新增且未上屏」的入场
    text: ReactNode;
    mode?: DanmakuMode;     // 默认 scroll
    color?: string;         // 默认继承（token）
    size?: "sm" | "md" | "lg";
    bold?: boolean;
  }
  interface DanmakuProps {
    items: DanmakuItem[];   // 受控追加流（只增不改既有）
    tracks?: number;        // 轨道数，默认 4
    speed?: number;         // px/s，默认 100；决定滚动时长 = (容器宽+弹幕宽)/speed
    density?: "low" | "normal" | "high"; // 同时在屏上限（轨道占用判定阈值）
    area?: number;          // 占用高度比 0–1，默认 1（满屏）
    opacity?: number;       // 默认 1
    paused?: boolean;       // 暂停所有动画
    className?: string;
  }
  ```
- **行为**：`pointer-events: none`（穿透到底层视频）。轨道分配：新弹幕选「上一条已离开入场区」的空闲轨道；无空闲轨道时（density 满）丢弃该条。滚动用 CSS `transform: translateX` + 每条独立 `transition`/keyframes 时长。`top`/`bottom` 居中定时停留后淡出。事件/回调用 latest-ref 防闭包过期（参考 Flow/useTicker 范式）。
- **可测纯函数**：`allocateTrack(occupancy, now, tracks) → trackIndex | -1`、`scrollDuration(containerW, itemW, speed)`，落 `danmaku-geometry.ts` + 单测。

### 3.2 LiveChat（直播聊天室消息流）· `packages/ui/src/live-chat/`
- **归类**：`data-display` / `collection`
- **本质**：高频自动滚动消息流，多消息类型。与 AI 轮次制 `conversation` 本质不同（这是观众侧滚动公屏）。
- **API**：
  ```ts
  type LiveChatItemType = "message" | "enter" | "gift" | "follow" | "system";
  interface LiveChatUser { name: string; avatar?: string; level?: number; badge?: ReactNode; }
  interface LiveChatItem {
    id: string;
    type: LiveChatItemType;
    user?: LiveChatUser;
    text?: ReactNode;                 // message
    gift?: { name: string; icon?: ReactNode; combo?: number }; // gift
    at?: string;
  }
  interface LiveChatProps {
    items: LiveChatItem[];
    pinned?: LiveChatItem[];          // 顶部置顶区（公告/规则）
    autoScroll?: boolean;             // 默认 true
    maxItems?: number;                // 滚动窗保留上限（性能），默认 200
    renderItem?: (it: LiveChatItem) => ReactNode; // 自定义
    className?: string;
  }
  ```
- **行为**：新消息到达时，若用户停在底部 → 平滑滚到底；若用户上滚查看历史 → 浮出「N 条新消息」pill，点击恢复自动滚动并滚到底。各类型有默认样式（enter「xx 来了」淡色、gift 高亮、follow、system 居中）。

### 3.3 GiftFeed（礼物连击）· `packages/ui/src/gift-feed/`
- **归类**：`feedback` / `message`
- **本质**：左下角礼物横幅栈 + combo ×N 滚动计数 + 自动消散。
- **API**：
  ```ts
  interface GiftEvent {
    id: string;                       // 同 id 再次传入 → 视为同一连击，combo 递增动画
    user: { name: string; avatar?: string };
    gift: { name: string; icon?: ReactNode; color?: string };
    combo?: number;                   // 当前连击数（调用方维护合并，组件只负责动画呈现）
  }
  interface GiftFeedProps {
    events: GiftEvent[];              // 受控；组件内部按 id 维护「在屏横幅」生命周期
    max?: number;                     // 同时显示上限，默认 3（超出排队/挤掉最旧）
    duration?: number;               // 单条无新连击后停留 ms，默认 4000
    className?: string;
  }
  ```
- **行为**：横幅从左滑入，堆叠；combo 数字 bounce 滚动（复用 NumberTicker 思路或自带）；`duration` 内无新 combo → 淡出移除。combo 合并逻辑在调用方/reducer（可测），组件负责呈现 + 自动消散计时。

### 3.4 FloatingReactions（飘心点赞）· `packages/ui/src/floating-reactions/`
- **归类**：`feedback` / `message`
- **本质**：命令式从一点喷射、上浮、横向漂移、渐隐的表情/心。可复用于任何「点赞」按钮。
- **API**：
  ```ts
  interface FloatingReactionsHandle {
    emit: (content?: ReactNode, opts?: { count?: number }) => void;
  }
  interface FloatingReactionsProps {
    palette?: ReactNode[];           // 不传 content 时随机取一个，默认一组心/表情
    rise?: number;                   // 上浮高度 px，默认 220
    drift?: number;                  // 横向漂移幅度 px，默认 40
    duration?: number;               // ms，默认 2200
    className?: string;              // 容器（相对定位，pointer-events none）
  }
  ```
- **用法**：`const ref = useRef<FloatingReactionsHandle>(null); ref.current?.emit("❤️")`。`forwardRef` + `useImperativeHandle`。每次 emit 生成 N 个节点（随机起点 x、漂移、缩放、时长扰动），动画结束自移除。容器 `pointer-events: none`。

### 3.5 LivePlayer（直播播放器壳）· `packages/ui/src/live-player/`
- **归类**：`data-display` / `collection`（媒体）
- **本质**：直播播放器外壳。**自带极简 muted 循环 `<video>`**（无 VOD scrubber chrome——直播不需要进度条），与 `Video`（VOD）明确互补。
- **API**：
  ```ts
  interface LivePlayerHost { name: string; avatar?: string; followed?: boolean; onFollow?: () => void; }
  interface LivePlayerProps {
    src?: string;                    // 本地 mp4（muted/loop/autoPlay 内部固定）
    poster?: string;
    surface?: ReactNode;             // 自定义画面（程序化场景）；存在时优先于 src
    live?: boolean;                  // LIVE 呼吸徽标，默认 true
    viewers?: number;                // 在线人数（NumberTicker 跳数）
    qualities?: string[];            // 清晰度档；quality/onQualityChange 受控
    quality?: string; onQualityChange?: (q: string) => void;
    host?: LivePlayerHost;           // 顶部主播条（头像/名/关注）
    orientation?: "portrait" | "landscape"; // 默认 landscape
    overlay?: ReactNode;             // 弹幕/飘心/礼物挂载层（绝对铺满，在画面之上）
    footer?: ReactNode;              // 底部互动栏插槽
    aspectRatio?: string;            // landscape 默认 16/9；portrait 9/16
    className?: string;
  }
  ```
- **行为**：画面层（surface 或 `<video muted loop autoPlay playsInline>`）→ 顶部主播条 + LIVE 徽标 + 在线人数 + 清晰度菜单 → overlay 层 → footer 插槽。低延迟标识。竖屏时按 9/16。

### 3.6 LiveProductCard（小黄车讲解卡）· `packages/ui/src/live-product-card/`
- **归类**：`data-display` / `info`
- **本质**：直播带货商品卡，有独立解剖（序号链接、划线价/秒杀价、讲解中脉冲、抢购）。
- **API**：
  ```ts
  interface LiveProductCardProps {
    index?: number;                  // 第 N 号链接徽标
    image: string;
    title: ReactNode;
    price: number;
    originalPrice?: number;          // 划线原价
    explaining?: boolean;            // 「讲解中」脉冲徽标
    stock?: number;                  // 剩余库存
    sold?: number;                   // 已售
    tag?: ReactNode;                 // 「秒杀」「限量」等
    action?: ReactNode;             // 抢购按钮（调用方传 Button）
    layout?: "row" | "card";         // row=列表行（中控/弹层），card=网格卡
    onClick?: () => void;
    className?: string;
  }
  ```

## 4. 实时引擎（确定性可复现）

走 **customer-service 同款范式**：**纯 reducer（可单测）+ 定时器 hook 派发事件 + `mulberry32` 种子选内容池**。不用 MSW（避开 static export + headless 截图门禁摩擦）。

- `app/demos/live/_lib/live-sim.ts`：纯函数
  - `reducer(state, action)`：`DANMAKU_PUSH` / `CHAT_PUSH` / `GIFT`（combo 合并）/ `VIEWERS_STEP` / `LIKE_BURST` / `AI_SUGGEST`（生成一条 AI 建议/答弹幕草稿）。
  - 内容池（弹幕文案、用户名、礼物、商品问题）+ `mulberry32(seed)` 决定每 tick 取哪条 → SSR/CSR 一致、截图与测试可复现。
- `app/demos/live/_lib/use-live-sim.ts`：`"use client"`，`useReducer` + 多个 `setInterval`（弹幕 ~700ms、礼物 ~3s、在线跳数 ~2s、AI 建议 ~6s），latest-ref 持有派发器。`running` 可暂停。
- **同一份 broadcast 状态供两个视角消费**（中控看监看面板，观众看公屏/弹幕）——两视图各自挂 hook，种子相同 → 内容一致。

## 5. 视图结构

品牌「瀚播 HanLive」，命名延续 瀚x 系。目录 `app/demos/live/`。

```
app/demos/live/
  login/page.tsx                 # 主播开播登录（复用 login-form 范式）
  (studio)/layout.tsx            # AdminLayout 侧栏外壳（中控台）
  (studio)/page.tsx              # 直播中控（主页）
  (studio)/products/page.tsx     # 小黄车管理
  (studio)/review/page.tsx       # 数据复盘
  room/page.tsx                  # C 端观众直播间（竖屏全屏，独立外壳）
  _components/...                 # 各视图 client 子组件
  _data/...                      # mock 数据（主播/商品/内容池/类型）
  _lib/live-sim.ts, use-live-sim.ts
```

### 5.1 直播中控（`(studio)/page.tsx`）
- LivePlayer 预览（本地 mp4，landscape，挂 LIVE/在线）
- 实时 KPI：在线 / 点赞 / 评论 / 成交（NumberTicker）+ Chart 趋势
- LiveChat 弹幕监看（右栏）
- **AI 副驾面板**：`agent-plan`（当前直播策略）/ `thinking-block`（实时分析弹幕情绪）/ `tool-call`（「上架 3 号链接」「发 3 折券」「置顶问题」）/ `streaming-text` 自动答弹幕草稿 + 一键采用（采用→push 进公屏）

### 5.2 小黄车管理（`(studio)/products/page.tsx`）
- ProTable 商品列表 + Sortable 排讲解顺序 + 「一键讲解」（标 explaining）+ LiveProductCard 预览（card layout）

### 5.3 数据复盘（`(studio)/review/page.tsx`）
- Chart 密集：转化漏斗 / 礼物趋势 / 观众画像 / 时段在线（复用 dashboard 思路）+ Stat 概览

### 5.4 C 端观众直播间（`room/page.tsx`）
- LivePlayer（mp4，portrait 9/16，全屏沉浸）
- overlay = Danmaku 覆盖 + FloatingReactions（飘心）+ GiftFeed（礼物连击）
- 顶部：主播头像/名/关注 + 在线
- footer 互动栏：点赞（→ `ref.emit` 飘心 + LIKE_BURST）/ 弹幕输入（→ DANMAKU_PUSH + CHAT_PUSH）/ 礼物面板（→ GIFT combo）/ 分享
- 小黄车：底部「购物袋」角标弹出 LiveProductCard 列表（row layout）+ 抢购（Coupon/倒计时复用）
- 公屏：LiveChat（半屏底部叠加）
- AI 客服：浮层 mini `conversation`（观众问「怎么买」「有券吗」→ 流式答）

## 6. 注册链（每个新组件 5 处）

1. `packages/ui/src/<comp>/`：`<comp>.tsx`、`<comp>.types.ts`（可内联）、`<comp>.showcase.tsx`、`<comp>.test.ts(x)`（有纯函数则必带）、`index.ts`
2. `packages/ui/src/index.ts`：`export * from "./<comp>";`
3. `packages/ui/src/showcase.ts`：`export { <comp>Showcase } from "./<comp>/<comp>.showcase";`
4. `apps/www/lib/manifest.ts`：`{ slug, name, description, category, group, status:"new", tags? }`
5. `apps/www/lib/registry.tsx`：import 块加 `<comp>Showcase` + 映射对象加 `<slug>: <comp>Showcase,`

demo 自身：`app/demos/lib/demos.ts` 注册一条 DemoMeta（slug=`live`，category=「直播电商」或「AI 应用」）。

## 7. 测试与验证

- **库单测**（vitest）：Danmaku（allocateTrack/scrollDuration 纯函数 + 渲染入场）、GiftFeed（combo 合并/生命周期）、FloatingReactions（emit 增删节点）、LiveChat（自动滚/恢复钮）、LiveProductCard（划线价/讲解中渲染）、live-sim reducer（每个 action）。目标：全套绿，新增不破坏既有 1278+ 测。
- **实机像素自证**：CDP 隔离 Chrome（skill `mcp-browser-busy-launch-isolated-chromium-via-executablepath` / `no-repeated-chrome-for-testing-launch-keychain-spam`，单实例复用避免钥匙串轰炸），截：中控台、观众直播间、礼物连击瞬间、弹幕飞过、小黄车弹层、AI 副驾——亮 + 暗各一轮，0 console error。
- 验证用 `pnpm --filter www dev`（不跑根 `pnpm dev`，避免 kill:stale 误杀 5514，skill `hulian-pnpm-dev-killstale-kills-5514`）。

## 8. 范围与非目标（YAGNI）

- 不接真实直播流/推拉流/WebRTC——纯前端模拟。
- 不做真实支付/下单——抢购到「下单成功」toast 即止。
- 不做后台管理 CRUD 全链路——小黄车仅排序 + 讲解开关。
- AI 副驾是模拟（种子驱动文案），非真实模型调用。
- 不引入新运行时依赖——6 个组件全部零依赖（复用库内既有原语 + token）。
