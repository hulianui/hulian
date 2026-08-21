import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { checkRemoteAssets, classifyUrl, isReservedHost } from "./check-remote-assets.mjs";

function temporaryTree(t) {
  const root = mkdtempSync(join(tmpdir(), "hulian-remote-assets-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relativePath, content) {
  const file = join(root, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

const scan = (root) => checkRemoteAssets({ repoRoot: root, roots: ["src"] });

test("抓住写死的视频平台 embed 地址（issue #305 的原始形态）", (t) => {
  const root = temporaryTree(t);
  write(root, "src/a/a.showcase.tsx", 'const VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";\n');
  const { findings } = scan(root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].line, 1);
  assert.match(findings[0].reason, /媒体平台域名/);
});

test("抓住带素材扩展名的外链（占位图那一类）", (t) => {
  const root = temporaryTree(t);
  write(root, "src/a/a.showcase.tsx", 'const A = "https://static.acme.com/x/avatar.png";\n');
  const { findings } = scan(root);
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /素材扩展名/);
});

test("放行 RFC 保留域名 —— Image 的「必定失败」回退示例正靠它", (t) => {
  const root = temporaryTree(t);
  write(
    root,
    "src/a/a.showcase.tsx",
    [
      'const A = "https://invalid.example/none.png";',
      'const B = "https://cdn.example.com/uploaded.png";',
      'const C = "https://player.example.com/embed/xxxxx";',
      'const D = "http://localhost:3000/demo.mp4";',
      "",
    ].join("\n"),
  );
  assert.deepEqual(scan(root).findings, []);
});

test("放行本地路径与非素材外链（站点/仓库/规范说明性链接）", (t) => {
  const root = temporaryTree(t);
  write(
    root,
    "src/a/a.tsx",
    [
      'const A = demoAsset("/demo/sample-video.mp4");',
      '// 上游实现见 https://github.com/hulianui/hulian/issues/305',
      'const B = "https://beian.miit.gov.cn/";',
      "",
    ].join("\n"),
  );
  assert.deepEqual(scan(root).findings, []);
});

test("跳过测试文件（jsdom 里的 URL 字符串不会被真的请求）", (t) => {
  const root = temporaryTree(t);
  write(root, "src/a/a.test.tsx", 'const A = "https://cdn/x.png";\n');
  write(root, "src/a/__tests__/b.tsx", 'const B = "https://cdn/y.png";\n');
  const { findings, files } = scan(root);
  assert.deepEqual(findings, []);
  assert.equal(files, 0);
});

test("只扫源码，不扫 .md（文档里讲怎么接 YouTube 是散文不是素材）", (t) => {
  const root = temporaryTree(t);
  write(root, "src/a/a.md", 'videoSrc="https://www.youtube.com/embed/x"\n');
  assert.deepEqual(scan(root).findings, []);
});

test("逃生口要写理由：写了放行，空的仍算违规", (t) => {
  const root = temporaryTree(t);
  write(
    root,
    "src/a/a.tsx",
    'const A = "https://picsum.photos/200"; // remote-asset-ok: 上游文档原文引用，不参与渲染\n',
  );
  assert.deepEqual(scan(root).findings, []);

  const bare = temporaryTree(t);
  write(bare, "src/a/a.tsx", 'const A = "https://picsum.photos/200"; // remote-asset-ok\n');
  const { findings } = scan(bare);
  assert.equal(findings.length, 1);
  assert.match(findings[0].reason, /必须写明理由/);
});

test("抓住远程字体：字体服务 API 没有扩展名，只能靠域名", (t) => {
  const root = temporaryTree(t);
  write(
    root,
    "src/a/a.css",
    [
      '@import url("https://fonts.googleapis.com/css2?family=Inter&display=swap");',
      "@font-face { src: url(https://static.acme.com/inter.woff2) format('woff2'); }",
      "",
    ].join("\n"),
  );
  const { findings } = scan(root);
  assert.equal(findings.length, 2);
  assert.match(findings[0].reason, /媒体平台域名|字体/);
  assert.match(findings[1].reason, /素材扩展名/);
});

test("查询串与 hash 结尾的视频地址都算视频文件（不会误判成 embed）", () => {
  assert.equal(classifyUrl("https://cdn.acme.com/hero.mp4?token=x") !== undefined, true);
  assert.equal(classifyUrl("https://cdn.acme.com/hero.mp4#t=10") !== undefined, true);
});

test("classifyUrl / isReservedHost 的边界", () => {
  assert.equal(isReservedHost("example.com"), true);
  assert.equal(isReservedHost("sub.example.org"), true);
  assert.equal(isReservedHost("notexample.com"), false);
  assert.equal(isReservedHost("evil-example.com"), false);
  assert.equal(classifyUrl("https://img.youtube.com/vi/x/0.jpg") !== undefined, true);
  assert.equal(classifyUrl("https://hulianui.haloritual.com/zh/components/viewport"), undefined);
  // SVG 命名空间 URI 以 /svg 结尾而不是 .svg，不该被当成素材（reflective-card 里就有一条）。
  assert.equal(classifyUrl("http://www.w3.org/2000/svg"), undefined);
});
