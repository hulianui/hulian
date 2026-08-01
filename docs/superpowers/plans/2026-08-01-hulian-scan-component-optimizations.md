# Hulian Scan 组件性能优化实施计划

> **执行边界：** 仅优化 HulianUI 仓库自身与内部扫描工具，不把 Hulian Scan 做成对外产品。每项源码改动必须保留首次 packed 证据，并用同一场景在 workspace 与仓库外 tarball 消费态复测。

**Goal:** 把首轮 packed 扫描的 125 条硬 findings 全部归因到可信环境和真实更新路径，修复仍可复现的 HulianUI 性能问题，并建立 React 18/19 可执行门禁。

**初始证据：** revision `50f1d19`，React 19.2.8，Chromium 151，372/372 场景，190 个 diagnosis，0 执行错误；55 avoidable-render、41 cascade-fanout、16 long-task、13 dropped-frames。首版基线只包含 264 个无硬违规场景。

**原则：**

- 不把 SwiftShader 软件 GPU 的耗时伪装成组件缺陷；先记录 renderer，再在 Metal 上复测 WebGL。
- 不把初次 mount 的 Fiber 数量叫作“更新级联”；级联预算只评价 mount 后的更新 commit。
- 不批量塞自定义深比较。只有稳定 props 能用 React 浅比较安全跳过时才加 `memo`；函数、ReactNode 或可变对象必须有单独证据。
- 不通过抬高全局预算消除红线。可以为语义上必需的大型 mount 记录独立指标，但交互更新仍须优化。
- 每个任务先写失败测试，再做最小改动，再跑定向 workspace + packed 场景。

---

## Task 1：修正 GPU 与 cascade 的测量语义

**Files:**

- Modify: `packages/hulian-scan/src/contracts.ts`
- Modify: `packages/hulian-scan/src/analyzer/budgets.ts`
- Modify: `packages/hulian-scan/src/analyzer/budgets.test.ts`
- Modify: `packages/hulian-scan/src/report/baseline.ts`
- Modify: `packages/hulian-scan/src/report/baseline.test.ts`
- Modify: `packages/hulian-scan/src/runner/default-dependencies.ts`
- Modify: `packages/hulian-scan/src/runner/default-dependencies.test.ts`
- Modify: `apps/perf-lab/app/window-api.ts`
- Modify: `apps/perf-lab/app/window-api.test.ts`
- Modify: `apps/perf-lab/scenarios/specialized/animation.tsx`
- Modify: `apps/perf-lab/scenarios/specialized/specialized.test.tsx`

**Owns initial findings:** 16 `long-task`、13 `dropped-frames`，以及全部 41 个 `cascade-fanout` 的 mount/update 重新归因。WebGL 原始目标：FaultyTerminal、GradientBlinds、DarkVeil、CircularGallery、ColorBends、FloatingLines、Ferrofluid、GridScan、Lightfall、LiquidEther、Grainient、LaserFlow、SoftAurora、Ribbons、Galaxy、FlyingPosters、LightPillar、LiquidChrome、PixelSnow、Prism、PrismaticBurst、Threads、Plasma。

- [ ] **Step 1：写失败测试——场景携带 `webgl`，运行结果携带 GPU renderer/mode**

  `PerformanceScenario` 增加 `webgl?: boolean`；animation factory 从 inventory 透传。浏览器运行前用 `WEBGL_debug_renderer_info` 记录 `gpuRenderer` 与 `gpuMode: hardware | software | unavailable`。

- [ ] **Step 2：写失败测试——Darwin Chromium 使用 Metal，其他平台不硬编码**

  抽出纯函数 `chromiumLaunchOptions(platform)`；darwin 返回 `--use-angle=metal`，Linux CI 保持可启动并依赖运行时 renderer 判断。

- [ ] **Step 3：写失败测试——WebGL + software GPU 不产生帧耗时硬违规，也不能进入 GPU 基线**

  SwiftShader 场景仍保留 commit/fiber/interaction 原始样本，但 `longTaskMs`、`droppedFrameRatio` 不用于 WebGL 硬门禁或 baseline 更新；报告明确写 `gpuMetricsTrusted=false`。硬件 GPU 仍执行原预算。

- [ ] **Step 4：写失败测试——cascade 不统计 `mount`/`unmount` commit**

  `metrics()` 同时产出 `mountFanout` 与 `cascadeFanout`；后者只取 mount 后的 props/state/context/interaction/stress 更新。已知大 mount + 小更新 fixture 应通过，大更新 fixture 应失败。

- [ ] **Step 5：实现并验证**

  Run: `pnpm --filter @hulianui/hulian-scan test && pnpm --filter @hulianui/perf-lab test`

- [ ] **Step 6：用 Metal 对首轮全部 WebGL 命中项重测 5 次**

  Run: `HULIAN_SCAN_RERUN="<23 scenarios>" pnpm scan -- --resume --output .hulian-scan/metal-recheck`

  Expected: 每个 WebGL run 的 renderer 为 Apple Metal；只把仍超 100ms/5% 的目标交给组件源码任务。初步单样本：LaserFlow 89ms、Galaxy 70ms 已低于预算；FaultyTerminal 511ms 仍失败。

---

## Task 2：为 Select/Combobox 大数据列表加入自动虚拟化

**Files:**

- Modify: `packages/ui/src/combobox/combobox.tsx`
- Modify: `packages/ui/src/combobox/combobox.types.ts`
- Modify: `packages/ui/src/combobox/combobox.test.tsx`
- Modify: `packages/ui/src/select/select.tsx`
- Modify: `packages/ui/src/select/select.test.tsx`
- Modify: `packages/ui/src/country-select/country-select.tsx`
- Modify: `packages/ui/src/country-select/country-select.test.tsx`
- Verify: `apps/perf-lab/scenarios/specialized/select.tsx`
- Verify: `apps/perf-lab/scenarios/generated.ts` (`country-select/basic`, `combobox/basic`)

**Before:** `select/stress` median commit 72.7ms、cascade 567；`country-select/basic` 46.2ms、cascade 287；`combobox/basic` cascade 52。

- [ ] **Step 1：写失败测试——1000 项打开时只挂载可视窗口**

  用 Base UI 原生 `virtualized`、`Combobox.useFilteredItems()` 与现有 `@tanstack/react-virtual`；断言 option DOM 数小于 40，同时第 999 项搜索、键盘导航和选择仍成功。

- [ ] **Step 2：实现内部虚拟列表**

  `Combobox` 根据 items 数量（默认阈值 100）建立内部 virtualization context；`ComboboxContent` 用 filtered items 建 window，保留现有 render-function API、a11y index、远程分页 scroll 与 footer。小列表 DOM 完全不变。

- [ ] **Step 3：稳定 Select/CountrySelect 的映射函数和值对象**

  对 `toItemData`、`isItemEqualToValue`、`itemToStringLabel`、CountrySelect 的 `renderRow`/搜索函数使用证据支持的 callback/memo，避免 root state 更新制造新函数引用。

- [ ] **Step 4：定向复测**

  Run: `pnpm scan -- --scenario select/stress --scenario country-select/basic --scenario combobox/basic --output .hulian-scan/select-optimized`

  Run: `PERFORMANCE_CONSUMER_DIR="$(mktemp -d)" bash scripts/performance-consumer.sh --scenario select/stress --scenario country-select/basic --scenario combobox/basic --output .hulian-scan/select-optimized-packed`

  Required: Select/CountrySelect 的更新 cascade < 30，median commit 至少下降 50%，搜索/选择 E2E 无回归。

---

## Task 3：降低 FaultyTerminal shader 编译与像素成本

**Files:**

- Modify: `packages/ui/src/faulty-terminal/faulty-terminal.tsx`
- Modify: `packages/ui/src/faulty-terminal/faulty-terminal.test.tsx`
- Verify: `apps/perf-lab/scenarios/generated.ts` (`faulty-terminal/frame-budget`)

**Before:** packed SwiftShader p95 long task 1949ms、掉帧 44.79%；同 tarball Metal 单样本仍为 511ms long task、掉帧约 0.52%。

- [ ] **Step 1：写失败测试——内部渲染尺寸有上限且 CSS 尺寸不变**

  导出纯函数 `faultyTerminalRenderSize(width, height)`；560×256 宿主的内部像素面积不得超过 CSS 面积的 36%，根 canvas 仍铺满宿主。

- [ ] **Step 2：消除九次重复噪声场求值**

  把 cell intensity 与 digit mask 分离：同一 3×3 光晕采样共享 cell pattern；`noiseAmp=0` 的默认路径不进入 fbm。保留 scanline、mouse、page-load、chromatic、curvature 公共行为。

- [ ] **Step 3：Metal 五样本复测**

  Required: p95 long task < 100ms、dropped frame ratio < 5%；若只剩首次 shader compile >100ms，继续减少静态 shader 分支，不以 warmup 隐藏。

---

## Task 4：优化九个高重复成本组件的稳定父更新

**Files and ownership:**

| Scenario | Before renders | Source | Test |
| --- | ---: | --- | --- |
| `qrcode/basic` | 55 | `packages/ui/src/qrcode/qrcode.tsx` | `packages/ui/src/qrcode/qrcode.test.tsx` |
| `scheduler/basic` | 55 | `packages/ui/src/scheduler/scheduler.tsx` | `packages/ui/src/scheduler/scheduler.test.tsx` |
| `live-player/basic` | 39 | `packages/ui/src/live-player/live-player.tsx` | `packages/ui/src/live-player/live-player.test.tsx` |
| `file-tree/basic` | 36 | `packages/ui/src/file-tree/file-tree.tsx` | `packages/ui/src/file-tree/file-tree.test.tsx` |
| `agent-plan/basic` | 33 | `packages/ui/src/agent-plan/agent-plan.tsx` | `packages/ui/src/agent-plan/agent-plan.test.tsx` |
| `dossier/basic` | 33 | `packages/ui/src/dossier/dossier.tsx` | `packages/ui/src/dossier/dossier.test.tsx` |
| `snippet/basic` | 30 | `packages/ui/src/snippet/snippet.tsx` | `packages/ui/src/snippet/snippet.test.tsx` |
| `color-field/basic` | 22 | `packages/ui/src/color-field/color-field.tsx` | `packages/ui/src/color-field/color-field.test.tsx` |
| `live-product-card/basic` | 19 | `packages/ui/src/live-product-card/live-product-card.tsx` | `packages/ui/src/live-product-card/live-product-card.test.tsx` |

- [ ] 对每个组件先用 React Profiler 写“相同 props + 父 rerender 不重复执行昂贵路径”的失败测试。
- [ ] 纯展示根组件用 `memo`；二维码编码、日程布局、tree flatten、markdown/code parsing 等计算用依赖精确的 `useMemo`。不得用 JSON stringify 或无界深比较。
- [ ] 每个场景 workspace 与 packed 各跑 5 次；avoidable-render 必须为 0，现有交互测试全部通过。

---

## Task 5：清除表单与选择控件的其余可避免重渲染

**Owned scenarios (all exact source/test files follow `packages/ui/src/<id>/<id>.{tsx,test.tsx}`):**

`button/basic`(7)、`calendar/basic`(5)、`country-select/basic`(5)、`date-picker/basic`(5)、`rating/basic`(5)、`search-form/basic`(5)、`slider/basic`(5)、`time-picker/basic`(5)、`cascader/basic`(4)、`checkbox/basic`(4)、`date-time-picker/basic`(4)、`number-field/basic`(4)、`switch/basic`(4)、`tree-select/basic`(4)、`secret-field/basic`(3)、`stepper/basic`(3)。

- [ ] 先由 diagnosis 确认 props/state/context/hooks 全稳定；只对公开根组件加安全的 `memo` 边界。
- [ ] 需要 render prop/children 的控件先稳定内部 context value 与 handler，不使用会掩盖真实 children 变化的 comparator。
- [ ] 每个 owned scenario 重测到 avoidable-render=0；Task 2 同时负责 CountrySelect 的 cascade。

---

## Task 6：清除数据展示组件的其余可避免重渲染

**Owned scenarios (source/test 规则同 Task 5):**

`code-review-thread/basic`(5)、`color-swatch-picker/basic`(5)、`glimpse/basic`(5)、`heatmap/basic`(5)、`pricing-table/basic`(5)、`alert/basic`(4)、`avatar/basic`(4)、`chat-message/basic`(4)、`code-diff/basic`(4)、`contribution-graph/basic`(4)、`credit-card/basic`(4)、`icon-picker/basic`(4)、`intercept-card/basic`(4)、`json-viewer/basic`(4)、`statistic/basic`(4)、`steps/basic`(4)、`award-badge/basic`(3)、`deploy-status/basic`(3)、`gantt/basic`(3)、`git-commit/basic`(3)、`kbd/basic`(3)、`markdown/basic`(3)、`scope-matrix/basic`(3)、`diff-stat/basic`(2)、`event-stream/basic`(2)、`meter/basic`(2)、`separator/basic`(2)、`spinner/basic`(2)、`status-dot/basic`(2)、`tag/basic`(2)。

- [ ] 为每个组件增加稳定父更新 Profiler 断言。
- [ ] 优先 memo 纯展示组件；热图、甘特、Markdown、JSON viewer 等先 memo 派生模型，再决定组件边界。
- [ ] 全部 owned scenario 重测到 avoidable-render=0。

---

## Task 7：处理修正语义后仍存在的级联更新

**Owned initial scenarios:**

- Selection/form：`tree-select/basic` 110、`form/validation` 77、`search-form/basic` 61、`date-time-picker/basic` 56、`date-range-picker/basic` 47、`region-cascader/basic` 47、`form-dialog/basic` 44、`time-picker/basic` 43、`cascader/basic` 40、`pro-form/basic` 37、`editable-table/basic` 35、`login-form/basic` 33、`steps-form/basic` 32。
- Navigation/overlay：`video/basic` 86、`admin-layout/basic` 64、`navigation-menu/basic` 57、`route-tabs/basic` 56、`menubar/basic` 51、`command/basic` 49、`list/basic` 48、`password-generator/basic` 46、`dock/basic` 45、`popover/basic` 45、`layout/basic` 43、`page-header/basic` 42、`popconfirm/basic` 42、`accordion/basic` 41、`drawer/basic` 40、`sortable/basic` 40、`menu/basic` 39、`code-review-thread/basic` 36、`glimpse/basic` 36、`hover-card/basic` 36、`queue-lane/basic` 35、`button-group/basic` 32、`color-swatch-picker/basic` 32、`contribution-graph/basic` 31。

Task 1 先移除 mount 假阳性；Task 2 负责 Select/CountrySelect/Combobox。对修正后仍 >30 的每个场景：

- [ ] 从 diagnosis 找到最大 fanout 的非 mount step 与 owner chain，并在对应 `<id>.test.tsx` 写一次交互只更新必要分支的失败断言。
- [ ] 稳定 Provider value、拆分读写 context、把大型静态列表行 memo 化；overlay 首次打开允许 mountFanout 大，但二次打开/键盘移动不得让整棵静态子树更新。
- [ ] 只有在更新是语义必需且 commit median < 8ms、p95 interaction < 100ms 时，才可写组件级预算说明；不得改全局 30 阈值。

---

## Task 8：全量复扫、刷新基线与 React 18/19 验证

- [ ] Run: `pnpm llms-registry && pnpm conventions`
- [ ] Run: `pnpm --filter @hulianui/hulian-scan test && pnpm --filter @hulianui/perf-lab test`
- [ ] Run: `pnpm typecheck && pnpm test && pnpm test:scripts && pnpm size`
- [ ] Run: `PERFORMANCE_CONSUMER_DIR="$(mktemp -d)" bash scripts/performance-consumer.sh --full --output .hulian-scan/packed-final`
- [ ] Required: 372/372、0 errors、0 missing commits、0 deterministic hard findings on trusted metrics。
- [ ] Run: `node scripts/hulian-scan.mjs --update --from .hulian-scan/packed-final/summary.json`
- [ ] Run: `PERFORMANCE_CONSUMER_DIR="$(mktemp -d)" bash scripts/performance-consumer.sh --react 18 --smoke --output .hulian-scan/react18-final`
- [ ] 更新 `docs/performance/hulian-scan-initial-report.md` 的 after 附录，保留初扫 before，不覆盖历史数据。

## 完成条件

Hulian Scan v1 只有在以下条件同时满足时才完成：真实硬件 GPU/软件 GPU 边界可审计；公开 inventory 仍为 100%；所有初始硬 findings 都有上面的归属；可信指标全量 packed 复扫没有确定性硬违规；React 18 smoke、React 19 full、仓库 typecheck/test/scripts/size 全通过。CI 或本机环境不可用必须明确标成未验证，不能用 baseline 接纳失败。
