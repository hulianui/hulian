import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { scanEnglishHtml, scanEnglishOutput } from "./check-english-output.mjs";

function temporaryTree(t) {
  const root = mkdtempSync(join(tmpdir(), "hulian-english-output-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relativePath, content) {
  const file = join(root, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return file;
}

function html(body, head = "") {
  return `<!doctype html><html lang="en"><head>${head}</head><body>${body}</body></html>`;
}

test("HTML scan reports every human-facing CJK surface with actionable locations", (t) => {
  const root = temporaryTree(t);
  const svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"><text>封面</text></svg>');
  const file = write(
    root,
    "en/catalog/item.html",
    html(
      `<main>
        <h1>标题</h1>
        <pre><code>const message = "保存";</code></pre>
        <button title="提示" aria-label="提交">Submit</button>
        <input placeholder="请输入">
        <img alt="示例图" src="data:image/svg+xml,${svg}">
      </main>
      <script type="application/ld+json">{"name":"结构化标题","nested":{"label":"说明"}}</script>`,
      `<title>页面标题</title>
       <meta name="description" content="页面说明">
       <meta property="og:title" content="分享标题">
       <meta name="twitter:description" content="推文说明">`,
    ),
  );

  const findings = scanEnglishHtml(file, { root, route: "/en/catalog/item" });
  const locations = findings.map(({ location }) => location);

  assert.ok(locations.includes("title"));
  assert.ok(locations.includes('meta[name="description"]@content'));
  assert.ok(locations.includes('meta[property="og:title"]@content'));
  assert.ok(locations.includes('meta[name="twitter:description"]@content'));
  assert.ok(locations.some((location) => location.endsWith("h1#text")));
  assert.ok(locations.some((location) => location.endsWith("code#text")));
  assert.ok(locations.some((location) => location.endsWith("button@title")));
  assert.ok(locations.some((location) => location.endsWith("button@aria-label")));
  assert.ok(locations.some((location) => location.endsWith("input@placeholder")));
  assert.ok(locations.some((location) => location.endsWith("img@alt")));
  assert.ok(locations.some((location) => location.endsWith("img@src:svg/text()[1]")));
  assert.ok(locations.includes("script[application/ld+json]$.name"));
  assert.ok(locations.includes("script[application/ld+json]$.nested.label"));
  assert.ok(findings.every(({ file: findingFile }) => findingFile === "en/catalog/item.html"));
  assert.ok(findings.every(({ route }) => route === "/en/catalog/item"));
  assert.ok(findings.every(({ excerpt }) => excerpt.length > 0));
});

test("HTML scan ignores genuinely non-rendered payloads but scans displayed code and aria state", (t) => {
  const root = temporaryTree(t);
  const file = write(
    root,
    "en/index.html",
    html(`<main>
      <p>English prose</p>
      <pre><code>console.log("可见")</code></pre>
      <div hidden>隐藏</div>
      <div aria-hidden="true">视觉内容</div>
      <div inert>非交互内容</div>
      <script>const message = "脚本"</script>
      <style>.例子::after { content: "样式"; }</style>
      <template>模板</template>
      <noscript>后备</noscript>
    </main>`),
  );

  assert.deepEqual(
    scanEnglishHtml(file, { root, route: "/en" }).map(({ excerpt }) => excerpt),
    ['console.log("可见")', "视觉内容", "非交互内容"],
  );
});

test("HTML scan reconstructs Next streaming $RC content before applying hidden filtering", (t) => {
  const root = temporaryTree(t);
  const file = write(
    root,
    "en/streamed.html",
    html(`<main>
      <template id="B:0"></template><p>Loading...</p><!--/$-->
    </main>
    <div hidden id="S:0"><article><h1>流式正文</h1></article></div>
    <div hidden id="S:1"><article><h1>未挂载正文</h1></article></div>
    <script>$RC("B:0","S:0")</script>`),
  );

  assert.deepEqual(
    scanEnglishHtml(file, { root, route: "/en/streamed" }).map(({ excerpt }) => excerpt),
    ["流式正文"],
  );
});

test("HTML scan includes text nodes that are direct children of body", (t) => {
  const root = temporaryTree(t);
  const file = write(root, "en/direct.html", html("正文直接文本<main>English</main>"));

  assert.deepEqual(
    scanEnglishHtml(file, { root, route: "/en/direct" }).map(({ excerpt }) => excerpt),
    ["正文直接文本"],
  );
});

test("data-i18n-allow-cjk is node-scoped and requires a nearby English explanation", (t) => {
  const root = temporaryTree(t);
  const valid = write(
    root,
    "en/valid.html",
    html(`<p><span data-i18n-allow-cjk>瑚琏</span> (Hulian brand name)</p>`),
  );
  const invalid = write(
    root,
    "en/invalid.html",
    html(`<main>
      <span data-i18n-allow-cjk>专名</span>
      <p data-i18n-allow-cjk>品牌 <strong>未豁免子节点</strong></p>
    </main>`),
  );

  assert.deepEqual(scanEnglishHtml(valid, { root, route: "/en/valid" }), []);
  const findings = scanEnglishHtml(invalid, { root, route: "/en/invalid" });
  assert.ok(findings.some(({ kind }) => kind === "invalid-allow-cjk"));
  assert.ok(
    findings.some(({ kind, excerpt }) => kind === "cjk" && excerpt.includes("未豁免子节点")),
  );
});

test("English residue includes Han and CJK or fullwidth punctuation", (t) => {
  const root = temporaryTree(t);
  const file = write(root, "en/punctuation.html", html("<p>English：fullwidth，punctuation！</p>"));

  assert.deepEqual(
    scanEnglishHtml(file, { root, route: "/en/punctuation" }).map(({ excerpt }) => excerpt),
    ["English：fullwidth，punctuation！"],
  );
});

test("output scan enumerates physical HTML plus public human-readable JSON and text", async (t) => {
  const root = temporaryTree(t);
  write(root, "en/index.html", html("<h1>English</h1>"));
  write(root, "en/nested/page.html", html("<p>残留</p>"));
  write(
    root,
    "en/registry.json",
    JSON.stringify({ items: [{ name: "button", title: "Button", description: "说明" }] }),
  );
  write(
    root,
    "en/r/button.json",
    JSON.stringify({
      title: "Button",
      description: "Action trigger",
      cssVars: { light: { font: '"楷体", sans-serif' } },
      files: [{ path: "button.tsx", content: "// 技术源码不属于人类展示字段" }],
    }),
  );
  write(
    root,
    "en/conventions.json",
    JSON.stringify({
      executableRules: [
        {
          id: "rule",
          matcher: { sourcePattern: "中文字面协议" },
          message: "规则说明",
          rule: "规则正文",
          why: "原因说明",
          when: "适用场景",
          notThis: "错误方式",
          right: "正确示例",
          wrong: "错误示例",
          arbitraryHumanField: "任意人类说明",
        },
      ],
    }),
  );
  write(root, "en/llms.txt", "# English index\n公开说明\n");
  write(root, "en/d/button.md", "# Button\nEnglish only.\n");
  write(root, "en/__next._full.txt", "内部序列化中文不属于公开文本端点");
  write(root, "en/robots.txt", "User-agent: *\nDisallow:");

  const result = await scanEnglishOutput(root);

  assert.equal(result.counts.html, 2);
  assert.equal(result.counts.json, 3);
  assert.equal(result.counts.text, 2);
  assert.equal(result.counts.total, 7);
  assert.deepEqual(
    result.findings.map(({ file, location }) => [file, location]),
    [
      ["en/conventions.json", "$.executableRules[0].arbitraryHumanField"],
      ["en/conventions.json", "$.executableRules[0].message"],
      ["en/conventions.json", "$.executableRules[0].notThis"],
      ["en/conventions.json", "$.executableRules[0].right"],
      ["en/conventions.json", "$.executableRules[0].rule"],
      ["en/conventions.json", "$.executableRules[0].when"],
      ["en/conventions.json", "$.executableRules[0].why"],
      ["en/conventions.json", "$.executableRules[0].wrong"],
      ["en/llms.txt", "line 2"],
      ["en/nested/page.html", "html > body > p#text"],
      ["en/registry.json", "$.items[0].description"],
    ],
  );
});

test("malformed JSON-LD and human-readable JSON fail closed with their exact path", async (t) => {
  const root = temporaryTree(t);
  write(root, "en/index.html", html('<script type="application/ld+json">{"name":</script>'));
  write(root, "en/registry.json", "{not-json");

  const result = await scanEnglishOutput(root);

  assert.deepEqual(
    result.findings.map(({ kind, file, location }) => [kind, file, location]),
    [
      ["invalid-json", "en/index.html", "script[application/ld+json]"],
      ["invalid-json", "en/registry.json", "$"],
    ],
  );
});
