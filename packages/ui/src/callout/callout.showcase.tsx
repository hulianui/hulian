import type { ShowcaseSpec } from "../showcase/types";
import { Callout } from "./callout";
import type { CalloutTone } from "./callout.types";

const Lightbulb = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

export const calloutShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "长文内联提示：左 accent 竖边 + 极浅底色，标题着 tone 色、正文保持 foreground 可读。",
      code: `<Callout title="Tip" tone="tip">
  区别于 Alert（整块染色的通知横幅），Callout 专为文章 / 文档里的「坑 / 正解 / 提示」设计。
</Callout>`,
      render: () => (
        <div className="w-full max-w-lg">
          <Callout title="Tip" tone="tip">
            区别于 Alert（整块染色的通知横幅），Callout 专为文章 / 文档里的「坑 / 正解 / 提示」设计。
          </Callout>
        </div>
      ),
    },
    {
      title: "语义色调",
      description: "tip / info / warning / success / danger 五种 tone，只染 accent 边与标题。",
      code: `<>
  <Callout tone="warning" title="坑">直接改 node_modules 里的样式，下次安装会丢。</Callout>
  <Callout tone="success" title="正解">用 pnpm patch 固化补丁，随 lockfile 走。</Callout>
  <Callout tone="danger" title="危险">该操作会清空数据库，务必先备份。</Callout>
</>`,
      render: () => (
        <div className="w-full max-w-lg">
          <Callout tone="warning" title="坑">
            直接改 node_modules 里的样式，下次安装会丢。
          </Callout>
          <Callout tone="success" title="正解">
            用 pnpm patch 固化补丁，随 lockfile 走。
          </Callout>
          <Callout tone="danger" title="危险">
            该操作会清空数据库，务必先备份。
          </Callout>
        </div>
      ),
    },
    {
      title: "自定义图标",
      description: "icon 槽随任意 ReactNode，与标题同色。",
      code: `<Callout tone="tip" title="小技巧" icon={<LightbulbIcon />}>
  showcase 文件形状可以直接照抄 score-ring.showcase.tsx。
</Callout>`,
      render: () => (
        <div className="w-full max-w-lg">
          <Callout tone="tip" title="小技巧" icon={Lightbulb}>
            showcase 文件形状可以直接照抄 score-ring.showcase.tsx。
          </Callout>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "tone",
      type: "select",
      options: ["tip", "info", "warning", "success", "danger"],
      defaultValue: "tip",
      label: "色调",
    },
    { prop: "title", type: "text", defaultValue: "Tip", label: "标题" },
  ],
  states: [
    {
      name: "tip",
      render: () => (
        <Callout tone="tip" title="Tip" className="w-full max-w-lg">
          长文内联提示，正文保持 foreground。
        </Callout>
      ),
    },
    {
      name: "warning",
      render: () => (
        <Callout tone="warning" title="坑" className="w-full max-w-lg">
          直接改 node_modules 会在重装后丢失。
        </Callout>
      ),
    },
    {
      name: "success",
      render: () => (
        <Callout tone="success" title="正解" className="w-full max-w-lg">
          用 pnpm patch 固化补丁。
        </Callout>
      ),
    },
    {
      name: "danger",
      render: () => (
        <Callout tone="danger" title="危险" className="w-full max-w-lg">
          该操作不可逆，先备份。
        </Callout>
      ),
    },
    {
      name: "无标题",
      render: () => <Callout tone="info" className="w-full max-w-lg">只有正文的极简形态。</Callout>,
    },
  ],
  renderWithProps: (p) => (
    <Callout tone={p.tone as CalloutTone} title={String(p.title)} className="w-full max-w-lg">
      正文内容保持 foreground 可读，只有标题与 accent 边着 tone 色。
    </Callout>
  ),
  toCode: (p) => `<Callout tone="${p.tone}" title="${p.title}">正文内容</Callout>`,
};
