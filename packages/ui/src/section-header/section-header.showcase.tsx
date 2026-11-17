import type { ShowcaseSpec } from "../showcase/types";
import { SectionHeader } from "./section-header";
import type { SectionHeaderProps } from "./section-header.types";

export const sectionHeaderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "eyebrow 小字 + 标题 + 主色强调的后半句 + 一段导语，营销页 / 文档首页每个区块开头那一组。",
      code: `<SectionHeader
  eyebrow="产品"
  title="从一个按钮，"
  accent="到一整个后台"
  accentBreak="mobile"
  description="四层粒度、一套设计语言，按需复制。"
/>`,
      render: () => (
        <SectionHeader
          eyebrow="产品"
          title="从一个按钮，"
          accent="到一整个后台"
          accentBreak="mobile"
          description="四层粒度、一套设计语言，按需复制。"
        />
      ),
    },
    {
      title: "居中",
      description: "align=\"center\" 标题与导语一起居中，收尾 CTA、居中的导语段用。",
      code: `<SectionHeader
  align="center"
  eyebrow="设计"
  title="精心设计的默认值，"
  accent="随你改"
  accentBreak="none"
  description="每个组件都带一套能直接上线的默认外观。"
/>`,
      render: () => (
        <SectionHeader
          align="center"
          eyebrow="设计"
          title="精心设计的默认值，"
          accent="随你改"
          accentBreak="none"
          description="每个组件都带一套能直接上线的默认外观。"
        />
      ),
    },
    {
      title: "强调半句换行",
      description: "accentBreak 决定标题与强调半句怎么接：always 换行、mobile 只在窄屏换行、space 空一格（英文）、none 直接相连。",
      code: `<SectionHeader eyebrow="AI native" title="Your AI assistant," accent="fluent in your UI kit" />
<SectionHeader eyebrow="In production" title="Built natively" accent="on Hulian UI" accentBreak="space" />`,
      render: () => (
        <div className="space-y-10">
          <SectionHeader eyebrow="AI native" title="Your AI assistant," accent="fluent in your UI kit" />
          <SectionHeader
            eyebrow="In production"
            title="Built natively"
            accent="on Hulian UI"
            accentBreak="space"
          />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "accentBreak",
      type: "select",
      options: ["always", "mobile", "space", "none"],
      defaultValue: "always",
    },
    { prop: "align", type: "select", options: ["start", "center"], defaultValue: "start" },
  ],
  states: [
    {
      name: "左对齐",
      render: () => <SectionHeader eyebrow="产品" title="从一个按钮，" accent="到一整个后台" />,
    },
    {
      name: "居中",
      render: () => (
        <SectionHeader align="center" title="现在开始，" accent="做好看又好用的软件" accentBreak="none" />
      ),
    },
  ],
  renderWithProps: (p) => (
    <SectionHeader
      eyebrow="产品"
      title="从一个按钮，"
      accent="到一整个后台"
      accentBreak={p.accentBreak as SectionHeaderProps["accentBreak"]}
      align={p.align as SectionHeaderProps["align"]}
      description="四层粒度、一套设计语言，按需复制。"
    />
  ),
  toCode: (p) => `<SectionHeader
  eyebrow="产品"
  title="从一个按钮，"
  accent="到一整个后台"
  accentBreak="${p.accentBreak}"
  align="${p.align}"
  description="四层粒度、一套设计语言，按需复制。"
/>`,
};
