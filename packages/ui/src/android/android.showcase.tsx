import type { ShowcaseSpec } from "../showcase/types";
import { Android } from "./android";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-2/30 to-chart-4/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted">Android 屏</span>
    </div>
  );
}

export const androidShowcase: ShowcaseSpec = {
  controls: [{ prop: "width", type: "number", defaultValue: 240 }],
  states: [
    {
      name: "default（打孔摄像头手机外壳）",
      render: () => (
        <Android width={220}>
          <Screen />
        </Android>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Android width={p.width as number}>
      <Screen />
    </Android>
  ),
  toCode: (p) => `<Android width={${p.width}}>\n  <img src="/app.png" />\n</Android>`,
};
