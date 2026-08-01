import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadComponentDoc, loadComponentMarkdownForCopy, resolveMd } from "./load-component-doc";

const fixtures: string[] = [];

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "hulian-load-component-doc-"));
  fixtures.push(root);
  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = join(root, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  }
  return root;
}

afterEach(() => {
  while (fixtures.length) rmSync(fixtures.pop()!, { recursive: true, force: true });
});

const doc = (slug: string, body = `# ${slug}\n`) =>
  `---\nslug: ${slug}\nname: ${slug}\nstatus: enriched\n---\n\n${body}`;

describe("localized component Markdown resolution", () => {
  it("selects the requested locale in normal and _mui layouts", () => {
    const root = fixture({
      "button/button.md": doc("button", "# 中文 Button\n"),
      "button/button.en.md": doc("button", "# English Button\n"),
      "_mui/date-picker.md": doc("date-picker", "# 中文 DatePicker\n"),
      "_mui/date-picker.en.md": doc("date-picker", "# English DatePicker\n"),
    });

    expect(resolveMd("button", "zh-CN", [root])).toBe(join(root, "button/button.md"));
    expect(resolveMd("button", "en", [root])).toBe(join(root, "button/button.en.md"));
    expect(resolveMd("date-picker", "en", [root])).toBe(join(root, "_mui/date-picker.en.md"));
  });

  it("throws an actionable English error instead of falling back to Chinese", () => {
    const root = fixture({ "button/button.md": doc("button") });

    expect(() => resolveMd("button", "en", [root])).toThrowError(
      new RegExp(
        `button.*${join(root, "button/button.en.md").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      ),
    );
  });

  it("adds /en to rendered links and absolute copied links", () => {
    const root = fixture({
      "button/button.en.md": doc(
        "button",
        [
          "# Button",
          "",
          "> English button",
          "",
          "## When to use",
          "See [Input](../input/input.md), [Start](/start), and [Docs](https://hulianui.haloritual.com/components/card).",
          "",
          "## Examples",
          "static example",
          "",
          "## API",
          "Details.",
        ].join("\n"),
      ),
    });

    expect(loadComponentDoc("button", "en", [root])).toContain("[Input](/en/components/input)");
    expect(loadComponentDoc("button", "en", [root])).toContain("[Start](/en/start)");
    expect(loadComponentDoc("button", "en", [root])).not.toContain("static example");

    const copied = loadComponentMarkdownForCopy("button", "en", [root])!;
    expect(copied).toContain("[Input](https://hulianui.haloritual.com/en/components/input)");
    expect(copied).toContain("[Start](https://hulianui.haloritual.com/en/start)");
    expect(copied).toContain("[Docs](https://hulianui.haloritual.com/en/components/card)");
    expect(copied).toContain("This is documentation for a single component");
  });

  it("leaves protocol-relative URLs, fenced code, and inline code spans untouched", () => {
    const markdown = [
      "# Button",
      "",
      "[Related](../input/input.md)",
      "[CDN](//cdn.example.com/asset)",
      "`[Inline](/components/inline)`",
      "",
      "```md",
      "[Fenced](/components/fenced)",
      "[Fenced relative](../fenced/fenced.md)",
      "```",
    ].join("\n");
    const root = fixture({ "button/button.en.md": doc("button", markdown) });

    const rendered = loadComponentDoc("button", "en", [root])!;
    expect(rendered).toContain("[Related](/en/components/input)");
    expect(rendered).toContain("[CDN](//cdn.example.com/asset)");
    expect(rendered).toContain("`[Inline](/components/inline)`");
    expect(rendered).toContain("[Fenced](/components/fenced)");
    expect(rendered).toContain("[Fenced relative](../fenced/fenced.md)");
  });

  it("preserves links inside multiline code spans with matching backtick runs", () => {
    const markdown = [
      "# Button",
      "",
      "``code span starts with ` inside",
      "[Hidden](/components/hidden)",
      "and closes here``",
      "[Visible](/components/visible)",
    ].join("\n");
    const root = fixture({ "button/button.en.md": doc("button", markdown) });

    const rendered = loadComponentDoc("button", "en", [root])!;
    expect(rendered).toContain("[Hidden](/components/hidden)");
    expect(rendered).toContain("[Visible](/en/components/visible)");
  });

  it("does not let an unmatched inline delimiter consume the next fenced block", () => {
    const markdown = [
      "# Button",
      "",
      "Unmatched ``` in ordinary text.",
      "```md",
      "[Fenced](../fenced/fenced.md)",
      "```",
      "[Visible](../visible/visible.md)",
    ].join("\n");
    const root = fixture({ "button/button.en.md": doc("button", markdown) });

    const rendered = loadComponentDoc("button", "en", [root])!;
    expect(rendered).toContain("[Fenced](../fenced/fenced.md)");
    expect(rendered).toContain("[Visible](/en/components/visible)");
  });
});
