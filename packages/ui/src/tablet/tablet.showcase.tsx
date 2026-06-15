import type { ShowcaseSpec } from "../showcase/types";
import { Tablet } from "./tablet";
import type { TabletModel } from "./tablet.types";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-chart-3/30 to-chart-1/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted">平板屏</span>
    </div>
  );
}

export const tabletShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "iPad 系平板外壳包裹屏幕内容，默认机型 iPad Pro 11。",
      code: `<Tablet>
  <img src="/app.png" alt="" />
</Tablet>`,
      render: () => (
        <Tablet>
          <Screen />
        </Tablet>
      ),
    },
    {
      title: "选择机型",
      description: "model 切换预设机型，决定默认宽度与机身比例。",
      code: `<Tablet model="ipad-pro-13">
  <img src="/app.png" alt="" />
</Tablet>`,
      render: () => (
        <Tablet model="ipad-pro-13">
          <Screen />
        </Tablet>
      ),
    },
    {
      title: "自定义宽度",
      description: "width 显式传入时优先覆盖机型预设宽度（机身比例仍随机型）。",
      code: `<Tablet model="ipad-mini" width={200}>
  <img src="/app.png" alt="" />
</Tablet>`,
      render: () => (
        <Tablet model="ipad-mini" width={200}>
          <Screen />
        </Tablet>
      ),
    },
    {
      title: "图片内容",
      description: "传 imageSrc 直接渲染 App 截图（优先于 children）。",
      code: `<Tablet model="ipad-pro-11" imageSrc="/app.png" />`,
      render: () => (
        <Tablet model="ipad-pro-11">
          <Screen />
        </Tablet>
      ),
    },
  ],
  controls: [
    {
      prop: "model",
      type: "select",
      options: ["ipad-pro-13", "ipad-pro-11", "ipad-air-11", "ipad-10", "ipad-mini"],
      defaultValue: "ipad-pro-11",
      label: "机型",
    },
  ],
  states: [
    {
      name: "iPad Pro 11（默认）",
      render: () => (
        <Tablet model="ipad-pro-11">
          <Screen />
        </Tablet>
      ),
    },
    {
      name: "iPad Pro 13（最大）",
      render: () => (
        <Tablet model="ipad-pro-13">
          <Screen />
        </Tablet>
      ),
    },
    {
      name: "iPad mini（最小/最窄）",
      render: () => (
        <Tablet model="ipad-mini">
          <Screen />
        </Tablet>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Tablet model={p.model as TabletModel}>
      <Screen />
    </Tablet>
  ),
  toCode: (p) => `<Tablet model="${p.model}">\n  <img src="/app.png" />\n</Tablet>`,
};
