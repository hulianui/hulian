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

复验时又清掉 5 条（本批新组件 IssueReporter / InspectorPanel / ComponentPicker，以及首轮未命中的 Empty / Legend），全量 380 个场景现在 0 条 avoidable-render。

其中 **IssueReporter 与 InspectorPanel 的根因不在组件上**：它们 showcase 的第一个示例往组件传了内联箭头函数（`onSubmit={(draft) => …}` / `onChange={(path, value) => …}`），每轮渲染都是新引用，`memo` 从原理上就 bail 不掉。把回调提到模块级 / 包 `useCallback` 后归零。**任何组件的 showcase 首例只要传内联箭头，这条规则就会报**——它量的是 fixture 的写法，不是组件的质量。

同时把盲区本身堵上：CI 的定时触发新增一条 `Weekly structural sweep`，跑全量 inventory 而不只是 4 个兼容场景。

护栏测试统一走 `packages/ui/test/memo-guard.tsx` 的 `expectMemoSkipsSubtree`：判据取 N 轮更新里 `actualDuration` 的最小值（`memo` 真失效时每轮都是完整渲染，最小值同样贴近 `baseDuration`，所以只压假红不放假绿）。改之前并跑 47 个护栏文件约 1/4 的运行会挂 1 条，改之后连跑 10 轮零失败；全局负向扫荡（剥掉全库 `memo`）48/48 变红、零假绿。
