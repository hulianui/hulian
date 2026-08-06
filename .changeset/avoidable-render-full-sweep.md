---
"@hulianui/ui": patch
---

修 #89：45 个组件补上 `memo`，avoidable-render 的盲区一次清干净

`avoidable-render` 是运行时性能门禁里唯一的绝对阈值规则（>0 即 error），但 CI 只扫「本次改动波及的场景」，定时那一支只跑 4 个 React 18 兼容场景 —— 所以**一个组件只要没人碰过，它的违规就永远不会被发现**，等某天顺手改到它（哪怕只是换 showcase 里一张图）CI 才突然红，看起来像是本次改动引入的。

首次全量扫描（373 runs）一次揪出 **45 个组件**，全部按 `Button` / `Checkbox` / `Chip` 的既有处方修复（`XxxImpl` + `memo(XxxImpl)`，两处 `displayName`），并各配一条 Profiler 回归测试 —— 去掉 `memo` 必须当场红。

涉及组件：AgentPlan、Alert、Annotation、Avatar、AwardBadge、Breadcrumb、ChatMessage、Citation、CodeBlock（连带 HighlightedCode）、ColorField、CreditCard、DeployStatus、Descriptions、DiffStat、Dossier、Dot、EventStream、FileTree、Funnel、GitCommit、Heatmap、IconPicker、InputOTP、JsonViewer、Kbd、Link、LivePlayer、LiveProductCard、Meter、NumberField、Rating、ScoreRing、SecretField、Skeleton、Slider、SocialButton、Snippet、Stat、Statistic、StatusDot、Steps、Switch、Tag、TimeField、Timeline。

对外 API 零变化：导出名、类型、compound 子件（`Statistic.Countdown`）与所有具名纯函数导出全部原样。`Funnel` 是泛型组件，用 `memo(FunnelImpl) as unknown as typeof FunnelImpl` 保住泛型签名。

三条实施中确认的事实，写在这里免得下次重新踩：

- **CodeBlock 修了两层**。根 `memo` 只挡父级更新；复制按钮的 `copied` state 走自身路径挡不住，每点一次就把整段代码重新分词并重建全部 `<span>`。所以 `HighlightedCode` 也 memo。
- **FileTree 是 memo 根而不是 memo 行**。行组件收的 `toggle` 是每轮新建的箭头函数、`expandedSet` 在受控/搜索态是每轮新建的 Set，浅比较必然失败 —— memo 行是纯亏；memo 根反而把整棵子树一起跳过。
- **finding 里的计数不可跨组件比较**。门禁只统计 `event.name === 组件名` 的 fiber，子组件永远不进这条计数；而只有 `controls: []` 的组件其 stress 步骤 id 才叫 `stress:stable-parent-update`，会被一并收进来。所以「42」和「2」不代表严重程度差十倍，只代表该组件有没有可控 prop。

复验时又清掉 5 条（本批新组件 IssueReporter / InspectorPanel / ComponentPicker，以及首轮未命中的 Empty / Legend）。

**又两轮全量复跑各逮到一批漏网的**：第一轮 `Brand` / `ScopeMatrix` / `Stepper`，第二轮 `Heading` / `Text` / `GridPattern` —— 六个都压根没上过 `memo`，按同一处方补齐并各配护栏。`Heading` / `Text` 是泛型多态件，沿用 `Funnel` 的 `as unknown as typeof XxxImpl` 断言保住 `as` 多态下的推导。

它们没在首轮 45 条里出现，是因为**这条规则本身有抖动**。三条实测结论，都写在这里免得下次重新怀疑自己：

- 同一份代码连跑四次拿到 **3 / 1 / 0 / 1** 条 finding。它统计的是 React 给出的「本次提交里 props/state/hooks 全无变化」的渲染，而这个判定会随调度与负载漂移。
- 两次全量扫描给出的是**两组几乎不重叠**的组件（第一次 Brand/Kbd/ScopeMatrix/Stepper，第二次 Dossier/GridPattern/Heading/Kbd/Text）—— 每轮只是从池子里随机抽中几个。
- **对已正确 memo 的组件也会误报**：`Kbd` 与 `Dossier` 都有 `memo`（且护栏测试与负向扫荡都证明它生效），仍被判出 2–3 条。

配套的事实是：全库 380 个组件里 **306 个本来就没有 `memo`**（只有叶子型、props 全稳定原语的那类才配）。所以「一次全量扫描 0 findings」既不可达也不该当作发版判据；有意义的判据是**逐条看被点名的组件有没有 memo** —— 没有就补（本轮补了 6 个），有就是误报。

CI 里这条只在定时触发跑全量（PR/push 只扫改动波及场景），所以它不阻断发版；但定时那一支会间歇性变红，需要单独决定是调规则还是调阈值。

其中 **IssueReporter 与 InspectorPanel 的根因不在组件上**：它们 showcase 的第一个示例往组件传了内联箭头函数（`onSubmit={(draft) => …}` / `onChange={(path, value) => …}`），每轮渲染都是新引用，`memo` 从原理上就 bail 不掉。把回调提到模块级 / 包 `useCallback` 后归零。**任何组件的 showcase 首例只要传内联箭头，这条规则就会报**——它量的是 fixture 的写法，不是组件的质量。

同时把盲区本身堵上：CI 的定时触发新增一条 `Weekly structural sweep`，跑全量 inventory 而不只是 4 个兼容场景。

护栏测试统一走 `packages/ui/test/memo-guard.tsx` 的 `expectMemoSkipsSubtree`，判据分两层（#106）：

1. **结构断言**（不依赖时间）：被测元素的类型必须真是 `memo` 包出来的 —— `memo` 被误删时确定性变红；
2. **行为断言**：分母不再用 React 的 `baseDuration`（那是 memo bail 之后就不再更新的**冷**挂载估算，比值会随「这条测试在文件里排第几」漂移），改成同一条测试现场测出来的「被迫重渲一次要多久」——给被测元素补一个每轮都变的 `data-memo-probe`，浅比较必然失配。于是 memo 生效时比值实测 0.01–0.19、memo 失效时 ≈1.0，两簇之间隔着约 5 倍，阈值 0.5 上下各留 2 倍以上，不必再为每个组件各自拍系数。

全库 64 个护栏文件（含原先 6 处各写各的内联判据）现已统一到这一套。全局负向扫荡（把 `React.memo` 换成恒等函数）**64/64 文件、77/77 条断言变红，零假绿**，且失败的全是护栏用例、无误伤。
