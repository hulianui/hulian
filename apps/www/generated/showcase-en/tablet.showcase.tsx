import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tablet } from "../../../../packages/ui/src/tablet/tablet";
import type { TabletModel } from "../../../../packages/ui/src/tablet/tablet.types";
function Screen() {
    return (<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-chart-3/30 to-chart-1/30">
      <span className="text-sm font-medium text-foreground">Hulian App</span>
      <span className="text-xs text-muted">Tablet screen</span>
    </div>);
}
export const tabletShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "iPad is a tablet casing that wraps the screen content. The default model is iPad Pro 11.",
            code: `<Tablet>
  <img src="/app.png" alt="" />
</Tablet>`,
            render: () => (<Tablet>
          <Screen />
        </Tablet>),
        },
        {
            title: "Select model",
            description: "model Switch the default model and determine the default width and body ratio.",
            code: `<Tablet model="ipad-pro-13">
  <img src="/app.png" alt="" />
</Tablet>`,
            render: () => (<Tablet model="ipad-pro-13">
          <Screen />
        </Tablet>),
        },
        {
            title: "Custom width",
            description: "width When passed in explicitly, priority will be given to overwriting the model's default width (the body proportions will still depend on the model).",
            code: `<Tablet model="ipad-mini" width={200}>
  <img src="/app.png" alt="" />
</Tablet>`,
            render: () => (<Tablet model="ipad-mini" width={200}>
          <Screen />
        </Tablet>),
        },
        {
            title: "Picture content",
            description: "Pass imageSrc and directly render the App screenshot (priority to children).",
            code: `<Tablet model="ipad-pro-11" imageSrc="/app.png" />`,
            render: () => (<Tablet model="ipad-pro-11">
          <Screen />
        </Tablet>),
        },
    ],
    controls: [
        {
            prop: "model",
            type: "select",
            options: ["ipad-pro-13", "ipad-pro-11", "ipad-air-11", "ipad-10", "ipad-mini"],
            defaultValue: "ipad-pro-11",
            label: "Model",
        },
    ],
    states: [
        {
            name: "iPad Pro 11 (default)",
            render: () => (<Tablet model="ipad-pro-11">
          <Screen />
        </Tablet>),
        },
        {
            name: "iPad Pro 13 (maximum)",
            render: () => (<Tablet model="ipad-pro-13">
          <Screen />
        </Tablet>),
        },
        {
            name: "iPad mini (smallest/narrowest)",
            render: () => (<Tablet model="ipad-mini">
          <Screen />
        </Tablet>),
        },
    ],
    renderWithProps: (p) => (<Tablet model={p.model as TabletModel}>
      <Screen />
    </Tablet>),
    toCode: (p) => `<Tablet model="${p.model}">
  <img src="/app.png" />
</Tablet>`,
};
