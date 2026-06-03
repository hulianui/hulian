import type { ShowcaseSpec } from "../showcase/types";
import { Android } from "./android";
import type { AndroidModel } from "./android.types";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-2/30 to-chart-4/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted">Android 屏</span>
    </div>
  );
}

export const androidShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "model",
      type: "select",
      options: ["pixel-9-pro-xl", "pixel-9-pro", "pixel-9", "galaxy-s24-ultra", "galaxy-s24"],
      defaultValue: "pixel-9-pro",
      label: "机型",
    },
  ],
  states: [
    {
      name: "Pixel 9 Pro（默认）",
      render: () => (
        <Android model="pixel-9-pro">
          <Screen />
        </Android>
      ),
    },
    {
      name: "Galaxy S24 Ultra（最大）",
      render: () => (
        <Android model="galaxy-s24-ultra">
          <Screen />
        </Android>
      ),
    },
    {
      name: "Galaxy S24（最小）",
      render: () => (
        <Android model="galaxy-s24">
          <Screen />
        </Android>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Android model={p.model as AndroidModel}>
      <Screen />
    </Android>
  ),
  toCode: (p) => `<Android model="${p.model}">\n  <img src="/app.png" />\n</Android>`,
};
