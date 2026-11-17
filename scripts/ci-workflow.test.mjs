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
//
// scheduled-notice 不是门禁而是**报信的**：它只在定时链路上跑（push 时压根不触发），
// 让 deploy 等它没有任何意义。
//
// version-pr-guard 只在版本 PR 上跑，push 到 master 时恒为 skipped —— deploy-zh 若 needs 它，
// skipped 会沿 needs 传染，镜像站就再也不发了。它守的是「版本 PR 没夹带代码」，那件事在
// 合入前就已裁决完，与「这次 push 能不能发」无关。
const NON_BLOCKING_JOBS = new Set(["runtime-performance", "scheduled-notice", "version-pr-guard"]);

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
  // 两种把它推回定时链路的写法都要拦住：直接判 event_name，或者用 env.SWEEP
  // 这个新加的定时判据。后者是 2026-08-21 引入的，不写进来就是留了个同款后门。
  assert.ok(
    !/\n {4}if:[^\n]*(?:schedule|SWEEP)/.test(job.text),
    `${job.name} 被限制成只在定时任务跑 —— React 18 类型门禁必须落在 PR 链路上`,
  );
});

test("定时链路的失败必须有一个看得见的落点，且不漏掉任何 job", () => {
  // 2026-08-05 / 08-12 两次 React 18 冒烟连续失败没人发现，08-19 又整轮被 Playwright
  // 挂死吃掉 —— 三周零信号。定时任务不出现在任何人当天要看的界面上，只能自己造落点。
  const jobs = workflowJobs();
  const notice = jobs.find((job) => job.name === "scheduled-notice");
  assert.ok(notice, "缺少 scheduled-notice job：定时链路失败会退回「只有邮件」的状态");

  assert.match(
    notice.text,
    /\n {4}if: always\(\)/,
    "scheduled-notice 必须 always() —— 上游红了才最需要它跑",
  );
  assert.match(
    notice.text,
    /\n {6}issues: write\n/,
    "仓库默认工作流权限是只读，scheduled-notice 必须显式声明 issues: write",
  );

  const block = notice.text.match(/\n {4}needs:\n((?: {6}- [a-z][a-z0-9-]*\n)+)/);
  assert.ok(block, "scheduled-notice 的 needs 必须写成多行列表（本断言按这个形状解析）");
  const needs = block[1].trim().split("\n").map((line) => line.replace(/^\s*-\s*/, ""));

  // deploy-zh 只在 push 上跑，定时链路里它恒为 skipped，纳入 needs 只会让通知永远等不到。
  const watched = jobs
    .map((job) => job.name)
    .filter((name) => name !== "scheduled-notice" && name !== "deploy-zh");
  const missing = watched.filter((name) => !needs.includes(name));

  assert.deepEqual(
    missing,
    [],
    `scheduled-notice 漏看了这些 job：${missing.join(", ")}。` +
      `漏一个，它的失败就又回到「只有一封没人读的邮件」——那正是这道断言要防的事。`,
  );
});

test("每个 job 都要有 timeout-minutes", () => {
  // 2026-08-19：`Install Playwright chromium` 卡了整整 6 小时，一直到 GitHub 的硬上限
  // 才被强杀，那一轮的 React 18 冒烟因此压根没跑（runs/32294199543）。GitHub 默认的
  // 360 分钟对本仓任何一步都不是「超时」，是「挂死也当正常」。
  const missing = workflowJobs()
    .filter((job) => !/\n {4}timeout-minutes: \d+\n/.test(job.text))
    .map((job) => job.name);

  assert.deepEqual(missing, [], `这些 job 没有 timeout-minutes：${missing.join(", ")}`);
});

test("版本 PR 跳过重门禁时，必须有守卫证明它没夹带代码，且 static-checks 不许跳过", () => {
  // 跳过成立的唯一前提是「版本 PR 只改版本号与生成物」。谁给重 job 加了跳过条件、却删掉
  // 或改坏了守卫，前提就从「被验证」退化成「被假设」—— 往 changeset-release/master 推一个
  // 修复就能绕开 build 与全部浏览器门禁，而且没有任何东西会红。
  const jobs = workflowJobs();
  const skipping = jobs.filter((job) => job.text.includes("github.head_ref != 'changeset-release/master'"));
  if (skipping.length === 0) return;

  const guard = jobs.find((job) => job.text.includes("node scripts/version-pr-guard.mjs"));
  assert.ok(guard, "有 job 在版本 PR 上被跳过，却没有任何 job 跑 version-pr-guard.mjs");
  assert.match(
    guard.text,
    /\n {4}if: github\.head_ref == 'changeset-release\/master'\n/,
    `${guard.name} 必须恰好在版本 PR 上跑 —— 条件与跳过条件要互为补集`,
  );

  const typecheck = jobs.find((job) => job.text.includes("run: pnpm typecheck"));
  assert.ok(typecheck, "没有 job 跑 pnpm typecheck");
  assert.ok(
    !/\n {4}if:/.test(typecheck.text),
    `${typecheck.name} 不许带 job 级 if：版本 PR 上它是除守卫外唯一在跑的门禁（查发版产物版本一致）`,
  );
});

test("build 关掉构建期类型检查时，typecheck 之前必须先 next typegen", () => {
  // next build 的类型检查会先生成 .next/types/validator.ts（校验每个 page/layout 的导出），
  // 干净 checkout 上直接跑 tsc 是看不到这份文件的。build 关了类型检查而 typecheck 前不
  // typegen，这一层校验就悄悄没了 —— 两边都还是绿的。
  const jobs = workflowJobs();
  const skipsBuildTypecheck = jobs.some((job) => job.text.includes('HULIAN_SKIP_BUILD_TYPECHECK: "1"'));
  if (!skipsBuildTypecheck) return;

  const typecheck = jobs.find((job) => job.text.includes("run: pnpm typecheck"));
  assert.ok(typecheck, "没有 job 跑 pnpm typecheck");
  const typegen = typecheck.text.indexOf("next typegen");
  assert.notEqual(typegen, -1, `${typecheck.name} 没有在 typecheck 前跑 next typegen`);
  assert.ok(typegen < typecheck.text.indexOf("run: pnpm typecheck"), "next typegen 必须排在 pnpm typecheck 之前");
});

test("分片 job 的 matrix 必须恰好覆盖 1..N，与分母一致", () => {
  // 片数改了一边忘了另一边：分母大于 matrix 条数 = 静默漏扫若干片的路由 / 测试文件，
  // 而每一片自己都是绿的。分母小于条数会在 parseShard 里当场报错，但那也该在这里先红。
  const checked = [];
  for (const job of workflowJobs()) {
    const env = job.text.match(/CI_SHARD: \$\{\{ matrix\.shard \}\}\/(\d+)/);
    if (env) {
      const list = job.text.match(/\n {8}shard: \[([^\]]*)\]/);
      assert.ok(list, `${job.name} 用了 CI_SHARD 却没有 matrix.shard 列表`);
      const shards = list[1].split(",").map((value) => Number(value.trim()));
      const total = Number(env[1]);
      assert.deepEqual(shards, Array.from({ length: total }, (_, i) => i + 1), `${job.name} 的 matrix.shard 与分母 /${total} 不一致`);
      checked.push(job.name);
    }
    const parts = job.text.match(/\n {8}part: \[([^\]]*)\]/);
    if (parts) {
      const ui = parts[1].split(",").map((value) => value.trim()).filter((value) => value.startsWith("ui-"));
      const totals = new Set(ui.map((value) => value.split("/")[1]));
      assert.equal(totals.size, 1, `${job.name} 的 ui 分片分母不一致：${ui.join(", ")}`);
      const total = Number([...totals][0]);
      assert.deepEqual(ui, Array.from({ length: total }, (_, i) => `ui-${i + 1}/${total}`), `${job.name} 的 ui 分片没有覆盖 1..${total}`);
      checked.push(job.name);
    }
  }
  assert.ok(checked.length > 0, "没有找到任何分片 job —— 本断言的解析可能已经失效");
});
