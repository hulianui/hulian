# Hulian Scan 内部性能实验室设计

- 日期：2026-08-01
- 状态：设计已与用户确认，实施计划已完成
- 适用仓库：`hulian`
- 目标包：`@hulianui/ui`
- 工具性质：仅供 HulianUI 仓库内部开发与 CI 使用，不发布、不进入消费方产物

## 1. 目标

`hulian-scan` 用真实浏览器证据发现、解释并阻止 HulianUI 组件的慢渲染。它服务的最终结果不是一个对外工具，而是更快的 `@hulianui/ui`：更少无效重渲染、更小的级联范围、更低的交互延迟，以及可持续执行的性能回归门禁。

第一版必须同时完成两件事：

1. 建立可重复的扫描、归因、报告、基线和 CI 闭环。
2. 使用该工具完成第一轮全库扫描，修复发现的高影响问题，并用相同场景给出修复前后证据。

首轮扫描是全量普查，不是抽样审计。扫描可以按批次执行和恢复，但不得因为组件数量、分析成本或 token 消耗而只保留 Top N。

## 2. 明确边界

### 2.1 要做

- 枚举 `@hulianui/ui` 的全部公开组件入口，并为每个入口建立至少一个可运行场景。
- 在真实 Chromium 中记录 React commit、组件渲染、级联范围、交互延迟和长任务。
- 对超出预算的场景执行第二次归因运行，解释 props、state、context、hooks 与 owner 级联。
- 对核心、重型和持续动画组件建立专用场景与分级预算。
- 将 `@hulianui/ui` 打成 tarball，在仓库外安装后复跑，证明发布形态下仍成立。
- 把确定性性能问题和稳定的回归预算接入 CI。
- 保存机器可读 JSON、终端摘要与 CI artifact。

### 2.2 不做

- 不发布 `@hulianui/scan` 或任何面向消费方的扫描 API。
- 不把扫描器加入 `@hulianui/ui` 的 exports、dependencies 或运行时代码。
- 不在扫描器里自动批量写入 `memo`、`useMemo` 或 `useCallback`。
- 不用单一、不可解释的综合分数代替原始指标。
- 不把文档站本身变快等同于发布组件变快。
- 不把 development React 的耗时当作最终性能数字。
- 不承诺一次扫描能证明所有真实业务组合都已达到最优。

## 3. 上游选择与取舍

### 3.1 React Scan

参考仓库：<https://github.com/aidenybai/react-scan>

设计时核验快照：

- commit：`759b6dabbe179c8901e415d7df8b9393812b34ca`
- `react-scan`：`0.5.7`
- 许可证：MIT

采用 `react-scan/lite` 的无界面采集思路和事件模型。它已经提供 Fiber tree、`actualDuration`、source、稳定 Fiber identity、lane、commit 和 change description 等能力，比 fork 完整 overlay 更适合内部自动化。

所有上游调用必须位于 adapter 内。业务分析器不得直接依赖 React Scan 或 Bippy 的具体字段，以便上游 API 或 React Fiber 结构变化时只修改一个边界。

### 3.2 Why Did You Render

参考仓库：<https://github.com/welldone-software/why-did-you-render>

设计时核验快照：

- commit：`3ec3512d750c49448fe2241e26d05db9e42f0c21`
- `@welldone-software/why-did-you-render`：`10.0.1`
- 许可证：MIT

采用它的归因思想：区分同引用、不同值、引用不同但深值相同、函数/React Element/集合等特殊值，并向 owner 追溯级联原因。

不把 WDYR 作为计时阶段运行时。它会 monkey patch React，官方明确要求仅用于开发环境，且最新版只面向 React 19、未验证 React Compiler。直接同时运行会增加开销并污染预算。

若实现中移植了上游实质性代码，必须保留版权声明并新增第三方 notices；优先根据行为契约重新实现小而可测的比较器，避免复制完整运行时。

## 4. 总体架构

```text
packages/hulian-scan/
  src/
    adapter/          React Scan / Bippy / React Fiber 兼容边界
    collector/        commit、render、interaction、long-task 采集
    analyzer/         聚合、归因、预算与回归判定
    diagnosis/        props/state/context/hooks/owner 深度诊断
    report/           schema、JSON、终端摘要与 artifact
  package.json        private: true

apps/perf-lab/
  app/                浏览器运行壳
  scenarios/          全部组件的场景与分类
  fixtures/           已知通过与已知失败样例

scripts/
  hulian-scan.mjs
  performance-consumer.sh
  performance-budgets.json
  performance-baseline.json
```

`packages/hulian-scan` 只能被仓库工具和 `apps/perf-lab` 使用。根脚本和 CI 需要增加防误发布断言：

- `private` 必须为 `true`。
- `@hulianui/ui` 的 manifest 与 lockfile 关系中不得出现运行时依赖。
- packed consumer 的 bundle 中不得包含 `hulian-scan`、`react-scan`、`bippy` 或 WDYR。

## 5. 双阶段扫描

### 5.1 阶段 A：干净测量

目标是得到尽可能少受诊断器影响的回归指标。

- 浏览器启动后、React 执行前注入采集器。
- 不挂载 overlay 或工具栏。
- 不做深值比较。
- 不保存完整 props 值。
- 只记录预算需要的 Fiber 摘要和浏览器性能事件。
- 计时使用 React production profiling build，不使用 development React 的耗时。

### 5.2 阶段 B：问题归因

只对阶段 A 超出预算或触发确定性违规的场景重跑。

- 使用 development React 获取组件名、owner 和源码位置。
- 对 Fiber 与 `alternate` 的 memoized props/state/context/hooks 做差异分析。
- 深比较仅针对已标记的组件与变化字段，不遍历整棵树的任意值。
- 记录循环引用、getter、DOM 节点、React Element、Set/Map、函数等安全边界。
- 归因阶段的耗时不得写回性能基线。

双阶段设计避免观察者效应：重型归因可以更详细，但不能让它自己的开销决定组件是否超标。

## 6. 全量组件清单

组件清单不能靠手写数组长期维护。扫描器从运行时事实生成：

1. 解析 `packages/ui/package.json` 的公开 exports。
2. 解析 `packages/ui/src/index.ts` 和公开子路径 `src/*/index.ts`。
3. 与现有 registry / component docs 元数据交叉检查。
4. 输出稳定的 component inventory，并检测新增、删除和改名。

当前 checkout 约有 377 个 `packages/ui/src` 一级目录、1,138 个 TSX 文件和 403 个测试文件；这些数字只作为规模快照，不作为硬编码完成条件。最终完成度由公开入口清单决定。

每个公开组件必须落入以下结果之一：

- 已有可运行性能场景。
- 由通用场景生成器覆盖。
- 明确标记为非渲染入口，并提供可验证理由。

禁止静默跳过组件。无法挂载或缺少必要 props 的组件必须出现在缺口报告中，并在首轮普查结束前补齐。

## 7. 场景模型

场景使用显式 TypeScript 契约定义：

```ts
definePerformanceScenario({
  id,
  component,
  category,
  render,
  steps,
  budgets,
});
```

每个普通组件的基础场景依次执行：

1. 预热，不计入结果。
2. 初次挂载。
3. 父组件更新、组件 props 保持稳定。
4. 合法 props 更新。
5. 主要用户交互。
6. 数据密集或连续操作压力测试。
7. 重复采样并等待页面稳定。

场景分三类：

### 7.1 核心与重型组件

Table、ProTable、Tree、Select、Dialog、表单、虚拟列表、图表、编辑器等必须编写专用数据规模和交互路径，不能只使用通用挂载测试。

### 7.2 常规组件

先由通用生成器覆盖挂载、稳定 props 和合法更新，再为具有交互行为的组件补充点击、输入、展开、切换或键盘场景。

### 7.3 Canvas、WebGL 与持续动画组件

单独记录帧耗时、长任务、启动/停止和卸载清理。普通组件的 render count 预算不能直接套用，以免把合法的逐帧绘制误判为 React 重渲染问题。

## 8. 指标

报告保留以下原始指标：

- `commitDurationMs`
- `componentActualDurationMs`
- `componentSelfDurationMs`
- `renderCount`
- `avoidableRenderCount`
- `mountFanout`
- `cascadeFanout`
- `interactionLatencyMs`
- `longTaskCount`
- `longestTaskMs`
- `droppedFrameRatio`（仅适用场景）
- `longestFrameMs`（仅适用场景）

`mountFanout` 与 `cascadeFanout` 的口径：**按 step 聚合，取最差的那个 step 的 fiber 总数**
（`cascadeFanout` 只数更新，`mountFanout` 只数首次出现的 fiber 与 mount step 的渲染，
unmount step 一律不计）。

不按单个 commit 计数：concurrent React 会把一次逻辑更新切成多个 commit，切几刀取决于机器
快慢与调度时机 —— 按 commit 计数等于在量机器（同一份代码 form/validation 的 cascadeFanout
中位数开发机 31~35、CI runner 82）。一个 step 内的总数与切片方式无关，跨机器才可比。

代价必须写清楚：这是**总量**不是单次峰值。一个 step 重复 N 次交互，读数就是 N 倍
（通用生成器的 stress step 跑 10 轮，因此它的读数比手写单动作 step 高一个量级）。
阈值必须按场景的 step 设计来定，跨场景比大小没有意义。

“无效重渲染”不能只按“父组件渲染了”判断。至少同时满足以下条件才进入确定性候选：

- 不是首次挂载。
- props、state、context 与 stateful hooks 没有有效变化，或变化仅为引用不同但深值相同。
- 本次渲染确实发生在被测交互窗口内。
- 组件或级联子树的成本超过可忽略下限，或在一次交互中重复出现。

这样避免为了追求零 render count 给所有廉价组件机械添加 memoization。

## 9. 采样与稳定性

- 每个场景先预热，再进行多次有效采样。
- 报告中保存中位数、P95、样本数和离散程度。
- 固定 Chromium 版本、viewport、颜色模式、字体与动画配置。
- 普通场景禁用无关后台活动；动画场景保留其真实循环。
- 每个批次记录机器和浏览器元数据。
- 全量扫描支持 checkpoint。进程中断后从未完成批次继续，但同一场景不得拼接不同环境的样本。

GitHub Runner 的绝对耗时会波动，因此时间类门禁必须同时满足相对和绝对条件；确定性渲染问题则不依赖机器速度。

## 10. 预算与基线

预算分两类：

### 10.1 确定性硬门禁

- 无限更新或渲染循环。
- 明确的高成本无效重渲染。
- 一次交互产生异常级联。
- 组件卸载后监听器、timer、observer 或动画循环仍运行。
- 超出明确长任务上限。
- 场景报错、未完成或没有采集到 commit。

### 10.2 统计回归门禁

时间指标只有同时超过相对阈值和绝对阈值才失败。默认起点为“相对基线增长超过 20%，且绝对增加至少 2 ms”，组件专用预算可以更严格。阈值需要在首轮全量数据后校准，但不得在普通测试运行中自动改变。

基线命令：

```bash
pnpm scan
pnpm scan:ci
pnpm scan:update
```

`scan:update` 必须输出旧值、新值、变化比例和受影响组件。只有明确执行该命令才允许写回 `performance-baseline.json`。

## 11. Packed consumer 验证

本地 workspace 场景用于快速定位，但不能作为最终证明。`performance-consumer.sh` 复用仓库现有消费方验证原则：

1. pack `@hulianui/tokens` 与 `@hulianui/ui`。
2. 在仓库外创建最小 Vite + React 工程。
3. 使用 tarball 安装，不允许 workspace 链接或上溯 node_modules。
4. 复制相同场景源码并从公开子路径导入组件。
5. 使用 profiling runtime 构建并执行 Chromium 测量。
6. 验证最终 bundle 不包含内部扫描器。

packed consumer 结果是发布组件回归结论；workspace 结果是开发定位证据。两者必须在报告中分栏，不能混为同一环境。

## 12. 报告

每条 finding 至少包含：

- 组件、入口和源码位置
- 场景与具体步骤
- 当前值、基线值、绝对差和变化比例
- 涉及的 Fiber 与级联范围
- props、state、context、hooks 变化摘要
- owner 归因
- 判定规则与严重级别
- 建议验证的修复方向

报告产物：

- `summary.json`：CI 和后续工具消费。
- `findings.json`：完整问题与证据。
- `inventory.json`：公开组件覆盖率。
- 终端摘要：失败项、最大回退和最慢组件排行。
- CI artifact：原始样本、浏览器日志、失败截图和 trace。

排行榜用于排序，不用于截断首轮扫描或隐藏未进入 Top N 的问题。

## 13. 错误处理

以下情况必须判定基础设施失败，不能显示“性能通过”：

- 采集器未在 React 启动前加载。
- 没有捕获任何 commit。
- profiling hooks 或 profiling build 不可用。
- 场景抛错、超时或没有完成预期交互。
- 指标缺失、出现 `NaN` 或有效样本不足。
- component inventory 与场景覆盖表不一致。
- packed consumer 偷走 workspace 依赖或使用源码软链。

Chromium 进程崩溃可重试一次。再次失败后保存日志并使该批次失败，不把缺失数据按零处理。

## 14. 测试策略

### 14.1 单元测试

- 事件聚合与 commit 边界。
- 预算的相对/绝对双条件。
- 深比较的循环引用、getter、函数、React Element、Set/Map 和大对象上限。
- checkpoint、重试和报告合并。
- component inventory 的新增、删除、别名与非渲染入口。

### 14.2 集成测试

- 固定 LiteEvent 流生成稳定报告。
- 故意制造无效重渲染的 fixture 必须失败。
- 修复后的 fixture 必须通过。
- 采集器加载太晚、无 commit 和样本不足必须失败。

### 14.3 浏览器与消费方测试

- 真实 Chromium 执行代表性场景。
- packed tarball 环境执行相同场景。
- React 19 执行完整性能门禁。
- React 18 在每周定时任务和版本发布前执行兼容性 smoke，不维护第二套易漂移的时间基线。

## 15. CI 集成

增加独立的 `runtime-performance` job，不阻塞现有单元测试的快速反馈。首轮建立基线后，该 job 执行：

1. inventory 与覆盖率检查。
2. 核心/重型组件强门禁。
3. 受改动影响的组件及其依赖场景。
4. packed consumer 复测。
5. 上传完整报告。

完整全库普查保留为显式命令，并在基线重建、重要发布或定期任务中执行。首轮实施必须实际跑完一次全量普查，不能只证明命令理论可运行。

## 16. 优化闭环

扫描器不直接修改组件。每个真实问题按以下顺序处理：

```text
复现问题
→ 保存修复前报告
→ 定位触发源与 owner 级联
→ 修改组件或场景中的真实问题
→ 重跑原场景
→ 对比修复前后
→ 运行组件测试、typecheck 和 packed consumer
→ 收紧基线
```

允许的修复可能包括状态下沉、context 拆分、稳定外部订阅、虚拟化、惰性挂载、数据结构改造、事件路径缩短或有证据的 memoization。不得把“添加更多 memo”设为默认答案。

## 17. 第一版完成标准

第一版只有同时满足以下条件才完成：

1. 所有公开组件都出现在 inventory 中，且没有静默跳过项。
2. 所有公开组件完成基础扫描并形成首版基线。
3. 核心、重型和持续动画组件具有适合其行为的专用场景。
4. 全量扫描可分批恢复，并在本轮真实跑完。
5. 所有确定性性能违规清零。
6. 高影响慢渲染完成源码优化，并保留修复前后数据。
7. packed consumer 复测通过。
8. CI 能捕获故意加入的无效渲染和时间回退 fixture。
9. `@hulianui/ui` 发布内容与消费方 bundle 不包含内部扫描器。
10. 现有 typecheck、组件测试、浏览器测试、bundle size 和 consumer smoke 不回退。

## 18. 风险与控制

| 风险 | 控制 |
|---|---|
| React Fiber / Bippy API 漂移 | adapter 单点隔离，fixture 覆盖加载顺序和事件 schema |
| 诊断器污染性能数字 | 测量与归因两次运行，诊断耗时永不写入基线 |
| CI 机器噪声 | 多次采样、中位数/P95、相对与绝对双阈值 |
| 首轮组件规模大 | 自动 inventory、分批 checkpoint、全量不截断 |
| blanket memoization 反而变慢 | 无效渲染必须结合成本，修复后用原场景复测 |
| packed consumer 走到 workspace 捷径 | 仓库外临时工程、tarball 安装、依赖路径断言 |
| 上游许可证遗漏 | adapter 中记录来源，移植代码时保留 MIT notice |

## 19. 实施顺序

正式实现计划按以下里程碑拆分：

1. 内部包、事件 schema、adapter 与已知好/坏 fixture。
2. perf-lab、场景契约、Chromium orchestration 与报告。
3. 自动 inventory、通用场景和覆盖率门禁。
4. 核心/重型/动画组件专用场景。
5. packed consumer 与 CI。
6. 首轮全量扫描、问题排序和诊断。
7. 实际组件优化、前后验证和基线收紧。

实施计划需要逐任务列出测试先行步骤、具体文件、验证命令和提交边界。
