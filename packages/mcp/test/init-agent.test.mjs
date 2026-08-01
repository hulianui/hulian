// init-agent 的端到端：起真实子进程跑 CLI，在临时目录里验文件真的被正确改动。
// 这条链路的全部价值就在于「不弄坏用户已有内容」，mock 掉文件系统就什么都没验。
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { MARKER_BEGIN, MARKER_END } from "../src/contract.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(HERE, "..", "src", "index.mjs");

function tmpProject() {
  return mkdtempSync(join(tmpdir(), "hulian-init-"));
}

/** 跑 CLI，返回 {code, stdout, stderr}；非 0 退出不抛。 */
async function cli(root, args = []) {
  try {
    const { stdout, stderr } = await run("node", [ENTRY, "init-agent", "--cwd", root, ...args]);
    return { code: 0, stdout, stderr };
  } catch (e) {
    return { code: e.code ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

const read = (root, file) => readFileSync(join(root, file), "utf8");
const exists = (root, file) => {
  try {
    read(root, file);
    return true;
  } catch {
    return false;
  }
};

test("空项目：创建 AGENTS.md 而不是撒四份文件", async () => {
  const root = tmpProject();
  try {
    const { code, stdout } = await cli(root);
    assert.equal(code, 0, stdout);
    assert.ok(exists(root, "AGENTS.md"), "应创建最通用的 AGENTS.md");
    assert.ok(!exists(root, "CLAUDE.md"), "不该主动撒 CLAUDE.md");
    assert.ok(!exists(root, ".github/copilot-instructions.md"), "不该主动撒 copilot 指令");

    const body = read(root, "AGENTS.md");
    assert.ok(body.includes(MARKER_BEGIN) && body.includes(MARKER_END), "要有成对 marker");
    assert.ok(body.includes("get_agent_profile"), "契约应引导用 MCP 取场景");
    assert.ok(body.includes("不猜 props"), "契约核心规则要在");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("已有 CLAUDE.md：追加而不覆盖用户内容", async () => {
  const root = tmpProject();
  try {
    const mine = "# 我的项目\n\n这段是用户自己写的，绝不能丢。\n";
    writeFileSync(join(root, "CLAUDE.md"), mine);

    const { code } = await cli(root);
    assert.equal(code, 0);

    const body = read(root, "CLAUDE.md");
    assert.ok(body.startsWith(mine.trimEnd()), "用户原内容必须原样保留在最前");
    assert.ok(body.includes(MARKER_BEGIN), "契约区块要追加在后面");
    assert.ok(!exists(root, "AGENTS.md"), "已有指令文件时不该再建新的");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("重复运行幂等：第二次报「已最新」且文件字节不变", async () => {
  const root = tmpProject();
  try {
    writeFileSync(join(root, "AGENTS.md"), "# 项目说明\n");
    await cli(root);
    const first = read(root, "AGENTS.md");

    const { code, stdout } = await cli(root);
    assert.equal(code, 0);
    assert.ok(stdout.includes("已是最新"), `第二次应报已最新，实际：${stdout}`);
    assert.equal(read(root, "AGENTS.md"), first, "幂等：内容必须逐字节一致");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("用户在契约区块前后加内容：更新只动区块自身", async () => {
  const root = tmpProject();
  try {
    writeFileSync(join(root, "AGENTS.md"), "# 头部\n");
    await cli(root);

    const withEdits = `${read(root, "AGENTS.md")}\n## 我后加的章节\n保留我。\n`;
    writeFileSync(join(root, "AGENTS.md"), withEdits);

    // 手工把区块内容改坏，模拟旧版本契约
    const broken = withEdits.replace(
      /<!-- hulianui:begin -->[\s\S]*?<!-- hulianui:end -->/,
      `${MARKER_BEGIN}\n旧版本契约内容\n${MARKER_END}`,
    );
    writeFileSync(join(root, "AGENTS.md"), broken);

    const { code } = await cli(root);
    assert.equal(code, 0);

    const body = read(root, "AGENTS.md");
    assert.ok(body.startsWith("# 头部"), "区块前的内容保留");
    assert.ok(body.includes("## 我后加的章节"), "区块后的内容保留");
    assert.ok(body.includes("保留我。"), "区块后的正文保留");
    assert.ok(!body.includes("旧版本契约内容"), "旧区块内容应被替换");
    assert.ok(body.includes("不猜 props"), "新契约已写入");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("marker 只剩一半：报冲突并退出，不写任何文件", async () => {
  const root = tmpProject();
  try {
    const half = `# 项目\n\n${MARKER_BEGIN}\n被手工删掉了收尾 marker\n`;
    writeFileSync(join(root, "AGENTS.md"), half);

    const { code, stderr } = await cli(root);
    assert.notEqual(code, 0, "冲突必须非 0 退出");
    assert.ok(stderr.includes("冲突"), `应说明冲突，实际：${stderr}`);
    assert.equal(read(root, "AGENTS.md"), half, "冲突时文件必须原样不动");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--check 不写文件，有待办时非 0 退出（可进 CI）", async () => {
  const root = tmpProject();
  try {
    writeFileSync(join(root, "AGENTS.md"), "# 项目\n");

    const first = await cli(root, ["--check"]);
    assert.notEqual(first.code, 0, "有待办应非 0，便于 CI 拦截");
    assert.ok(!read(root, "AGENTS.md").includes(MARKER_BEGIN), "--check 绝不能写文件");

    await cli(root);
    const second = await cli(root, ["--check"]);
    assert.equal(second.code, 0, "装好后 --check 应为 0");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--doctor 报出装在哪、是否最新、MCP 有没有配", async () => {
  const root = tmpProject();
  try {
    const before = await cli(root, ["--doctor"]);
    assert.equal(before.code, 0);
    assert.ok(before.stdout.includes("未装契约"), "未装时要说清楚");
    assert.ok(
      before.stdout.includes("未在本项目发现引用 hulianui 的 MCP 配置"),
      "没配 MCP 时要提醒，否则契约里的 tool 调用会落空",
    );

    await cli(root);
    mkdirSync(join(root, ".cursor"), { recursive: true });
    writeFileSync(
      join(root, ".cursor", "mcp.json"),
      JSON.stringify({ mcpServers: { hulianui: { command: "npx" } } }),
    );

    const after = await cli(root, ["--doctor"]);
    assert.ok(after.stdout.includes("契约已装且最新"), "装好后要报最新");
    assert.ok(after.stdout.includes(".cursor/mcp.json"), "应发现 MCP 配置");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--target 指定目标；未知 target 报错退出", async () => {
  const root = tmpProject();
  try {
    const bad = await cli(root, ["--target", "nope"]);
    assert.notEqual(bad.code, 0);
    assert.ok(bad.stderr.includes("未知 target"));

    const ok = await cli(root, ["--target", "cursor"]);
    assert.equal(ok.code, 0, ok.stderr);
    assert.ok(exists(root, ".cursor/rules/hulianui.mdc"), "应写 Cursor 规则文件");
    const body = read(root, ".cursor/rules/hulianui.mdc");
    assert.ok(body.startsWith("---"), "Cursor 规则需要 frontmatter 才会自动加载");
    assert.ok(body.includes("alwaysApply: true"));
    assert.ok(!exists(root, "AGENTS.md"), "指定了 target 就不该再建别的");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--all 覆盖四家客户端", async () => {
  const root = tmpProject();
  try {
    const { code } = await cli(root, ["--all"]);
    assert.equal(code, 0);
    for (const f of [
      "AGENTS.md",
      "CLAUDE.md",
      ".cursor/rules/hulianui.mdc",
      ".github/copilot-instructions.md",
    ])
      assert.ok(exists(root, f), `--all 应写 ${f}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
