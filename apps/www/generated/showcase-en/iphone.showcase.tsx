import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { IPhone } from "../../../../packages/ui/src/iphone/iphone";
import type { IPhoneModel } from "../../../../packages/ui/src/iphone/iphone.types";
function Screen() {
    return (<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-1/30 to-chart-2/30">
      <span className="text-sm font-medium text-foreground">Hulian App</span>
      <span className="text-xs text-muted">Screen contents</span>
    </div>);
}
export const iphoneShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The iPhone casing with Smart Island wraps the screen content, the default model is 15 Pro.",
            code: `<IPhone>
  <img src="/app.png" alt="" />
</IPhone>`,
            render: () => (<IPhone>
          <Screen />
        </IPhone>),
        },
        {
            title: "Select model",
            description: "model Switch the default model and determine the default width.",
            code: `<IPhone model="16-pro-max">
  <img src="/app.png" alt="" />
</IPhone>`,
            render: () => (<IPhone model="16-pro-max">
          <Screen />
        </IPhone>),
        },
        {
            title: "Custom width",
            description: "width takes precedence over the model default width when passed in explicitly.",
            code: `<IPhone width={220}>
  <img src="/app.png" alt="" />
</IPhone>`,
            render: () => (<IPhone width={220}>
          <Screen />
        </IPhone>),
        },
        {
            title: "Picture content",
            description: "Pass imageSrc and directly render the App screenshot (priority to children).",
            code: `<IPhone model="15-pro" imageSrc="/app.png" />`,
            render: () => (<IPhone model="15-pro">
          <Screen />
        </IPhone>),
        },
    ],
    controls: [
        {
            prop: "model",
            type: "select",
            options: ["16-pro-max", "16-pro", "16-plus", "16", "15-pro", "13-mini"],
            defaultValue: "15-pro",
            label: "Model",
        },
    ],
    states: [
        {
            name: "15 Pro (default)",
            render: () => (<IPhone model="15-pro">
          <Screen />
        </IPhone>),
        },
        {
            name: "16 Pro Max (maximum)",
            render: () => (<IPhone model="16-pro-max">
          <Screen />
        </IPhone>),
        },
        {
            name: "13 mini (minimum)",
            render: () => (<IPhone model="13-mini">
          <Screen />
        </IPhone>),
        },
    ],
    renderWithProps: (p) => (<IPhone model={p.model as IPhoneModel}>
      <Screen />
    </IPhone>),
    toCode: (p) => `<IPhone model="${p.model}">
  <img src="/app.png" />
</IPhone>`,
};
