"use client";
import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { InspectorPanel } from "./inspector-panel";
import { MIXED } from "./inspector-schema";
import type { InspectorSection, InspectorToken } from "./inspector-panel.types";

const tokens: InspectorToken[] = [
  { token: "color-foreground", label: "主文字", group: "text" },
  { token: "color-muted", label: "次要文字", group: "text" },
  { token: "color-primary", label: "主色", group: "text" },
  { token: "color-surface", label: "卡片表面", group: "surface" },
  { token: "color-surface-hover", label: "表面悬停", group: "surface" },
  { token: "color-bg", label: "页面底", group: "surface" },
  { token: "color-border", label: "边框", group: "border" },
];

const initialStyle: Record<string, unknown> = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: "24px",
  paddingRight: "24px",
  paddingBottom: "24px",
  paddingLeft: "24px",
  fontSize: "16px",
  fontWeight: "600",
  color: "var(--color-primary)",
  backgroundColor: "var(--color-surface-hover)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--color-border)",
  borderRadius: "12px",
  opacity: 1,
};

function LiveDemo({ categories }: { categories?: string[] }) {
  const [style, setStyle] = useState(initialStyle);
  // 必须 useCallback：内联箭头每轮都是新引用，InspectorPanel 的 memo 就 bail 不掉，
  // 父级稳定更新时整块面板会白重算一遍（运行时性能门禁记为 avoidable-render）。
  // 四值同步会在同一 tick 连发 4 次，必须函数式更新，否则后三次被覆盖。
  const onChange = useCallback(
    (path: string, value: unknown) => setStyle((previous) => ({ ...previous, [path]: value })),
    [],
  );
  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      <div className="grid min-h-40 flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border p-4">
        {/* 预览盒的样式完全来自面板回吐的属性表，所以只能内联注入。 */}
        <div style={style as CSSProperties}>选中的元素</div>
      </div>
      <div className="w-full shrink-0 sm:w-72">
        <InspectorPanel
          selectedElement="Card / Title"
          props={style}
          tokenSource={tokens}
          categories={categories}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

const businessSchema: InspectorSection[] = [
  {
    id: "meta",
    label: "内容",
    fields: [
      { key: "headline", label: "标题", kind: "text", placeholder: "输入标题" },
      { key: "badge", label: "角标", kind: "text" },
      { key: "featured", label: "置顶", kind: "toggle" },
    ],
  },
  {
    id: "behavior",
    label: "行为",
    fields: [
      {
        key: "target",
        label: "跳转方式",
        kind: "enum",
        options: [
          { value: "self", label: "当前页" },
          { value: "blank", label: "新窗口" },
        ],
      },
      { key: "weight", label: "权重", kind: "number", min: 0, max: 999, hint: "越大越靠前" },
      { key: "ratio", label: "占比", kind: "length", min: 0, max: 1, step: 0.05 },
    ],
  },
];

function BusinessDemo() {
  const [values, setValues] = useState<Record<string, unknown>>({
    headline: "夏季新品",
    featured: true,
    target: "blank",
    weight: 120,
    ratio: 0.35,
  });
  return (
    <div className="w-full max-w-xs">
      <InspectorPanel
        title="卡片配置"
        sections={businessSchema}
        props={values}
        onChange={(path, value) => setValues((previous) => ({ ...previous, [path]: value }))}
      />
    </div>
  );
}

function MixedDemo() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-xs">
        <InspectorPanel
          selectedElement="3 个元素"
          commitMode="commit"
          categories={["typography", "effects"]}
          props={{ fontSize: MIXED, fontWeight: MIXED, textAlign: "left", opacity: MIXED }}
          onChange={(path, value) =>
            setLog((previous) => [`${path} = ${String(value)}`, ...previous].slice(0, 4))
          }
        />
      </div>
      <ul className="space-y-1 font-mono text-xs text-muted-foreground">
        {log.length === 0 ? (
          <li>松手 / 失焦后才会看到回吐</li>
        ) : (
          log.map((line, index) => <li key={index}>{line}</li>)
        )}
      </ul>
    </div>
  );
}

export const inspectorPanelShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "内置 5 类预设 schema + 主题 token 绑定，改动实时回吐到预览盒。",
      code: `const [style, setStyle] = useState(initialStyle);

<InspectorPanel
  selectedElement="Card / Title"
  props={style}
  tokenSource={tokens}
  onChange={(path, value) => setStyle((prev) => ({ ...prev, [path]: value }))}
/>`,
      render: () => <LiveDemo />,
    },
    {
      title: "自定义 schema（不止 CSS）",
      description: "sections 换成业务属性，面板本身不认识任何具体属性，只按 kind 派生控件。",
      code: `<InspectorPanel
  title="卡片配置"
  sections={[
    {
      id: "meta",
      label: "内容",
      fields: [
        { key: "headline", label: "标题", kind: "text" },
        { key: "featured", label: "置顶", kind: "toggle" },
      ],
    },
  ]}
  props={values}
  onChange={(path, value) => setValues((prev) => ({ ...prev, [path]: value }))}
/>`,
      render: () => <BusinessDemo />,
    },
    {
      title: "多选混合值 + 松手才回吐",
      description:
        '取值不一致的属性传 MIXED 显示「多个值」；commitMode="commit" 让拖动/输入过程不回吐。',
      code: `<InspectorPanel
  selectedElement="3 个元素"
  commitMode="commit"
  categories={["typography", "effects"]}
  props={{ fontSize: MIXED, fontWeight: MIXED, opacity: MIXED }}
  onChange={(path, value) => apply(path, value)}
/>`,
      render: () => <MixedDemo />,
    },
    {
      title: "只取部分分类",
      description: "categories 决定内置预设的取用与顺序，未知 id 忽略。",
      code: `<InspectorPanel categories={["layout", "border"]} props={style} onChange={onChange} />`,
      render: () => <LiveDemo categories={["layout", "border"]} />,
    },
  ],
  controls: [],
  states: [
    { name: "样式检查器（含 token 色板）", render: () => <LiveDemo /> },
    { name: "业务属性 schema", render: () => <BusinessDemo /> },
    { name: "混合值 + commit 模式", render: () => <MixedDemo /> },
    {
      name: "空态（未选中元素）",
      render: () => (
        <div className="w-full max-w-xs">
          <InspectorPanel selectedElement={null} onChange={() => {}} />
        </div>
      ),
    },
  ],
  renderWithProps: () => <LiveDemo />,
  toCode: () =>
    `<InspectorPanel selectedElement="Card / Title" props={style} tokenSource={tokens} onChange={(path, value) => …} />`,
};
