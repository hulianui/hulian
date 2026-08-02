import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  barrelExports,
  buildCompositeItems,
  parseFrontmatter,
  removeDocsFixtureAdapters,
  rewritePageBlockImports,
  scanPageBlockDeps,
} from "./gen-llms-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function withCompositeFixture(metaEntry, run, options = {}) {
  const root = mkdtempSync(join(tmpdir(), "hulian-composite-meta-"));
  const metaFile = join(root, "_meta.ts");
  const sourceDir = join(root, "source");
  try {
    writeFileSync(metaFile, `export const ${options.collection ?? "blocks"} = [${metaEntry}];\n`);
    mkdirSync(sourceDir);
    writeFileSync(
      join(sourceDir, "example.tsx"),
      options.source ?? "export function Example() { return <div />; }\n",
    );
    return run({ root, metaFile, sourceDir });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const BASE_META = `{
  slug: "example",
  name: "Example",
  description: "fixture",
  category: "marketing",
  tags: ["fixture"],
  file: "example.tsx"`;

test("组合元数据缺少显式 installation 时拒绝生成", () => {
  withCompositeFixture(`${BASE_META}\n}`, ({ metaFile, sourceDir }) => {
    assert.throws(
      () => buildCompositeItems(metaFile, sourceDir, "block"),
      /example.*installation/i,
    );
  });
});

test("组合元数据原样写入 installation 并支持 assets", () => {
  withCompositeFixture(
    `${BASE_META},
  installation: {
    providers: [],
    replace: ["assets", "copy"],
    slots: ["hero"]
  }
}`,
    ({ metaFile, sourceDir }) => {
      const [item] = buildCompositeItems(metaFile, sourceDir, "block");
      assert.deepEqual(item.meta.installation, {
        providers: [],
        replace: ["assets", "copy"],
        slots: ["hero"],
      });
    },
  );
});

test("组合元数据出现未知 replace 值时拒绝生成", () => {
  withCompositeFixture(
    `${BASE_META},
  installation: { providers: [], replace: ["guess"], slots: [] }
}`,
    ({ metaFile, sourceDir }) => {
      assert.throws(
        () => buildCompositeItems(metaFile, sourceDir, "block"),
        /guess.*replace|replace.*guess/i,
      );
    },
  );
});

test("页面 slots 缺少真实区块依赖时拒绝生成", () => {
  withCompositeFixture(
    `${BASE_META},
  installation: { providers: [], replace: [], slots: [] }
}`,
    ({ metaFile, sourceDir }) => {
      assert.throws(
        () => buildCompositeItems(metaFile, sourceDir, "page"),
        /slots.*hero|hero.*slots/i,
      );
    },
    {
      collection: "pages",
      source:
        'import { HeroBlock } from "../../blocks/_blocks/hero";\nexport function Example() { return <HeroBlock />; }\n',
    },
  );
});

test("页面源码注入后改用目标目录中的兄弟区块路径", () => {
  const source = 'import { HeroBlock } from "../../blocks/_blocks/hero";';

  assert.equal(rewritePageBlockImports(source), 'import { HeroBlock } from "../blocks/hero";');
});

test("registry 源码移除文档站专用的双语适配器", () => {
  const source = [
    "/** @jsxImportSource ../../../lib/fixture-jsx */",
    'import { Button, toast } from "../../../lib/fixture-ui";',
    "export function Example() { return <Button />; }",
  ].join("\n");

  assert.equal(
    removeDocsFixtureAdapters(source),
    [
      'import { Button, toast } from "@hulianui/ui";',
      "export function Example() { return <Button />; }",
    ].join("\n"),
  );
});

test("页面依赖扫描去重并稳定输出 registry 区块名", () => {
  const source = [
    'import { HeroBlock } from "../../blocks/_blocks/hero";',
    'import { FaqBlock } from "../../blocks/_blocks/faq";',
    'import { HeroAgain } from "../../blocks/_blocks/hero";',
  ].join("\n");

  assert.deepEqual(scanPageBlockDeps(source), ["block-faq", "block-hero"]);
});

test("20 个页面的源码路径与 registryDependencies 在安装后闭环", () => {
  const pageItems = buildCompositeItems(
    join(ROOT, "apps/www/app/pages/_meta.ts"),
    join(ROOT, "apps/www/app/pages/_pages"),
    "page",
  );

  assert.equal(pageItems.length, 20);
  assert.equal(pageItems.filter((item) => item.registryDependencies.length > 0).length, 18);

  for (const item of pageItems) {
    const content = item.files[0].content;
    assert.doesNotMatch(content, /\.\.\/\.\.\/blocks\/_blocks\//, item.name);

    const installedBlockImports = [
      ...content.matchAll(/(?:from|import)\s+["']\.\.\/blocks\/([\w-]+)["']/g),
    ].map((match) => `https://hulianui.haloritual.com/r/block-${match[1]}.json`);

    assert.deepEqual(
      item.registryDependencies,
      [...new Set(installedBlockImports)].sort(),
      item.name,
    );
  }
});

test("全部 77 个组合项都说明安装后的业务接入工作", () => {
  const blockItems = buildCompositeItems(
    join(ROOT, "apps/www/app/blocks/_meta.ts"),
    join(ROOT, "apps/www/app/blocks/_blocks"),
    "block",
  );
  const pageItems = buildCompositeItems(
    join(ROOT, "apps/www/app/pages/_meta.ts"),
    join(ROOT, "apps/www/app/pages/_pages"),
    "page",
  );
  const composites = [...blockItems, ...pageItems];

  assert.equal(composites.length, 77);
  for (const item of composites) {
    assert.ok(item.meta.installation, `${item.name} missing installation metadata`);
    assert.ok(Array.isArray(item.meta.installation.providers));
    assert.ok(Array.isArray(item.meta.installation.replace));
    assert.ok(Array.isArray(item.meta.installation.slots));
  }
});

test("frontmatter 的跨行数组不再被截断", () => {
  const fields = parseFrontmatter(
    [
      "slug: password-generator",
      "name: PasswordGenerator",
      "tags: []",
      "exports:",
      "  [",
      "    PasswordGenerator,",
      "    generatePassword,",
      "    generatePassphrase,",
      "  ]",
      "status: enriched",
    ].join("\n"),
  );

  assert.equal(fields.slug, "password-generator");
  assert.equal(fields.status, "enriched", "数组之后的字段不能被吃掉");
  assert.equal(fields.exports, "[ PasswordGenerator, generatePassword, generatePassphrase, ]");
});

test("frontmatter 支持 YAML 短横线列表", () => {
  const fields = parseFrontmatter(["tags:", "  - animated", "  - webgl", "status: enriched"].join("\n"));
  assert.equal(fields.tags, "[animated, webgl]");
  assert.equal(fields.status, "enriched");
});

test("barrelExports 以 index.ts 为真源，值与类型分开", () => {
  const dir = mkdtempSync(join(tmpdir(), "hulian-barrel-"));
  try {
    writeFileSync(
      join(dir, "index.ts"),
      [
        'export { ThemeProvider } from "./theme-provider";',
        'export { useTheme, THEME_STORAGE_KEY } from "./use-theme";',
        'export type { Theme } from "./use-theme";',
        "export const VERSION = 1;",
        "export function helper() {}",
      ].join("\n"),
    );
    assert.deepEqual(barrelExports(dir), {
      values: ["ThemeProvider", "useTheme", "THEME_STORAGE_KEY", "VERSION", "helper"],
      types: ["Theme"],
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("barrelExports 找不到 barrel 时交还给 frontmatter 兜底", () => {
  const dir = mkdtempSync(join(tmpdir(), "hulian-barrel-none-"));
  try {
    assert.equal(barrelExports(dir), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("发布的 registry 里没有导不进来的 import 占位符", () => {
  const registry = JSON.parse(readFileSync(join(ROOT, "apps/www/public/registry.json"), "utf8"));
  const unresolved = registry.items.filter((item) => item.meta?.import?.includes("/* ?"));
  assert.deepEqual(unresolved.map((item) => item.name), []);
});

test("registry 覆盖 Theme/Access/Config 的全部公开能力", () => {
  const registry = JSON.parse(readFileSync(join(ROOT, "apps/www/public/registry.json"), "utf8"));
  const exportsOf = (name) => registry.items.find((item) => item.name === name)?.meta?.exports ?? [];

  for (const symbol of ["ThemeProvider", "useTheme"]) assert.ok(exportsOf("theme").includes(symbol), symbol);
  for (const symbol of ["AccessProvider", "Access", "useAccess"])
    assert.ok(exportsOf("access").includes(symbol), symbol);
  for (const symbol of ["ConfigProvider", "zhCN", "enUS"]) assert.ok(exportsOf("config").includes(symbol), symbol);
  assert.ok(exportsOf("password-generator").includes("generatePassphrase"));
});
