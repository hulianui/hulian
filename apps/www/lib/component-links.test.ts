import { describe, expect, it } from "vitest";
import { componentNameInCode, linkifyComponentMentions } from "./component-links";
import { basePathForLocale } from "./docs-locale";
import { manifest } from "./manifest";

// 语言前缀取自 SSOT：英文挂根路径时是空串，语言布局翻转时本文件无需改动。
const EN = basePathForLocale("en");
const ZH = basePathForLocale("zh-CN");

const slugOf = (name: string) => manifest.find((m) => m.name === name)!.slug;

describe("linkifyComponentMentions", () => {
  it("links a component name to its in-site doc page", () => {
    expect(linkifyComponentMentions("修复 Button 的焦点环", "zh-CN")).toBe(
      `修复 [Button](${ZH}/components/${slugOf("Button")}) 的焦点环`,
    );
  });

  it("uses the locale base path", () => {
    expect(linkifyComponentMentions("Button focus ring", "en")).toBe(
      `[Button](${EN}/components/${slugOf("Button")}) focus ring`,
    );
  });

  it("leaves fenced blocks and non-component inline code untouched", () => {
    const md = [
      "给 `deltaPlacement` 加 `font-medium`，Button 不变。",
      "",
      "```tsx",
      'import { Button } from "@hulianui/ui";',
      "```",
    ].join("\n");
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      [
        `给 \`deltaPlacement\` 加 \`font-medium\`，[Button](${ZH}/components/${slugOf("Button")}) 不变。`,
        "",
        "```tsx",
        'import { Button } from "@hulianui/ui";',
        "```",
      ].join("\n"),
    );
  });

  it("links inline code that is exactly a component name, keeping the code formatting", () => {
    // changeset 的规范写法是给组件名加反引号 —— 0.74.0 / 0.74.1 曾因此整版零链接。
    const href = `${ZH}/components/${slugOf("Paper")}`;
    expect(linkifyComponentMentions("`Paper` 与 `<Paper />` 与 `<Paper mode=\"print\">`", "zh-CN")).toBe(
      `[\`Paper\`](${href}) 与 [\`<Paper />\`](${href}) 与 [\`<Paper mode="print">\`](${href})`,
    );
  });

  it("links sub-component exports to their parent component page", () => {
    expect(linkifyComponentMentions("`PaperPresenter` 的演示层", "zh-CN")).toBe(
      `[\`PaperPresenter\`](${ZH}/components/paper) 的演示层`,
    );
  });

  it("does not re-link inline code already inside a Markdown link", () => {
    const md = "[`Paper`](https://example.com)";
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(md);
  });

  it("componentNameInCode only accepts a whole PascalCase name or a JSX tag", () => {
    expect(componentNameInCode("`Paper`")).toBe("Paper");
    expect(componentNameInCode("`</Paper>`")).toBe("Paper");
    expect(componentNameInCode("`Paper.Header`")).toBeNull();
    expect(componentNameInCode("`usePaperMode`")).toBeNull();
    expect(componentNameInCode("`Paper 的 mode`")).toBeNull();
  });

  it("does not rewrite text inside an existing Markdown link", () => {
    const md = "[Button](https://example.com) 与 Button";
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      `[Button](https://example.com) 与 [Button](${ZH}/components/${slugOf("Button")})`,
    );
  });

  it("is case-sensitive and respects word boundaries", () => {
    // 小写是普通词；ButtonGroup / Button 是不同组件 —— 后者不能被前者吞掉，反之亦然。
    const md = "button ButtonGroup 上的 Button";
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      `button [ButtonGroup](${ZH}/components/${slugOf("ButtonGroup")}) 上的 [Button](${ZH}/components/${slugOf("Button")})`,
    );
  });

  it("prefers the longest matching name", () => {
    // MarkdownEditor 含 Markdown 前缀，必须整词链到自己的页面。
    const md = "MarkdownEditor 与 Markdown";
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      `[MarkdownEditor](${ZH}/components/${slugOf("MarkdownEditor")}) 与 [Markdown](${ZH}/components/${slugOf("Markdown")})`,
    );
  });

  it("skips names that are not components in prose", () => {
    // Lightning CSS 是构建工具，不是本库的闪电特效组件。
    expect(linkifyComponentMentions("经 Lightning CSS 降级", "zh-CN")).toBe(
      "经 Lightning CSS 降级",
    );
    // Safari / Chrome 在正文里指浏览器，不指 mockups 里的外壳组件。
    expect(linkifyComponentMentions("补上 Safari 的兜底；在 Chrome 151 实测", "zh-CN")).toBe(
      "补上 Safari 的兜底；在 Chrome 151 实测",
    );
  });

  it("rewrites every occurrence on a line", () => {
    const md = "Card / Dialog / Drawer";
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      ["Card", "Dialog", "Drawer"]
        .map((name) => `[${name}](${ZH}/components/${slugOf(name)})`)
        .join(" / "),
    );
  });

  it("leaves unknown words and plain prose alone", () => {
    expect(linkifyComponentMentions("没有组件名的普通一句话。", "zh-CN")).toBe(
      "没有组件名的普通一句话。",
    );
  });

  it("真实更新日志全量跑完，每条链接都落在 manifest 的组件页上", async () => {
    const { default: changelog } = await import("./changelog.json");
    const slugs = new Set(manifest.map((m) => m.slug));
    const releases = changelog as { entries: { body: string }[] }[];
    let links = 0;

    for (const release of releases) {
      for (const entry of release.entries) {
        const out = linkifyComponentMentions(entry.body, "zh-CN");
        // 坏路径（拼错的 slug、undefined）会让站点多一条悬空链接，门禁或读者才发现。
        expect(out).not.toContain("](" + ZH + "/components/undefined)");
        for (const match of out.matchAll(/\]\((\/zh\/components\/([a-z0-9-]+))\)/g)) {
          links += 1;
          expect(slugs.has(match[2])).toBe(true);
        }
        // 浏览器 / 构建工具的同形词不该被链走。
        expect(out).not.toMatch(/\[(Safari|Chrome|Lightning)\]\(/);
      }
    }

    // 低于这个量说明匹配整体失效（正文里实际有数百处组件名）。
    expect(links).toBeGreaterThan(300);
  });

  // ── liner：更新日志里「写成行内代码的组件名」必须全部链上 ──────────────────────
  // 0.74.0 / 0.74.1 整版零链接，原因是组件名都写在反引号里而链接器一律跳过行内代码。
  // 这条守的是**数据**而不是某个用例：中英两份 changelog 全量跑一遍，任何一处组件导出名
  // 的行内代码在输出里仍是裸代码，就说明链接器又漏了一种写法。
  it.each([
    ["zh-CN", "./changelog.json"],
    ["en", "./changelog.en.json"],
  ] as const)("liner: every component inline-code mention in %s changelog is linked", async (locale, file) => {
    const { default: changelog } = (await import(file)) as {
      default: { version: string; entries: { body: string }[] }[];
    };
    const slugs = new Set(manifest.map((m) => m.slug));
    const missed: string[] = [];
    for (const release of changelog) {
      for (const entry of release.entries) {
        const out = linkifyComponentMentions(entry.body, locale);
        // 去掉围栏块与已链接的片段，剩下的行内代码里不该再有组件名。
        const rest = out
          .replace(/^ {0,3}(`{3,}|~{3,})[\s\S]*?^ {0,3}\1/gm, "")
          .replace(/\[[^\]]*\]\([^)]*\)/g, "");
        for (const [span] of rest.matchAll(/`[^`\n]+`/g)) {
          const name = componentNameInCode(span);
          if (name && manifest.some((m) => m.name === name && slugs.has(m.slug))) {
            missed.push(`${release.version}: ${span}`);
          }
        }
      }
    }
    expect(missed, `这些组件名写在行内代码里却没链上：\n${missed.join("\n")}`).toEqual([]);
  });
});
