import { describe, it, expect } from "vitest";
import {
  ALL_CATEGORY_KEY,
  buildCategoryTree,
  defaultPropsOf,
  matchesCategory,
  parseComponentCatalog,
} from "./component-picker-catalog";
import type { ComponentPickerItem } from "./component-picker.types";

/**
 * 真实语料：逐字摘自 `apps/www/public/llms-full.txt`（前言 + 分区标题 + AspectRatio 整块）。
 * 解析器是照这份真实格式写的，不是照想象定的格式写的。
 */
const REAL_EXCERPT = `# 瑚琏 Hulian (\`@hulianui/ui\`) — 全量组件使用文档

> 颜值 + 好用的 React 设计系统（Base UI + Tailwind v4 + Motion） · v0.25.2 · 376 个组件文档（自包含，供 AI 一次性消费）

安装 \`npm i @hulianui/ui @hulianui/tokens\`（tokens 提供主题 CSS，必装）；默认从根 barrel 导入 \`import { X } from "@hulianui/ui"\`，每个组件也有同名子路径入口 \`@hulianui/ui/<slug>\`，只用少数几个组件时用它可少拉几百个文件。


# ━━━━━━━━ 布局 ━━━━━━━━

<!-- ════════════════════════════════════════════════════════ -->
# AspectRatio

> 比例容器 · CSS aspect-ratio 锁宽高比 + 图片/视频自动铺满(零依赖·RSC) · layout/container

## 何时用

要把图片/视频/卡片锁成固定宽高比（16/9、1/1、4/3）、随宽度自适应高度且不抖动时用。它只锁比例（纯 CSS、可 RSC）；要按容器宽度重排布局用 [Viewport](https://hulianui.haloritual.com/zh/components/viewport)，要把固定设计稿等比缩放铺满用 [FitScreen](https://hulianui.haloritual.com/zh/components/fit-screen)。

## 导入
\`\`\`ts
import { AspectRatio } from "@hulianui/ui"
\`\`\`

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| ratio | \`number\` | \`1\` | 宽高比（宽 / 高），如 \`16/9\`、\`1\`、\`4/3\`。 |

继承 \`HTMLAttributes<HTMLDivElement>\`。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | \`ReactNode\` | 子元素（通常 img/video），自动铺满容器。 |

## 示例
\`\`\`tsx
// 16:9 媒体容器，宽度由外层决定，高度自动
<div className="w-64">
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>
\`\`\`

\`\`\`tsx
// 1:1 头像/缩略图
<div className="w-40">
  <AspectRatio ratio={1}>
    <Fill label="1 / 1" />
  </AspectRatio>
</div>
\`\`\`

## 禁忌 / 坑

- **\`ratio\` 是数字不是字符串**：传 \`16 / 9\` 这种除式或 \`1.7778\`，不要传 \`"16/9"\`。
- **宽度由外层给**：容器宽度自适应父级，高度据 ratio 推导；外层不限宽时会撑满可用宽度。子元素无需自己写 \`w-full h-full\`，组件已让其铺满。

## 相关
[Layout](https://hulianui.haloritual.com/zh/components/layout) · [AdminLayout](https://hulianui.haloritual.com/zh/components/admin-layout) · [ScrollArea](https://hulianui.haloritual.com/zh/components/scroll-area) · [Viewport](https://hulianui.haloritual.com/zh/components/viewport) · [Resizable](https://hulianui.haloritual.com/zh/components/resizable) · [FitScreen](https://hulianui.haloritual.com/zh/components/fit-screen)

<!-- ════════════════════════════════════════════════════════ -->`;

describe("parseComponentCatalog（真实语料）", () => {
  const items = parseComponentCatalog(REAL_EXCERPT);

  it("只解析出组件块，前言块被跳过", () => {
    expect(items).toHaveLength(1);
    expect(items[0]!.name).toBe("AspectRatio");
  });

  it("slug 由名字 kebab 化推导", () => {
    expect(items[0]!.slug).toBe("aspect-ratio");
  });

  it("摘要行尾的 category/group 被剥出来，不留在 description 里", () => {
    expect(items[0]!.category).toBe("layout");
    expect(items[0]!.group).toBe("container");
    expect(items[0]!.description).toContain("比例容器");
    expect(items[0]!.description).not.toContain("layout/container");
  });

  it("Props 表被解析，且没把 Slots 表当成 Props", () => {
    expect(items[0]!.props).toHaveLength(1);
    expect(items[0]!.props![0]!.name).toBe("ratio");
    expect(items[0]!.props![0]!.type).toBe("number");
    expect(items[0]!.props![0]!.default).toBe("1");
    expect(items[0]!.props!.some((p) => p.name === "children")).toBe(false);
  });

  it("示例小节里的两段围栏代码都被收走", () => {
    const examples = items[0]!.examples!;
    expect(examples).toHaveLength(2);
    expect(examples[0]!.lang).toBe("tsx");
    expect(examples[0]!.code).toContain("AspectRatio ratio={16 / 9}");
    expect(examples[1]!.code).toContain("AspectRatio ratio={1}");
  });

  it("导入小节的围栏代码不算示例", () => {
    expect(items[0]!.examples!.every((e) => !e.code.includes("import { AspectRatio }"))).toBe(true);
  });

  it("defaultPropsOf 从文档默认值派生初始 props", () => {
    expect(defaultPropsOf(items[0]!)).toEqual({ ratio: 1 });
  });
});

const SYNTHETIC = [
  "<!-- ════ -->",
  "# ━━━━━━━━ 反馈 ━━━━━━━━",
  "",
  "<!-- ════ -->",
  "# Callout",
  "",
  "> 文章提示框。",
  "",
  "## 何时用",
  "随便写点。",
  "<!-- ════ -->",
  "# Formula",
  "",
  "> 数学排版 · KaTeX 驱动 · typography/text · #animated",
  "",
  "## Props",
  "",
  "| 名称 | 类型 | 默认 | 说明 |",
  "|------|------|------|------|",
  "| children * | `string` | — | 公式源码 |",
  '| mode | `"mixed" \\| "math"` | `"mixed"` | 解析模式 |',
  "| display | `boolean` | `false` | 独占一行 |",
  "| onDone | `() => void` | — | 渲染完成 |",
  "",
  "## 相关",
  "[Formula](https://hulianui.haloritual.com/zh/components/math)",
].join("\n");

describe("parseComponentCatalog（合成语料）", () => {
  const items = parseComponentCatalog(SYNTHETIC);

  it("摘要行没有 category/group 时退到分区标题", () => {
    const callout = items.find((i) => i.name === "Callout")!;
    expect(callout.category).toBe("feedback");
    expect(callout.group).toBe("");
  });

  it("交叉引用链接能修正 kebab 化推不出的 slug", () => {
    expect(items.find((i) => i.name === "Formula")!.slug).toBe("math");
  });

  it("#tag 段被剥成 tags", () => {
    const formula = items.find((i) => i.name === "Formula")!;
    expect(formula.tags).toEqual(["animated"]);
    expect(formula.description).not.toContain("#animated");
  });

  it("名字后的 * 解析成 required", () => {
    const props = items.find((i) => i.name === "Formula")!.props!;
    expect(props[0]).toMatchObject({ name: "children", required: true });
    expect(props[1]!.required).toBeUndefined();
  });

  it("转义管道不劈列", () => {
    expect(items.find((i) => i.name === "Formula")!.props![1]!.type).toBe('"mixed" | "math"');
  });

  it("只认字面量默认值，函数/破折号一律不猜", () => {
    expect(defaultPropsOf(items.find((i) => i.name === "Formula")!)).toEqual({
      mode: "mixed",
      display: false,
    });
  });

  it("无分隔注释时按顶层标题切块", () => {
    const noSeparator = SYNTHETIC.split("\n")
      .filter((l) => !l.startsWith("<!--"))
      .join("\n");
    expect(parseComponentCatalog(noSeparator).map((i) => i.name)).toEqual(["Callout", "Formula"]);
  });

  it("slugOverrides 优先级最高", () => {
    expect(parseComponentCatalog(SYNTHETIC, { slugOverrides: { Formula: "katex" } })
      .find((i) => i.name === "Formula")!.slug).toBe("katex");
  });

  it("空文本不抛异常", () => {
    expect(parseComponentCatalog("")).toEqual([]);
  });
});

const CATALOG: ComponentPickerItem[] = [
  { slug: "input", name: "Input", description: "输入框", category: "forms", group: "basic" },
  { slug: "select", name: "Select", description: "选择器", category: "forms", group: "basic" },
  { slug: "transfer", name: "Transfer", description: "穿梭框", category: "forms", group: "advanced" },
  { slug: "table", name: "Table", description: "表格", category: "data-display", group: "collection" },
  { slug: "access", name: "Access", description: "权限门禁", category: "uncatalogued", group: "" },
];

describe("buildCategoryTree", () => {
  const tree = buildCategoryTree(CATALOG);

  it("单根「全部」+ 总数", () => {
    expect(tree).toHaveLength(1);
    expect(tree[0]!.key).toBe(ALL_CATEGORY_KEY);
    expect(tree[0]!.count).toBe(5);
  });

  it("二级按 category、三级按 group，计数逐层聚合", () => {
    const forms = tree[0]!.children!.find((c) => c.key === "cat:forms")!;
    expect(forms.count).toBe(3);
    expect(forms.children!.map((g) => [g.key, g.count])).toEqual([
      ["cat:forms/group:basic", 2],
      ["cat:forms/group:advanced", 1],
    ]);
  });

  it("group 为空的分类不长出子节点", () => {
    const un = tree[0]!.children!.find((c) => c.key === "cat:uncatalogued")!;
    expect(un.children).toBeUndefined();
  });

  it("顺序按首次出现，不按字母排", () => {
    expect(tree[0]!.children!.map((c) => c.label)).toEqual(["forms", "data-display", "uncatalogued"]);
  });

  it("categoryLabels 换展示名，不改 key", () => {
    const zh = buildCategoryTree(CATALOG, { allLabel: "全部组件", categoryLabels: { forms: "表单" } });
    expect(zh[0]!.label).toBe("全部组件");
    expect(zh[0]!.children![0]!.label).toBe("表单");
    expect(zh[0]!.children![0]!.key).toBe("cat:forms");
  });

  it("空目录只剩一个空的根", () => {
    expect(buildCategoryTree([])).toEqual([
      { key: ALL_CATEGORY_KEY, label: "全部", count: 0, children: [] },
    ]);
  });
});

describe("matchesCategory", () => {
  const input = CATALOG[0]!;
  const transfer = CATALOG[2]!;

  it("空 key / 全部 key 恒真", () => {
    expect(matchesCategory(input, undefined)).toBe(true);
    expect(matchesCategory(input, ALL_CATEGORY_KEY)).toBe(true);
  });

  it("按 category 命中", () => {
    expect(matchesCategory(input, "cat:forms")).toBe(true);
    expect(matchesCategory(input, "cat:data-display")).toBe(false);
  });

  it("按 group 收窄", () => {
    expect(matchesCategory(input, "cat:forms/group:basic")).toBe(true);
    expect(matchesCategory(transfer, "cat:forms/group:basic")).toBe(false);
    expect(matchesCategory(transfer, "cat:forms/group:advanced")).toBe(true);
  });

  it("也接受裸 category 名", () => {
    expect(matchesCategory(input, "forms")).toBe(true);
    expect(matchesCategory(input, "layout")).toBe(false);
  });
});
