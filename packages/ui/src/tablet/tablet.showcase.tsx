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
