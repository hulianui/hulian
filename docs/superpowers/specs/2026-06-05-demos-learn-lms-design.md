# 在线教育 LMS Demo「瀚学」设计（让 Video 升主角）

> 日期：2026-06-05 · 第 10 个内置 demo · slug=`learn` · category「在线教育」
> 配套铁律：`apps/www/app/demos/README.md`（dogfood / 生命周期 / 覆盖 / 零外链）

## 0. 第一性目标

前 9 个 demo 里 Video 只是 ai-workflow 产物画廊的一个配角弹窗。LMS 是 Video **天然的主角场景**——
课程播放页就是「一块大屏 + 围绕它的学习态」。本 demo 的存在价值不是「又一个卡片网格」（shop/personal
已演透），而是：

1. **把 Video 从「画廊片段」升级为「教学主角」**——并据此给 `@hulian/ui` 的 Video 组件补三个真实
   LMS 特性（章节标记 / 结束屏 / 续播）。
2. **点亮 Tree**（当前 0 覆盖的最大危险盲区）——用作课程章节树。
3. 顺带在合理场景点亮 Stepper/Steps（报名）、Mentions（讨论 @）、Meter（难度/完成占比）等盲区。

## 1. 差异化（不做成又一个商品列表）

| 维度 | shop（电商） | learn（本 demo） |
|---|---|---|
| 重心 | 商品列表 → 详情 → 下单 | **课程播放页**（大 Video + 章节树 + 学习态） |
| 卡片动作 | 加入购物车 | **继续学习 / 学习进度条 / Rating** |
| 主角 | 商品图 | **视频播放器** |

卡片网格只是「入口」，真正的篇幅在播放页。卡片用学习态（进度 Progress + 评分 Rating + 学员数）前置，
不堆电商元素。

## 2. 路由结构（静态导出友好）

- `/demos/learn` — **课程目录**
  - 外壳 `learn-shell`（Navbar：课程目录 / 我的学习 / 关于；区别 shop 的购物车导航）
  - 卡片网格 + Tag 分类筛选（前端/设计/AI/职场…）+ 排序
  - 每卡片：程序化海报、标题、讲师、Rating、学员数、学习进度 Progress、「继续学习/立即报名」
  - 生命周期：首屏 Skeleton（≥300ms 可见）、筛选无结果 Empty、`failOnce` 加载失败 Alert+重试
- `/demos/learn/courses/[id]` — **课程播放页（主角）**
  - 静态导出：`generateStaticParams` 列出所有课程 id；server page 仅取数据，交互全在 client 子组件
    （记忆 `hulian-output-export-dynamic-route`）
  - 左：**大 Video 播放器**（章节标记 / 进度 / 倍速 / 全屏 / 续播 / 播完结束屏「下一节」）
  - 右：章节 **Tree**（章 → 小节；当前小节高亮、已完成打勾、点击切换播放）
  - 下：**Tabs**
    - 简介：Descriptions + 大纲 + 讲师卡 + Meter（难度/完成占比）+ 课件 FileTree（可下载，下载 toast）
    - 笔记：**MarkdownEditor** 写笔记 + 笔记列表（删除走 Popconfirm 二次确认 + toast）
    - 讨论：**Comment** 嵌套 + 发帖框（**Mentions** @ 讲师/同学）+ 发布 toast
- **报名/购买轻流程**：目录卡 / 播放页「报名」→ ModalForm（或 Drawer）内嵌 **Steps**
  （确认课程 → 选套餐 → 完成）→ 报名成功 toast。不开独立路由。

## 3. Video 组件增强（本次拓展 @hulian/ui 的核心，全部 additive 向后兼容）

改 `packages/ui/src/video/`：

### 3.1 `VideoProps` 新增（均可选）
```ts
chapters?: { time: number; title: string }[]; // 进度条章节分段标记（cue points）
startTime?: number;                            // 续播：加载后 seek 到此秒
endScreen?: ReactNode;                         // 播完(ended)浮现的结束屏内容（如「下一节」卡片）
```

### 3.2 实现要点
- **章节标记**：`video-controls.tsx` 读 `useMediaState("duration")`，在 `TimeSlider.Track` 上按
  `time/duration` 比例渲染竖向 tick；hover tick 显示章节名（复用现有 `TimeSlider.Preview` 风格或独立
  tooltip）。定位百分比抽纯函数 `chapterMarkers(chapters, duration)` 放 `video.types.ts`，带单测
  （边界：duration=0/NaN 返回空、time>duration 夹取、排序）。
- **续播**：`video.tsx` 用 `useMediaRemote` + `canPlay`/`loadedmetadata` 时机 seek 到 `startTime`
  （只在首次、且 startTime>0 时）。避免与用户拖拽冲突——仅初始一次。
- **结束屏**：`video-controls.tsx` 读 `useMediaState("ended")`，为真时在播放区中央浮现 `endScreen`
  覆盖层（半透明遮罩 + 内容 + 内置「重播」按钮，点重播 `remote.seek(0)+play`）。`endScreen` 为空则
  退化为纯重播按钮。
- 同步：`video.showcase.tsx` 加 `chapters`/`startTime`/`endScreen` 状态用例；`video.test.tsx` 加
  `chapterMarkers` 纯函数测试；`apps/www/lib/manifest.ts` 的 video 描述补「章节标记/续播/结束屏」。

## 4. Mock 数据与资源（零外链，铁律四）

- `_data/courses.ts`：6~8 门课，分 4 类。每门含：id、title、讲师、category、tags、rating、
  ratingCount、学员数、难度、价格、`progress`（0~100，模拟「我的学习」）、章节树
  （章 → 小节：title/duration/completed/videoSrc）。
- 视频源：**复用** `public/demo/sample-video.mp4`（库里唯一可用 mp4，离线无法程序化生成真 mp4）。
  章节标记在「当前这节课的单条视频」内分段演示——短片也能完整呈现 cue points。
- 海报：`_lib/poster.ts` 仿 `projects/_data/photos.ts` 的 `photoArt()`，按课程语义（分类→主色）
  程序化生成 SVG data-URI，与文案语义一致。
- 头像：讲师/讨论用 `public/demo/avatar-*.jpg` 或 Avatar fallback 首字母。
- 全内存 mock，经 `app/demos/lib/async.ts` 的 `useMockData`（首屏/失败重试）、`usePending`（动作 pending）
  包成异步。

## 5. 组件覆盖（量化「漏=危险」）

- **点亮 Tree**（最大盲区）。
- **强化 Video** 主角用例（章节/续播/结束屏）。
- 顺带点亮（仅在合理时上，不硬塞）：Steps/Stepper（报名流）、Mentions（讨论 @）、Meter（难度/完成占比）、
  FileTree（课件下载）。
- Comment / Rating 已被其它 demo 覆盖 → 这里给更真实用例。
- 既有高频件：Tabs、Descriptions、Progress、Tag、Avatar、Empty、Alert、Skeleton、Tooltip、Popconfirm、
  ModalForm、toast、Navbar、Carousel（目录页 banner，可选）。
- 验收：`pnpm --filter www demos:coverage` 覆盖率**只升不降**（当前 76%）。

## 6. 完整交互生命周期（铁律二逐环 · 验收清单）

- [ ] 首屏列表/详情 ≥300ms 可见 Skeleton。
- [ ] 每个增/删/改（报名/记笔记/删笔记/发讨论/下载课件/标记完成）都有 toast。
- [ ] 危险操作（删笔记/退课）Popconfirm 或 AlertDialog 二次确认。
- [ ] 纯图标按钮全 Tooltip。
- [ ] 筛选无结果 Empty；`failOnce` 模拟加载失败 Alert+重试。
- [ ] 该场景高频件尽量覆盖（章节树/视频/笔记编辑器/讨论 @/课件树）。
- [ ] 零外链：海报程序化、视频本地、头像本地/fallback。`demos:coverage` 外链门禁 0。

## 7. 验证（眼见为实）

- `pnpm --filter www dev` 起预览（不在根目录 `pnpm dev`，记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
- 视觉用**真实浏览器**截图（隔离 Chrome-for-Testing，记忆
  `mcp-browser-busy-launch-isolated-chromium-via-executablepath`；headless 全空白记忆
  `www-msw-gate-blanks-headless-screenshots`）。
- 必截：目录筛选、播放页（章节标记可见）、章节切换、续播/结束屏、报名流。零 console error。
- ui 包 `pnpm --filter @hulian/ui test` 全绿（含新增 chapterMarkers 测试）。

## 8. 落盘

- 共享文件（`lib/manifest.ts`、`demos.ts`、`registry.tsx`）用 hunk 级 `git apply --cached` 只暂存自己
  改动，避免卷走他人 WIP（README §6）。
- 本地 commit（仓库无 remote，纯本地）。
</content>
</invoke>
