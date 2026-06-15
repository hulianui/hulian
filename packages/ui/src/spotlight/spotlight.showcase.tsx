import type { ShowcaseSpec } from "../showcase/types";
import { Spotlight } from "./spotlight";

// 背景层需放在 relative 定位容器内（absolute inset-0 铺满父）。Frame 提供舞台。
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid h-48 w-full place-items-center overflow-hidden rounded-xl border border-border bg-bg">
      {children}
      <span className="relative z-10 text-sm font-medium text-foreground">内容叠加其上</span>
    </div>
  );
}

export const spotlightShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "父容器 relative，Spotlight 作背景层，内容以 relative z-10 叠加其上。默认顶部品牌辉光。",
      code: `<div className="relative ...">
  <Spotlight />
  <div className="relative z-10">…内容…</div>
</div>`,
      render: () => (
        <Frame>
          <Spotlight />
        </Frame>
      ),
    },
    {
      title: "辉光位置",
      description: "x/y 定位辉光中心，intensity 调亮度——左上角强辉光即 x=\"20%\"、加大 intensity。",
      code: `<div className="relative ...">
  <Spotlight x="20%" intensity={18} />
  <div className="relative z-10">…内容…</div>
</div>`,
      render: () => (
        <Frame>
          <Spotlight x="20%" intensity={18} />
        </Frame>
      ),
    },
    {
      title: "语义色辉光",
      description: "color 接任意 CSS 颜色/变量，换成成功色即可作正向反馈的 hero/空状态背景。",
      code: `<div className="relative ...">
  <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
  <div className="relative z-10">…内容…</div>
</div>`,
      render: () => (
        <Frame>
          <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
        </Frame>
      ),
    },
    {
      title: "聚拢辉光",
      description: "fade 越小辉光越聚拢——配合居中位置可作弹窗/卡片的局部强调光。",
      code: `<div className="relative ...">
  <Spotlight y="50%" size="80%" intensity={20} fade={40} />
  <div className="relative z-10">…内容…</div>
</div>`,
      render: () => (
        <Frame>
          <Spotlight y="50%" size="80%" intensity={20} fade={40} />
        </Frame>
      ),
    },
  ],
  controls: [
    { prop: "intensity", type: "number", defaultValue: 14, label: "强度" },
    { prop: "fade", type: "number", defaultValue: 55, label: "渐隐" },
  ],
  states: [
    {
      name: "顶部品牌辉光（默认）",
      render: () => (
        <Frame>
          <Spotlight />
        </Frame>
      ),
    },
    {
      name: "左上辉光",
      render: () => (
        <Frame>
          <Spotlight x="20%" intensity={18} />
        </Frame>
      ),
    },
    {
      name: "居中成功色辉光",
      render: () => (
        <Frame>
          <Spotlight color="var(--color-success)" y="50%" size="100%" intensity={16} />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <Spotlight intensity={p.intensity as number} fade={p.fade as number} />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative">
  <Spotlight intensity={${p.intensity}} fade={${p.fade}} />
  <div className="relative z-10">…内容…</div>
</div>`,
};
