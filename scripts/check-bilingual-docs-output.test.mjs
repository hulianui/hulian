import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test from "node:test";

import {
  scanEnglishDocument,
  scanEnglishLinks,
  task9EnglishRoutes,
  task9ExpectedRelativeRoutes,
} from "./check-bilingual-docs-output.mjs";
import { NESTED_BASE_PATH } from "./docs-locale-layout.mjs";

function writeRouteInventory(root, excluded) {
  for (const route of task9ExpectedRelativeRoutes()) {
    if (route === excluded) continue;
    const file = join(root, route);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, "<!doctype html><html><body>English</body></html>");
  }
}

test("English output scan reports visible, metadata, and accessible CJK but ignores hidden payloads", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-scan-"));
  mkdirSync(join(root, "en"), { recursive: true });
  const file = join(root, "en", "start.html");
  writeFileSync(
    file,
    `<!doctype html><html><head><title>开始</title><meta name="description" content="Guide"></head>
      <body><main><p>Visible English</p><input placeholder="请输入"><img alt="示例" title="Preview"></main>
      <div hidden>找不到页面</div><script>const copy = "复制"</script></body></html>`,
  );

  assert.deepEqual(
    scanEnglishDocument(file).map(({ field, value }) => ({ field, value })),
    [
      { field: "metadata:title", value: "开始" },
      { field: "attribute:placeholder", value: "请输入" },
      { field: "attribute:alt", value: "示例" },
    ],
  );
});

test("English output scan reports visible text nodes without concatenating unrelated nodes", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-scan-"));
  const file = join(root, "preview.html");
  writeFileSync(file, "<!doctype html><html><body><p>Owner：</p><p>English</p></body></html>");

  assert.deepEqual(
    scanEnglishDocument(file).map(({ field, value }) => ({ field, value })),
    [{ field: "visible:text", value: "Owner：" }],
  );
});

test("English output scan rejects duplicate prefixes and unintended Chinese docs links", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-scan-"));
  const file = join(root, "start.html");
  writeFileSync(
    file,
    `<!doctype html><html><body>
    <a href="${NESTED_BASE_PATH}${NESTED_BASE_PATH}/start">Duplicate</a>
    <a href="${NESTED_BASE_PATH}/blocks/button">Wrong locale</a>
    <a href="${NESTED_BASE_PATH}/start" hreflang="zh-CN">Chinese language switch</a>
    <a href="/blocks/button">Own-locale docs route</a>
    <a href="/pricing">Fixture route</a>
    <img src="/logo.svg" alt="Logo">
  </body></html>`,
  );

  // 英文是根语言：裸的文档路由是它自己的，带嵌套前缀的才算跨语种泄漏；
  // 显式标了 hreflang="zh-CN" 的语言切换链接放行。
  assert.deepEqual(
    scanEnglishLinks(file).map(({ field, value }) => ({ field, value })),
    [
      { field: "duplicate-prefix:href", value: `${NESTED_BASE_PATH}${NESTED_BASE_PATH}/start` },
      { field: "cross-locale:href", value: `${NESTED_BASE_PATH}/blocks/button` },
    ],
  );
});

test("Task 9 inventory is derived from current block and page metadata", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-inventory-"));
  const expected = task9ExpectedRelativeRoutes();
  writeRouteInventory(root);

  assert.equal(expected.length, 171);
  assert.equal(expected.filter((route) => route.startsWith("blocks/")).length, 57);
  assert.equal(expected.filter((route) => route.startsWith("pages/")).length, 20);
  assert.deepEqual(
    task9EnglishRoutes(root).map((file) => relative(root, file).replaceAll("\\", "/")),
    expected,
  );
});

test("Task 9 inventory rejects a missing metadata-derived route", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-inventory-"));
  writeRouteInventory(root, "preview/blocks/navbar.html");

  assert.throws(
    () => task9EnglishRoutes(root),
    /Missing English output route: preview\/blocks\/navbar\.html/,
  );
});

test("Task 9 inventory rejects an unexpected theme route", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-inventory-"));
  writeRouteInventory(root);
  writeFileSync(join(root, "theme", "experimental.html"), "<!doctype html><html></html>");

  assert.throws(
    () => task9EnglishRoutes(root),
    /English theme output differs from the expected route inventory/,
  );
});
