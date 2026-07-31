// 端到端跑真实的 MCP server：起子进程、走 stdio JSON-RPC、验四个 tool 的真实返回。
// 不 mock 任何东西 —— server 的价值就在于「AI 拿到的是真数据」，mock 掉就什么都没验。

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(HERE, "..", "src", "index.mjs");
const UI_ROOT = join(HERE, "..", "..", "ui");

/**
 * 起一个 server，走完整 MCP 握手（initialize → notifications/initialized），
 * 再发业务请求，按 id 收齐后返回。
 *
 * 注意握手是两步：只发 initialize 不发 initialized 通知，SDK 不会开始处理业务请求。
 * 响应也要按 id 认领 —— initialize 自己会占一条，不能按条数计。
 */
function rpc(requests) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [ENTRY], {
      env: { ...process.env, HULIAN_UI_ROOT: UI_ROOT },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const wanted = new Set(requests.map((r) => r.id));
    const byId = new Map();
    let buf = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`超时，缺 id：${[...wanted].filter((i) => !byId.has(i)).join(",")}`));
    }, 30000);

    child.stdout.on("data", (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue; // 非 JSON 行（server 的 ready 日志走 stderr，这里是保险）
        }
        if (wanted.has(msg.id)) byId.set(msg.id, msg);
        if (byId.size === wanted.size) {
          clearTimeout(timer);
          child.kill();
          resolve(requests.map((r) => byId.get(r.id)));
        }
      }
    });
    child.on("error", reject);

    const send = (o) => child.stdin.write(JSON.stringify(o) + "\n");
    send({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    for (const r of requests) send(r);
  });
}

const call = (id, name, args = {}) => ({
  jsonrpc: "2.0",
  id,
  method: "tools/call",
  params: { name, arguments: args },
});

const bodyOf = (res) => res.result?.content?.[0]?.text ?? "";

test("tools/list 暴露四个 tool", async () => {
  const [list] = await rpc([{ jsonrpc: "2.0", id: 1, method: "tools/list" }]);
  const names = (list.result?.tools ?? []).map((t) => t.name).sort();
  assert.deepEqual(names, ["get_component_doc", "get_conventions", "install_block", "list_components"]);
});

test("list_components 能按关键词找到组件，并带出导入语句", async () => {
  const [res] = await rpc([call(2, "list_components", { query: "表格" })]);
  const body = bodyOf(res);
  assert.match(body, /pro-table/, "应能搜到 ProTable");
  assert.match(body, /import \{[^}]*\} from "@hulianui\/ui"/, "应带出根 barrel 导入语句");
});

test("list_components 能列出区块（此前只活在文档站里）", async () => {
  const [res] = await rpc([call(3, "list_components", { kind: "block", limit: 5 })]);
  const body = bodyOf(res);
  assert.match(body, /block-/, "区块 item 名以 block- 开头");
});

test("get_component_doc 返回真实 Props 文档", async () => {
  const [res] = await rpc([call(4, "get_component_doc", { name: "button" })]);
  const body = bodyOf(res);
  assert.match(body, /## Props/, "应含 Props 章节");
  assert.match(body, /@hulianui\/ui/, "应含导入信息");
});

test("get_component_doc 接受显示名（ProTable → pro-table）", async () => {
  const [res] = await rpc([call(5, "get_component_doc", { name: "ProTable" })]);
  assert.match(bodyOf(res), /## Props/);
});

test("名字打错时给出候选，而不是干巴巴的 not found", async () => {
  const [res] = await rpc([call(6, "get_component_doc", { name: "buton" })]);
  const body = bodyOf(res);
  assert.equal(res.result?.isError, true);
  assert.match(body, /button/, "应提示最接近的候选");
});

test("get_conventions 返回全局铁律与易混淆件", async () => {
  const [res] = await rpc([call(7, "get_conventions")]);
  const body = bodyOf(res);
  assert.match(body, /--color-/, "应含色彩 token 前缀约束");
  assert.match(body, /MuiBridgeProvider/, "应含 MUI 桥 Provider 约束");
  assert.match(body, /Tag/, "应含 Badge↔Tag 易混淆提示");
});

test("get_conventions 带 scope 返回该组件的硬约束", async () => {
  const [res] = await rpc([call(8, "get_conventions", { scope: "AdminLayout" })]);
  assert.match(bodyOf(res), /fitViewport/, "AdminLayout 的约束应含 fitViewport");
});

test("install_block 返回自包含区块的可注入源码与安装命令", async () => {
  const [res] = await rpc([call(9, "install_block", { name: "block-pricing-table" })]);
  const body = bodyOf(res);
  assert.match(body, /npx shadcn@latest add/, "应给出安装命令");
  assert.match(body, /@hulianui\/ui/, "区块源码应从根 barrel 导入");
  assert.match(body, /```tsx/, "应内联源码");
});

test("install_block 对组件提示优先用 npm import 而非注入源码", async () => {
  const [res] = await rpc([call(10, "install_block", { name: "button", includeSource: false })]);
  assert.match(bodyOf(res), /不需要.{0,2}注入源码/, "组件应引导走 npm import 而非注入");
});
