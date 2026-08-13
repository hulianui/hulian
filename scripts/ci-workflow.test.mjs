import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

/**
 * 把 jobs: 段切成一个个 job 块。
 *
 * 顶层 job 名是 workflow 里唯一「两空格缩进 + 冒号 + 直接换行」的形状：job 内部的
 * name / runs-on / steps 是四空格，matrix 的取值是八空格，注释以 # 开头，
 * concurrency 的 group 有值所以冒号后不换行，而且它在 jobs: 之前。
 *
 * 刻意不引 YAML 解析器：scripts/ 下这批 node:test 套件是零依赖的，为一条结构断言
 * 引一个 parser 不划算。
 */
function workflowJobs() {
  const body = workflow.slice(workflow.indexOf("\njobs:"));
  const heads = [...body.matchAll(/\n {2}([a-z][a-z0-9-]*):\n/g)];
  return heads.map((head, i) => ({
    name: head[1],
    text: body.slice(head.index, heads[i + 1]?.index ?? body.length),
  }));
}

test("CI rejects stale committed English showcase modules before build can regenerate them", () => {
  assert.equal(
    packageJson.scripts["showcase:check"],
    "node scripts/gen-showcase-sources.mjs --check",
  );

  // 刻意不写死 job 名（此前这里绑的是已经不存在的 `verify`）：CI 从单体 job 拆成并行
  // job 图之后，要守的关系其实没变 ——「**谁**跑 www build，谁就得在那之前跑只读的
  // showcase 漂移检查」。绑 job 名的话，每次重排 job 这条都会红一次，而红的是名字不是语义。
  const buildJob = workflowJobs().find((job) => job.text.includes("run: pnpm --filter www build"));
  assert.ok(buildJob, "no workflow job runs the production documentation build");

  const check = buildJob.text.indexOf("run: pnpm showcase:check");
  const build = buildJob.text.indexOf("run: pnpm --filter www build");

  assert.notEqual(check, -1, "the job that builds must also run the non-mutating showcase drift check");
  assert.ok(check < build, "showcase:check must run before build regenerates showcase modules");
});

// 观测性质、不阻塞发布的 job —— 从「deploy 必须等它」的要求里显式豁免。
// 加进这个集合是一次**主动决策**：意思是「这道 job 红了也照发」。
const NON_BLOCKING_JOBS = new Set(["runtime-performance"]);

test("deploy 必须 needs 上每一道门禁 job", () => {
  const jobs = workflowJobs();
  const deploy = jobs.find((job) => job.name === "deploy-zh");
  assert.ok(deploy, "missing deploy-zh workflow job");

  // 只认多行列表写法；改成 inline 数组会让下面的解析静默变空，所以宁可在这里报错。
  const block = deploy.text.match(/\n {4}needs:\n((?: {6}- [a-z][a-z0-9-]*\n)+)/);
  assert.ok(block, "deploy-zh 的 needs 必须写成多行列表（本断言按这个形状解析）");
  const needs = block[1].trim().split("\n").map((line) => line.replace(/^\s*-\s*/, ""));

  const gates = jobs
    .map((job) => job.name)
    .filter((name) => name !== "deploy-zh" && !NON_BLOCKING_JOBS.has(name));
  const missing = gates.filter((gate) => !needs.includes(gate));

  // 为什么值得为这条写测试：CI 从单体 job 拆开之前，`needs: [verify, …]` 里一个名字
  // 兜住了 20 多道门禁；拆开之后每道门禁都是独立 job，必须逐个点名。漏一个的后果是
  // 「门禁红了、镜像照发」——而且**不会报任何错**，是全流水线唯一一处漏改无声的地方。
  assert.deepEqual(
    missing,
    [],
    `deploy-zh 漏了这些门禁 job：${missing.join(", ")}。` +
      `若某个 job 确实不该阻塞发布，把它显式加进 NON_BLOCKING_JOBS。`,
  );
});

test("每个 PR 都要用 React 18 类型编译一次库源码", () => {
  // 同样不绑 job 名，守的是语义：**必须有一条不受 schedule 条件限制的路径**，用 React 18
  // 的 @types 编译库源码。库的类型分发是 prepack 生成的 .d.ts（用仓库里的 React 19 类型
  // 生成），所以 consumer-smoke 那两跑照不出函数体里的 React 18/19 类型分歧；此前唯一
  // 照得出的地方挂在每周定时任务上，实测让一个 TS2540 在 master 上待了几小时（0.40.0
  // 的 Upload）。谁把这条挪回 `if: github.event_name == 'schedule'`，这里就该红。
  const job = workflowJobs().find(
    (candidate) =>
      candidate.text.includes("--react 18") && candidate.text.includes("--typecheck-only"),
  );
  assert.ok(job, "没有任何 job 跑 React 18 的库源码类型门禁（pnpm scan:ci -- --react 18 --typecheck-only）");
  assert.ok(
    !/\n {4}if:[^\n]*schedule/.test(job.text),
    `${job.name} 被限制成只在定时任务跑 —— React 18 类型门禁必须落在 PR 链路上`,
  );
});
