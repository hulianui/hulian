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
