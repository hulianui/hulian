import type { ShowcaseSpec } from "../showcase/types";
import { IPhone } from "./iphone";
import type { IPhoneModel } from "./iphone.types";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-1/30 to-chart-2/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted">屏幕内容</span>
    </div>
  );
}

export const iphoneShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "model",
      type: "select",
      options: ["16-pro-max", "16-pro", "16-plus", "16", "15-pro", "13-mini"],
      defaultValue: "15-pro",
      label: "机型",
    },
  ],
  states: [
    {
      name: "15 Pro（默认）",
      render: () => (
        <IPhone model="15-pro">
          <Screen />
        </IPhone>
      ),
    },
    {
      name: "16 Pro Max（最大）",
      render: () => (
        <IPhone model="16-pro-max">
          <Screen />
        </IPhone>
      ),
    },
    {
      name: "13 mini（最小）",
      render: () => (
        <IPhone model="13-mini">
          <Screen />
        </IPhone>
      ),
    },
  ],
  renderWithProps: (p) => (
    <IPhone model={p.model as IPhoneModel}>
      <Screen />
    </IPhone>
  ),
  toCode: (p) => `<IPhone model="${p.model}">\n  <img src="/app.png" />\n</IPhone>`,
};
