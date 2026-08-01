import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkComponentDocTranslations,
  formatDiagnostics,
} from "./check-component-doc-translations.mjs";
import { absolutize, collectDocs } from "./gen-llms-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function writeFixture(root, files) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = join(root, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  }
}

function withFixture(files, run) {
  const root = mkdtempSync(join(tmpdir(), "hulian-component-i18n-"));
  try {
    writeFixture(root, files);
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const manifest = [
  { slug: "button", category: "forms" },
  { slug: "date-picker", category: "forms" },
  { slug: "stack", category: "layout" },
];

const frontmatter = (slug, body = `# ${slug}\n`) =>
  `---\nslug: ${slug}\nname: ${slug}\nstatus: enriched\n---\n\n${body}`;

test("normal and _mui documents require exact Chinese/English pairs", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "button/button.en.md": frontmatter("button"),
      "_mui/date-picker.md": frontmatter("date-picker"),
      "_mui/date-picker.en.md": frontmatter("date-picker"),
    },
    (uiSrc) => {
      assert.deepEqual(
        checkComponentDocTranslations({ uiSrc, manifest, categories: ["forms"] }),
        [],
      );
    },
  );
});

test("missing translations report the slug and exact normal/_mui path", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "_mui/date-picker.md": frontmatter("date-picker"),
    },
    (uiSrc) => {
      const output = formatDiagnostics(
        checkComponentDocTranslations({ uiSrc, manifest, categories: ["forms"] }),
      );
      assert.match(output, /button\/button\.en\.md.*button/);
      assert.match(output, /_mui\/date-picker\.en\.md.*date-picker/);
    },
  );
});

test("English CJK is allowed only in fenced code or an explicit proper-noun marker", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "button/button.en.md": frontmatter(
        "button",
        [
          "# Button",
          "",
          "Visible 中文 must fail.",
          "",
          "```tsx",
          'const label = "代码中文";',
          "```",
          "",
          "<span data-i18n-allow-cjk>瑚琏</span> (Hulian)",
          "",
          "Inline `行内中文` must fail too.",
          "",
          "Another 未翻译 phrase must also fail.",
        ].join("\n"),
      ),
    },
    (uiSrc) => {
      const diagnostics = checkComponentDocTranslations({
        uiSrc,
        manifest,
        categories: ["forms"],
      });
      const cjk = diagnostics.filter((diagnostic) => diagnostic.code === "cjk");
      assert.equal(cjk.length, 3);
      assert.equal(cjk[0].line, 9);
      assert.equal(cjk[1].line, 17);
      assert.equal(cjk[2].line, 19);
      assert.ok(cjk[0].column > 1);
      assert.match(formatDiagnostics(cjk), /button\.en\.md:9:\d+.*CJK/);
    },
  );
});

test("frontmatter drift and broken related slugs are executable diagnostics", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "button/button.en.md": frontmatter(
        "wrong-button",
        "# Button\n\n[Missing](../ghost/ghost.md)\n",
      ),
    },
    (uiSrc) => {
      const output = formatDiagnostics(
        checkComponentDocTranslations({ uiSrc, manifest, categories: ["forms"] }),
      );
      assert.match(output, /button\.en\.md:\d+:\d+.*frontmatter.*wrong-button.*button/i);
      assert.match(output, /button\.en\.md:\d+:\d+.*related.*ghost/i);
    },
  );
});

test("category selection excludes documents outside the requested categories", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "button/button.en.md": frontmatter("button"),
      "_mui/date-picker.md": frontmatter("date-picker"),
      "_mui/date-picker.en.md": frontmatter("date-picker"),
      "stack/stack.md": frontmatter("stack"),
    },
    (uiSrc) => {
      assert.deepEqual(
        checkComponentDocTranslations({ uiSrc, manifest, categories: ["forms"] }),
        [],
      );
    },
  );
});

test("registry document collection ignores .en.md as a second _mui component", () => {
  withFixture(
    {
      "button/button.md": frontmatter("button"),
      "button/button.en.md": frontmatter("button"),
      "_mui/date-picker.md": frontmatter("date-picker"),
      "_mui/date-picker.en.md": frontmatter("date-picker"),
    },
    (uiSrc) => {
      assert.deepEqual(
        collectDocs(uiSrc)
          .map((doc) => doc.slug)
          .sort(),
        ["button", "date-picker"],
      );
    },
  );
});

test("registry link rewriting rejects protocol-relative URLs and protects Markdown code", () => {
  const markdown = [
    "[Related](../input/input.md)",
    "[CDN](//cdn.example.com/asset)",
    "`[Inline](/components/inline)`",
    "```md",
    "[Fenced](/components/fenced)",
    "```",
  ].join("\n");

  const rewritten = absolutize(markdown);
  assert.match(rewritten, /\[Related\]\(https:\/\/hulianui\.haloritual\.com\/components\/input\)/);
  assert.match(rewritten, /\[CDN\]\(\/\/cdn\.example\.com\/asset\)/);
  assert.match(rewritten, /`\[Inline\]\(\/components\/inline\)`/);
  assert.match(rewritten, /\[Fenced\]\(\/components\/fenced\)/);
});

test("Chinese scaffolding never targets the sibling .en.md document", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/gen-component-docs.mjs", "--only=button", "--force", "--dry"],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /packages\/ui\/src\/button\/button\.md/);
  assert.doesNotMatch(result.stdout, /button\.en\.md/);
});
