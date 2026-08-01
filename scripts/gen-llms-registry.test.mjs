import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildCompositeItems,
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
