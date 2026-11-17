import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyPublishFailure,
  parseStagedConflicts,
  publishablePackages,
  waitForPublished,
} from "./publish-release.mjs";

// 样本取 2026-11-18 的真实输出：0.78.0 落进 npm staged 后重试时的那条（含 changesets 的 ANSI 颜色
// 与 npm 的换行折行），以及旁边同时存在的真实失败。
const STAGED_LOG = [
  "🦋  \u001b[36minfo\u001b[39m Publishing \u001b[36m\"@hulianui/ui\"\u001b[39m at \u001b[32m\"0.78.0\"\u001b[39m",
  "🦋  \u001b[31merror\u001b[39m an error occurred while publishing @hulianui/ui: E409 409 Conflict - PUT https://registry.npmjs.org/@hulianui%2fui - Cannot publish over previously staged version \"0.78.0\". ",
  "🦋  \u001b[31merror\u001b[39m npm error code E409",
  "🦋  \u001b[31merror\u001b[39m packages failed to publish:",
].join("\n");

test("staged 冲突能从带颜色的真实输出里认出来", () => {
  assert.deepEqual(parseStagedConflicts(STAGED_LOG), [{ name: "@hulianui/ui", version: "0.78.0" }]);
});

test("只有 staged 冲突时不算真失败（重试撞车也不该红）", () => {
  const { staged, hard } = classifyPublishFailure(STAGED_LOG);
  assert.equal(staged.length, 1);
  assert.deepEqual(hard, []);
});

test("混进一条真实失败就不许再等：等待不能掩盖真错", () => {
  const output = `${STAGED_LOG}\n🦋  error an error occurred while publishing @hulianui/tokens: E403 403 Forbidden - no permission`;
  const { staged, hard } = classifyPublishFailure(output);
  assert.deepEqual(staged, [{ name: "@hulianui/ui", version: "0.78.0" }]);
  assert.equal(hard.length, 1);
  assert.equal(hard[0].name, "@hulianui/tokens");
});

test("同一条 E409 但版本不同 → 不是同一个冲突，按真失败处理", () => {
  const output =
    "error an error occurred while publishing @hulianui/ui: E409 409 Conflict - Cannot publish over previously staged version \"0.77.0\"";
  const { staged, hard } = classifyPublishFailure(output);
  assert.deepEqual(staged, [{ name: "@hulianui/ui", version: "0.77.0" }]);
  assert.deepEqual(hard, [], "版本确实是 0.77.0，属于可恢复的那类");
});

test("可发布包 = packages/* 里未标 private 的", () => {
  const packages = publishablePackages();
  const names = packages.map((pkg) => pkg.name);
  assert.ok(names.includes("@hulianui/ui"));
  assert.ok(names.includes("@hulianui/tokens"));
  assert.ok(!names.includes("@hulianui/mocks"), "private 包不该进核验名单");
  assert.ok(!names.includes("@hulianui/hulian-scan"), "private 包不该进核验名单");
  for (const pkg of packages) assert.match(pkg.version, /^\d+\.\d+\.\d+/);
});

test("轮询：晚一拍上线也能等到，并报出已等多久", async () => {
  let clock = 0;
  const seen = [];
  const result = await waitForPublished(
    [{ name: "@hulianui/ui", version: "0.78.0" }],
    {
      isLive: async () => clock >= 45_000,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      intervalMs: 15_000,
      timeoutMs: 12 * 60_000,
      log: (message) => seen.push(message),
    },
  );
  assert.equal(result.ok, true);
  assert.equal(result.elapsedMs, 45_000);
  assert.ok(seen.length >= 2, "每一轮复查都该打一行");
  assert.match(seen[0], /还差 @hulianui\/ui@0\.78\.0/);
});

test("轮询：超时只报还差哪几版，不抛异常", async () => {
  let clock = 0;
  const result = await waitForPublished(
    [
      { name: "@hulianui/ui", version: "0.78.0" },
      { name: "@hulianui/tokens", version: "0.19.0" },
    ],
    {
      isLive: async ({ name }) => name === "@hulianui/ui",
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
      intervalMs: 60_000,
      timeoutMs: 120_000,
    },
  );
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.missing.map((pkg) => pkg.name),
    ["@hulianui/tokens"],
  );
  assert.ok(result.elapsedMs >= 120_000);
});
