import type { ShowcaseSpec } from "../showcase/types";
import { IPhone } from "./iphone";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-1/30 to-chart-2/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted">屏幕内容</span>
    </div>
  );
}

export const iphoneShowcase: ShowcaseSpec = {
  controls: [{ prop: "width", type: "number", defaultValue: 240 }],
  states: [
    {
      name: "default（灵动岛手机外壳）",
      render: () => (
        <IPhone width={220}>
          <Screen />
        </IPhone>
      ),
    },
  ],
  renderWithProps: (p) => (
    <IPhone width={p.width as number}>
      <Screen />
    </IPhone>
  ),
  toCode: (p) => `<IPhone width={${p.width}}>\n  <img src="/app.png" />\n</IPhone>`,
};
