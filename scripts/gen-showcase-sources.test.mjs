import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { generateShowcaseSources, translateShowcaseModule } from "./gen-showcase-sources.mjs";

test("translation preserves executable behavior while localizing every AST text form", () => {
  const source = `
    import type { ShowcaseSpec } from "../showcase/types";
    import { Button } from "./button";
    const prefix = "状态";
    function LocalDemo() {
      const [count, setCount] = useState(0);
      return <Button data-value="stable-api" onClick={() => setCount((n) => n + 1)}>
        点了 {count} 次
      </Button>;
    }
    export const buttonShowcase: ShowcaseSpec = {
      examples: [{ title: "基础用法", description: \`当前状态：\${prefix}，共 \${2} 项\`, code: "<Button>保存</Button>", render: () => <LocalDemo /> }],
      controls: [{ prop: "variant", type: "select", options: ["solid", "outline"], defaultValue: "solid" }],
      toCode: (p) => \`<Button variant="\${p.variant}">保存</Button>\`,
    };
  `;

  const result = translateShowcaseModule(source, {
    sourceFile: "packages/ui/src/button/button.showcase.tsx",
    outputFile: "apps/www/generated/showcase-en/button.showcase.tsx",
    copy: {
      exact: {
        状态: "status",
        点了: "Clicked",
        次: "times",
        基础用法: "Basic usage",
        "当前状态：": "Current status: ",
        "，共": ", with ",
        项: "items",
        "<Button>保存</Button>": "<Button>Save</Button>",
        '">保存</Button>': '">Save</Button>',
      },
      files: {},
    },
  });

  assert.match(result.code, /from "\.\.\/\.\.\/\.\.\/\.\.\/packages\/ui\/src\/showcase\/types"/);
  assert.match(result.code, /from "\.\.\/\.\.\/\.\.\/\.\.\/packages\/ui\/src\/button\/button"/);
  assert.match(result.code, /onClick=\{\(\) => setCount\(\(n\) => n \+ 1\)\}/);
  assert.match(result.code, /data-value="stable-api"/);
  assert.match(result.code, /Clicked \{count\} times/);
  assert.match(result.code, /`Current status: \$\{prefix\}, with \$\{2\} items`/);
  assert.match(result.code, /toCode: \(p\) => `<Button variant="\$\{p\.variant\}">Save<\/Button>`/);
  assert.doesNotMatch(result.code, /[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]/u);
  assert.deepEqual(result.usage, { exact: 5, file: 0, fallback: 4 });
});

test("file overrides beat global copy and normalized global keys are an explicit fallback", () => {
  const result = translateShowcaseModule(
    `export const demo = <>  保存设置  <span>个人   资料</span></>;`,
    {
      sourceFile: "packages/ui/src/profile/profile.showcase.tsx",
      outputFile: "apps/www/generated/showcase-en/profile.showcase.tsx",
      copy: {
        exact: { 保存设置: "Save settings", "个人 资料": "Profile" },
        files: {
          "packages/ui/src/profile/profile.showcase.tsx": { 保存设置: "Save profile" },
        },
      },
    },
  );

  assert.match(result.code, />  Save profile  <span>Profile<\/span>/);
  assert.deepEqual(result.usage, { exact: 0, file: 1, fallback: 1 });
});

test("translation fails closed when a rendered literal has no English copy", () => {
  assert.throws(
    () =>
      translateShowcaseModule(`export const Demo = () => <button>保存</button>;`, {
        sourceFile: "packages/ui/src/button/button.showcase.tsx",
        outputFile: "apps/www/generated/showcase-en/button.showcase.tsx",
        copy: { exact: {}, files: {} },
      }),
    /missing English copy.*button\.showcase\.tsx.*保存/,
  );
});

test("translation rejects empty or residue-bearing English copy before generation", () => {
  const options = {
    sourceFile: "packages/ui/src/button/button.showcase.tsx",
    outputFile: "apps/www/generated/showcase-en/button.showcase.tsx",
  };
  assert.throws(
    () =>
      translateShowcaseModule(`export const title = "按钮";`, {
        ...options,
        copy: { exact: { 按钮: "  " }, files: {} },
      }),
    /must be non-empty English/,
  );
  assert.throws(
    () =>
      translateShowcaseModule(`export const title = "按钮";`, {
        ...options,
        copy: { exact: { 按钮: "Button：按钮" }, files: {} },
      }),
    /must be non-empty English/,
  );
});

test("translation resolves multiline copy line by line without collapsing layout", () => {
  const result = translateShowcaseModule(
    `export const message = \`\n  第一行\n    第二   行\n\`;`,
    {
      sourceFile: "packages/ui/src/message/message.showcase.tsx",
      outputFile: "apps/www/generated/showcase-en/message.showcase.tsx",
      copy: { exact: { 第一行: "First line", "第二 行": "Second line" }, files: {} },
    },
  );

  assert.match(result.code, /`\n  First line\n    Second line\n`/);
  assert.deepEqual(result.usage, { exact: 0, file: 0, fallback: 2 });
});

test("translation rewrites static exports and dynamic imports back to package source", () => {
  const result = translateShowcaseModule(
    `export { Button } from "./button"; export const load = () => import("../tag/tag");`,
    {
      sourceFile: "packages/ui/src/button/button.showcase.tsx",
      outputFile: "apps/www/generated/showcase-en/button.showcase.tsx",
      copy: { exact: {}, files: {} },
    },
  );

  assert.match(result.code, /from "\.\.\/\.\.\/\.\.\/\.\.\/packages\/ui\/src\/button\/button"/);
  assert.match(result.code, /import\("\.\.\/\.\.\/\.\.\/\.\.\/packages\/ui\/src\/tag\/tag"\)/);
});

test("generation writes one equivalent module per source plus a deterministic barrel", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-showcase-source-"));
  const sourceRoot = join(root, "packages/ui/src");
  const outputRoot = join(root, "apps/www/generated/showcase-en");
  mkdirSync(join(sourceRoot, "button"), { recursive: true });
  mkdirSync(join(sourceRoot, "tag"), { recursive: true });
  writeFileSync(
    join(sourceRoot, "button/button.showcase.tsx"),
    `import { Button } from "./button"; export const buttonShowcase = { title: "按钮", render: () => <Button /> };\n`,
  );
  writeFileSync(
    join(sourceRoot, "tag/tag.showcase.tsx"),
    `export const tagShowcase = { title: "标签" };\n`,
  );

  const report = generateShowcaseSources({
    repoRoot: root,
    sourceRoot,
    outputRoot,
    copy: { exact: { 按钮: "Button", 标签: "Tag" }, files: {} },
  });

  assert.equal(report.modules, 2);
  const button = readFileSync(join(outputRoot, "button.showcase.tsx"), "utf8");
  assert.equal(button.includes('"Button"'), true);
  assert.match(button, /from "\.\.\/\.\.\/\.\.\/\.\.\/packages\/ui\/src\/button\/button"/);
  assert.equal(readFileSync(join(outputRoot, "tag.showcase.tsx"), "utf8").includes('"Tag"'), true);
  assert.equal(
    readFileSync(join(outputRoot, "index.ts"), "utf8"),
    'export * from "./button.showcase";\nexport * from "./tag.showcase";\n',
  );
});

test("check mode rejects stale, missing, or changed generated artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-showcase-check-"));
  const sourceRoot = join(root, "packages/ui/src");
  const outputRoot = join(root, "apps/www/generated/showcase-en");
  mkdirSync(join(sourceRoot, "button"), { recursive: true });
  mkdirSync(outputRoot, { recursive: true });
  writeFileSync(
    join(sourceRoot, "button/button.showcase.tsx"),
    `export const buttonShowcase = { title: "按钮" };\n`,
  );
  writeFileSync(join(outputRoot, "removed.showcase.tsx"), "export const stale = true;\n");

  assert.throws(
    () =>
      generateShowcaseSources({
        repoRoot: root,
        sourceRoot,
        outputRoot,
        copy: { exact: { 按钮: "Button" }, files: {} },
        check: true,
      }),
    /stale.*removed\.showcase\.tsx.*missing.*button\.showcase\.tsx.*missing.*index\.ts/s,
  );
  assert.equal(existsSync(join(outputRoot, "removed.showcase.tsx")), true);
});

test("generation rejects unused global and file-scoped copy", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-showcase-unused-"));
  const sourceRoot = join(root, "packages/ui/src");
  const outputRoot = join(root, "apps/www/generated/showcase-en");
  mkdirSync(join(sourceRoot, "button"), { recursive: true });
  writeFileSync(
    join(sourceRoot, "button/button.showcase.tsx"),
    `export const buttonShowcase = { title: "按钮" };\n`,
  );

  assert.throws(
    () =>
      generateShowcaseSources({
        repoRoot: root,
        sourceRoot,
        outputRoot,
        copy: {
          exact: { 按钮: "Button", 未使用: "Unused" },
          files: {
            "packages/ui/src/button/button.showcase.tsx": { 也未使用: "Also unused" },
          },
        },
      }),
    /unused English copy.*未使用.*button\.showcase\.tsx.*也未使用/s,
  );
});
