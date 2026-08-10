import type { ShowcaseSpec } from "../showcase/types";
import { LineShadowText } from "./line-shadow-text";

export const lineShadowTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "静态斜线投影，默认吃 --color-foreground，明暗主题都成立。",
      code: `<LineShadowText className="text-5xl font-bold">瑚琏</LineShadowText>`,
      render: () => <LineShadowText className="text-5xl font-bold">瑚琏</LineShadowText>,
    },
    {
      title: "投影色",
      description: "shadowColor 接受任意 CSS 颜色；喂 token 要带 --color- 前缀。",
      code: `<LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
  Hulian
</LineShadowText>`,
      render: () => (
        <LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
          Hulian
        </LineShadowText>
      ),
    },
    {
      title: "斜线粗细与偏移",
      description: "lineWidth 调条纹密度，offset 调投影距离；两者都用 em，随字号成比例。",
      code: `<LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
  Bold
</LineShadowText>`,
      render: () => (
        <LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
          Bold
        </LineShadowText>
      ),
    },
    {
      title: "流动（可选）",
      description:
        "animated 让斜线沿对角缓慢走。默认关闭：这一档的定位就是文字特效里最克制的那个，打印页 / 企业官网也能用。开了仍尊重 prefers-reduced-motion。",
      code: `<LineShadowText className="text-5xl font-bold" animated duration="8s">
  Motion
</LineShadowText>`,
      render: () => (
        <LineShadowText className="text-5xl font-bold" animated duration="8s">
          Motion
        </LineShadowText>
      ),
    },
    {
      title: "首屏标题里点缀品牌词",
      description: "只给 2–4 字的品牌词加投影，其余文字保持常规排版。",
      code: `<h1 className="text-4xl font-bold text-foreground">
  <LineShadowText shadowColor="var(--color-primary)">瑚琏</LineShadowText> 中后台组件库
</h1>`,
      render: () => (
        <h1 className="text-4xl font-bold text-foreground">
          <LineShadowText shadowColor="var(--color-primary)">瑚琏</LineShadowText> 中后台组件库
        </h1>
      ),
    },
  ],
  controls: [
    { prop: "offset", type: "text", defaultValue: "0.04em", label: "偏移" },
    { prop: "lineWidth", type: "text", defaultValue: "0.06em", label: "斜线粗细" },
    { prop: "animated", type: "boolean", defaultValue: false, label: "流动" },
  ],
  states: [
    {
      name: "default（静态）",
      render: () => <LineShadowText className="text-5xl font-bold">瑚琏</LineShadowText>,
    },
    {
      name: "主色投影",
      render: () => (
        <LineShadowText className="text-5xl font-bold" shadowColor="var(--color-primary)">
          Hulian
        </LineShadowText>
      ),
    },
    {
      name: "粗斜线",
      render: () => (
        <LineShadowText className="text-5xl font-bold" lineWidth="0.12em" offset="0.08em">
          Bold
        </LineShadowText>
      ),
    },
    {
      name: "流动",
      render: () => (
        <LineShadowText className="text-5xl font-bold" animated duration="8s">
          Motion
        </LineShadowText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <LineShadowText
      className="text-5xl font-bold"
      offset={p.offset as string}
      lineWidth={p.lineWidth as string}
      animated={p.animated as boolean}
    >
      瑚琏
    </LineShadowText>
  ),
  toCode: (p) =>
    `<LineShadowText offset="${p.offset}" lineWidth="${p.lineWidth}"${
      p.animated ? " animated" : ""
    }>瑚琏</LineShadowText>`,
};
