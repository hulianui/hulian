import type { ShowcaseSpec } from "../showcase/types";
import { IPhone } from "./iphone";
import type { IPhoneModel } from "./iphone.types";

function Screen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-1/30 to-chart-2/30">
      <span className="text-sm font-medium text-foreground">瑚琏 App</span>
      <span className="text-xs text-muted-foreground">屏幕内容</span>
    </div>
  );
}

export const iphoneShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "含灵动岛的 iPhone 外壳包裹屏幕内容，默认机型 15 Pro。",
      code: `<IPhone>
  <img src="/app.png" alt="" />
</IPhone>`,
      render: () => (
        <IPhone>
          <Screen />
        </IPhone>
      ),
    },
    {
      title: "选择机型",
      description: "model 切换预设机型，决定默认宽度。",
      code: `<IPhone model="16-pro-max">
  <img src="/app.png" alt="" />
</IPhone>`,
      render: () => (
        <IPhone model="16-pro-max">
          <Screen />
        </IPhone>
      ),
    },
    {
      title: "自定义宽度",
      description: "width 显式传入时优先于机型预设宽度。",
      code: `<IPhone width={220}>
  <img src="/app.png" alt="" />
</IPhone>`,
      render: () => (
        <IPhone width={220}>
          <Screen />
        </IPhone>
      ),
    },
    {
      title: "图片内容",
      description: "传 imageSrc 直接渲染 App 截图（优先于 children）。",
      code: `<IPhone model="15-pro" imageSrc="/app.png" />`,
      render: () => (
        <IPhone model="15-pro">
          <Screen />
        </IPhone>
      ),
    },
  ],
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
