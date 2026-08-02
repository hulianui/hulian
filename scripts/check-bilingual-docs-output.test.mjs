import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { scanEnglishDocument, scanEnglishLinks } from "./check-bilingual-docs-output.mjs";

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

  assert.deepEqual(scanEnglishDocument(file).map(({ field, value }) => ({ field, value })), [
    { field: "metadata:title", value: "开始" },
    { field: "attribute:placeholder", value: "请输入" },
    { field: "attribute:alt", value: "示例" },
  ]);
});

test("English output scan reports visible text nodes without concatenating unrelated nodes", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-scan-"));
  const file = join(root, "preview.html");
  writeFileSync(file, "<!doctype html><html><body><p>Owner：</p><p>English</p></body></html>");

  assert.deepEqual(scanEnglishDocument(file).map(({ field, value }) => ({ field, value })), [
    { field: "visible:text", value: "Owner：" },
  ]);
});

test("English output scan rejects duplicate prefixes and unintended Chinese docs links", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-output-scan-"));
  const file = join(root, "start.html");
  writeFileSync(file, `<!doctype html><html><body>
    <a href="/en/en/start">Duplicate</a>
    <a href="/blocks/button">Wrong locale</a>
    <a href="/start" hreflang="zh-CN">Chinese language switch</a>
    <a href="/pricing">Fixture route</a>
    <img src="/en/logo.svg" alt="Logo">
  </body></html>`);

  assert.deepEqual(scanEnglishLinks(file).map(({ field, value }) => ({ field, value })), [
    { field: "duplicate-prefix:href", value: "/en/en/start" },
    { field: "cross-locale:href", value: "/blocks/button" },
  ]);
});
