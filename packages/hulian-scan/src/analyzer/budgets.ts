import type {
  FiberRenderEvent,
  Finding,
  PerformanceBudget,
  ScenarioRun,
} from "../contracts";
import { compareValues } from "../diagnosis/compare";
import { isTimeRegression, summarize } from "./statistics";

export interface BudgetEvaluationInput {
  run: ScenarioRun;
  component: string;
  budget: Partial<PerformanceBudget>;
  baseline?: Record<string, number>;
  minSamples?: number;
}

function makeFinding(
  input: BudgetEvaluationInput,
  rule: string,
  severity: Finding["severity"],
  current: number,
  evidence: string[],
  baseline?: number,
): Finding {
  const absoluteDelta = baseline === undefined ? undefined : current - baseline;
  const relativeDeltaPct =
    baseline === undefined
      ? undefined
      : baseline === 0
        ? current === 0
          ? 0
          : Number.POSITIVE_INFINITY
        : ((current - baseline) / baseline) * 100;
  return {
    id: `${input.run.scenarioId}:${rule}:${input.component}`,
    scenarioId: input.run.scenarioId,
    component: input.component,
    rule,
    severity,
    current,
    ...(baseline === undefined ? {} : { baseline }),
    ...(absoluteDelta === undefined ? {} : { absoluteDelta }),
    ...(relativeDeltaPct === undefined ? {} : { relativeDeltaPct }),
    evidence,
  };
}

function readChangeDescription(event: FiberRenderEvent): {
  isFirstMount: boolean;
  props: unknown[];
  state: unknown;
  context: unknown;
  hooks: unknown[];
  parent: boolean;
} | undefined {
  const description = event.changeDescription;
  if (typeof description !== "object" || description === null) return undefined;
  const get = (key: string): unknown => {
    const descriptor = Object.getOwnPropertyDescriptor(description, key);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
  };
  const props = get("props");
  const hooks = get("hooks");
  return {
    isFirstMount: get("isFirstMount") === true,
    props: Array.isArray(props) ? props : [],
    state: get("state"),
    context: get("context"),
    hooks: Array.isArray(hooks) ? hooks : [],
    parent: get("parent") === true,
  };
}

/**
 * 「这个输入没变」的判据 —— **只认引用相等，不认深比较相等**。
 *
 * 口径必须与 React 的 bailout 机制一致：`React.memo` 与 fiber 的提前退出走的都是
 * `Object.is`。若把 `equal-by-value`（值相同但引用不同）也算作「没变」，报出来的
 * 渲染 React 根本避免不了 —— 加 memo 也消不掉，finding 不可执行。这不是推论：
 * 2026-08-03 给 34 个组件全加了 memo，实测一条没降，全部回滚
 * （docs/perf-cascade-fanout-diagnosis-20260803.md）。
 *
 * 收紧后漏掉的是「调用方传了新引用但值相同」这类浪费 —— 那类的修复对象是调用方，
 * 记在组件头上本来就错位；而 perf-lab 的 GenericFixture 每次父级渲染都重新调用
 * `initialRender()` 产出新 element 树，等于规则一直在测 fixture 的写法。
 *
 * 防线没丢：`fixtures/known-bad.tsx` 用模块级常量 `stableConfig` 传给无 memo 的
 * 子组件，同一引用，收紧后照样被抓 —— 那才是该报的那类（引用没变却重算）。
 */
function isStableReferenceChange(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const previous = Object.getOwnPropertyDescriptor(value, "previous");
  const next = Object.getOwnPropertyDescriptor(value, "next");
  if (
    !previous ||
    !("value" in previous) ||
    !next ||
    !("value" in next)
  ) {
    return false;
  }
  const comparison = compareValues(previous.value, next.value, {
    maxDepth: 6,
    maxEntries: 200,
  });
  return comparison.kind === "same-reference";
}

function changeListIsStable(changes: unknown[]): boolean {
  return changes.every(isStableReferenceChange);
}

function changeFieldIsStable(change: unknown): boolean {
  return change === false || change == null || isStableReferenceChange(change);
}

function isAvoidable(event: FiberRenderEvent): boolean {
  const change = readChangeDescription(event);
  return Boolean(
    change &&
      !change.isFirstMount &&
      change.parent &&
      changeListIsStable(change.props) &&
      changeFieldIsStable(change.state) &&
      changeFieldIsStable(change.context) &&
      changeListIsStable(change.hooks),
  );
}

function metricValues(run: ScenarioRun, metric: string): number[] {
  return run.samples.flatMap((sample) =>
    Object.hasOwn(sample, metric) ? [sample[metric] as number] : [],
  );
}

const GPU_TIMING_METRICS = new Set([
  "longTaskCount",
  "longestTaskMs",
  "longTaskMs",
  "droppedFrameRatio",
  "longestFrameMs",
]);

// 机器绑定的读数：换一台机器就不可比，因此在声明「机器与基线不可比」时整批跳过。
//
// fanout 仍在名单里，但**理由已经变了**，这是分两步走的第一步。
//
// 原来的理由：fanout 按**单个 commit** 计数 fiber，而 concurrent React 会把一次逻辑更新
// 切成多个 commit，切与不切取决于机器快慢 —— 同一份代码 form/validation 的 cascadeFanout
// 中位数开发机 31~35、CI runner 82，阈值 50 卡在中间，本地绿 CI 红。
//
// 现在：fanout 已改成「一个 step 内所有更新 commit 的 fiber 总数」（见 perf-lab 的
// computeMetrics），**切片这一项已经消除** —— 同一个 step 切几刀，总数不变。
// 但「跨机器可比」目前只是推论，没有实测背书：新定义在 CI runner 上是多少，谁都还没测过。
// 而 fanout 的抖动并非只来自切片，「异步工作有没有落在 step 窗口内」同样受调度影响
// （373 个场景实测，同一次运行的 5 个样本之间 (max-min)/median 中位数 0.55），
// 跨机器的调度差异只会更大，不会更小。所以先**暂缓**，不拿推论当结论。
//
// 解除条件有两个，缺一不可：
// 1. **跨机器实测对照**。这轮改动合并 push 后，CI 会用新定义产出并记录读数（跳过判定不
//    影响记录）。拿 CI 侧真实读数与本机对照，确认量纲一致。
// 2. **step 契约里要有显式 repeats**。`stress` step 硬编码跑 10 轮
//    （perf-lab/scenarios/generic.tsx）、`sample-frames` 跑 N 帧，而这个乘数指标层看不见。
//    在它显式化之前，按 step 求和量的是「组件成本 × 循环次数」，据此定的阈值是在量 harness
//    的循环，不是在量组件 —— 新定义下最重的场景恰恰是动画类（旧定义只有 12），就是这个原因。
// 两条都满足后，把这两项移出本名单即可恢复门禁，那时阈值判定与基线回归一起放开、
// 两条对应测试同时反转。完整判据与建议的替代指标见
// docs/perf-cascade-fanout-diagnosis-20260803.md §6.2。
const MACHINE_BOUND_METRICS = new Set([
  ...GPU_TIMING_METRICS,
  "commitDurationMs",
  "interactionLatencyMs",
  "cascadeFanout",
  "mountFanout",
]);

function isUntrustedGpuMetric(run: ScenarioRun, metric: string): boolean {
  return (
    run.metadata.webgl === true &&
    run.metadata.gpuMetricsTrusted === false &&
    GPU_TIMING_METRICS.has(metric)
  );
}

/** 两种「读数不可信」来源：软件 GPU（既有），以及机器与基线不可比（CI runner）。 */
function isUntrustedTimingMetric(input: BudgetEvaluationInput, metric: string): boolean {
  if (isUntrustedGpuMetric(input.run, metric)) return true;
  return input.budget.trustTimingMetrics === false && MACHINE_BOUND_METRICS.has(metric);
}

// 结构性计数（一个 step 波及多少 fiber）取中位数，时间指标才取 p95。
// 每轮只采 5 个样本，p95 实际等于最大值，对任何有抖动的指标都必然抓尾部；而 fanout 的
// 抖动来自「异步工作有没有落在 step 窗口内」这类调度因素，尾部值反映的是调度而不是组件。
// 真有级联问题的组件是持续表现的，中位数照样抓得住；时间指标关心的正是最坏延迟，仍用 p95。
const COUNT_METRIC_STATISTIC = new Set(["cascadeFanout", "mountFanout"]);

function addThresholdFinding(
  findings: Finding[],
  input: BudgetEvaluationInput,
  metric: string,
  rule: string,
  maximum: number | undefined,
): void {
  if (maximum === undefined) return;
  if (isUntrustedTimingMetric(input, metric)) return;
  const values = metricValues(input.run, metric);
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) return;
  const distribution = summarize(values);
  const useMedian = COUNT_METRIC_STATISTIC.has(metric);
  const current = useMedian ? distribution.median : distribution.p95;
  if (current > maximum) {
    findings.push(
      makeFinding(input, rule, "error", current, [
        // 统计量必须写实：读的人要能据此判断「这是持续超标还是尾部抖动」。
        `${metric} ${useMedian ? "median" : "p95"} ${current} exceeds ${maximum}`,
      ]),
    );
  }
}

export function evaluateBudget(input: BudgetEvaluationInput): Finding[] {
  const findings: Finding[] = [];
  if (input.run.errors.length > 0) {
    findings.push(
      makeFinding(
        input,
        "scenario-error",
        "error",
        input.run.errors.length,
        [...input.run.errors],
      ),
    );
  }
  if (!input.run.events.some((event) => event.type === "commit")) {
    findings.push(
      makeFinding(input, "missing-commit", "error", 0, [
        "no React commit captured",
      ]),
    );
  }
  const minSamples = input.minSamples ?? input.budget.minSamples ?? 5;
  if (input.run.samples.length < minSamples) {
    findings.push(
      makeFinding(
        input,
        "insufficient-samples",
        "error",
        input.run.samples.length,
        [`expected at least ${minSamples} samples`],
      ),
    );
  }
  const invalidSamples = input.run.samples.flatMap(Object.values).filter(
    (value) => !Number.isFinite(value),
  );
  if (invalidSamples.length > 0) {
    findings.push(
      makeFinding(input, "invalid-sample", "error", invalidSamples.length, [
        "all sample metrics must be finite",
      ]),
    );
  }
  if (findings.length > 0) return findings;

  const componentRenders = input.run.events.filter(
    (event): event is FiberRenderEvent =>
      event.type === "fiber-render" &&
      event.name === input.component &&
      /parent|stable/i.test(event.stepId ?? ""),
  );
  if (input.run.stage === "measurement" && componentRenders.length > 0) {
    const selfTime = summarize(
      componentRenders.map((event) => event.selfDurationMs),
    ).median;
    const minCost = input.budget.minAvoidableRenderMs ?? 0.5;
    const minRepeats = input.budget.minRepeatedAvoidableRenders ?? 2;
    if (selfTime >= minCost || componentRenders.length >= minRepeats) {
      findings.push(
        makeFinding(
          input,
          "avoidable-render-candidate",
          "warning",
          componentRenders.length,
          [
            `${componentRenders.length} parent-update renders; median self ${selfTime.toFixed(3)} ms`,
          ],
        ),
      );
    }
  }
  // 这条是**发现信号，不是门禁**（2026-08-06 降级，evidence 如下）。
  //
  // 它判的是「父级重渲染了，而 React 报告本次提交里 props/state/hooks/context 全无变化」——
  // 对**没有 memo 的组件这恒为真**，那是定义而不是缺陷；全库 380 个组件里 306 个本来就没有
  // memo（只有叶子型 + props 全稳定原语的那类才配）。所以阈值 0 在语义上就不可能被满足。
  //
  // 而它之所以看起来「偶尔才报」，是因为**检测本身被挂载期的异步工作污染**：
  // LazyMotionProvider 这类 `import()` 到货后会触发一次 context 更新，它绕过 memo，
  // 而 stable-parent-update 步骤紧跟 mount、只等一个 nextPaint()，那次渲染落在测量窗口内外
  // 全凭运气。三条实测：
  //   ① 同一份代码连跑四次同一场景 → 3 / 1 / 0 / 1 条；
  //   ② 两轮 380 runs 的全量给出几乎不重叠的两组组件；
  //   ③ 对**已正确 memo** 的组件也报（Kbd / Dossier 都有 memo，护栏测试与负向扫荡都证明生效）。
  //
  // 把窗口修干净（挂载副作用落定后再测）能消掉抖动，但那样会确定性地点名那 306 个组件 ——
  // 更红、更没用。真正该被门禁拦的是「**有** memo 却仍然重渲染」，那是 memo 被不稳定 props
  // 打败；这一条已由 packages/ui/test/memo-guard.tsx 的 64 个护栏确定性覆盖
  // （负向扫荡：把 React.memo 换成恒等函数，64/64 文件、77/77 条断言变红）。
  //
  // 所以这里保留为 warning：weekly sweep 仍会把候选列出来（#89 与本轮共靠它找出 51 个真缺口），
  // 但不再让 CI 因为一次抖动而红。要恢复成门禁，先让 harness 能分辨组件是否被 memo 包着。
  if (input.run.stage === "diagnosis") {
    const avoidable = componentRenders.filter(isAvoidable);
    const maximum = input.budget.maxAvoidableRenderCount ?? 0;
    if (avoidable.length > maximum) {
      findings.push(
        makeFinding(input, "avoidable-render", "warning", avoidable.length, [
          ...new Set(
            avoidable.map(
              (event) =>
                `${event.ownerName ?? "unknown owner"} -> ${event.name} in ${event.stepId ?? "unknown step"}`,
            ),
          ),
        ]),
      );
    }
  }

  addThresholdFinding(findings, input, "renderLoopCount", "render-loop", 0);
  addThresholdFinding(findings, input, "leakCount", "leak", 0);
  addThresholdFinding(
    findings,
    input,
    "cascadeFanout",
    "cascade-fanout",
    input.budget.maxCascadeFanout,
  );
  addThresholdFinding(
    findings,
    input,
    "interactionLatencyMs",
    "interaction-latency",
    input.budget.maxInteractionLatencyMs,
  );
  addThresholdFinding(
    findings,
    input,
    "longTaskMs",
    "long-task",
    input.budget.maxLongTaskMs,
  );
  addThresholdFinding(
    findings,
    input,
    "droppedFrameRatio",
    "dropped-frames",
    input.budget.maxDroppedFrameRatio,
  );

  const relativePct = input.budget.relativeRegressionPct ?? 20;
  const absoluteMs = input.budget.absoluteRegressionMs ?? 2;
  // 基线只从 packed-consumer 采集，拿它去判 workspace 运行本就是跨环境比时间。
  const sameEnvironmentAsBaseline = input.run.environment === "packed-consumer";
  for (const [metric, baseline] of Object.entries(
    sameEnvironmentAsBaseline ? (input.baseline ?? {}) : {},
  )) {
    if (isUntrustedTimingMetric(input, metric)) continue;
    const values = metricValues(input.run, metric);
    if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
      continue;
    }
    const current = summarize(values).median;
    if (isTimeRegression({ baseline, current, relativePct, absoluteMs })) {
      findings.push(
        makeFinding(input, `regression:${metric}`, "error", current, [
          `${metric} regressed beyond ${relativePct}% and ${absoluteMs} ms`,
        ], baseline),
      );
    }
  }
  return findings;
}
