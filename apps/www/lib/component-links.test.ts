import { describe, expect, it } from "vitest";
import { linkifyComponentMentions } from "./component-links";
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

  it("leaves inline code and fenced blocks untouched", () => {
    const md = [
      "把 `Button` 换成 Button。",
      "",
      "```tsx",
      'import { Button } from "@hulianui/ui";',
      "```",
    ].join("\n");
    expect(linkifyComponentMentions(md, "zh-CN")).toBe(
      [
        `把 \`Button\` 换成 [Button](${ZH}/components/${slugOf("Button")})。`,
        "",
        "```tsx",
        'import { Button } from "@hulianui/ui";',
        "```",
      ].join("\n"),
    );
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
});
