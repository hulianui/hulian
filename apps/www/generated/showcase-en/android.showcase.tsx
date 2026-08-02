import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Android } from "../../../../packages/ui/src/android/android";
import type { AndroidModel } from "../../../../packages/ui/src/android/android.types";
function Screen() {
    return (<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-chart-2/30 to-chart-4/30">
      <span className="text-sm font-medium text-foreground">Hulian App</span>
      <span className="text-xs text-muted">Android screen</span>
    </div>);
}
export const androidShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The Android casing with a centered punch-hole camera wraps the screen content, the default is Pixel 9 Pro.",
            code: `<Android>
  <img src="/app.png" alt="" />
</Android>`,
            render: () => (<Android>
          <Screen />
        </Android>),
        },
        {
            title: "Select model",
            description: "model Switch the default model and determine the default width.",
            code: `<Android model="galaxy-s24-ultra">
  <img src="/app.png" alt="" />
</Android>`,
            render: () => (<Android model="galaxy-s24-ultra">
          <Screen />
        </Android>),
        },
        {
            title: "Custom width",
            description: "width takes precedence over the model default width when passed in explicitly.",
            code: `<Android width={220}>
  <img src="/app.png" alt="" />
</Android>`,
            render: () => (<Android width={220}>
          <Screen />
        </Android>),
        },
        {
            title: "Picture content",
            description: "Pass imageSrc and directly render the App screenshot (priority to children).",
            code: `<Android model="pixel-9-pro" imageSrc="/app.png" />`,
            render: () => (<Android model="pixel-9-pro">
          <Screen />
        </Android>),
        },
    ],
    controls: [
        {
            prop: "model",
            type: "select",
            options: ["pixel-9-pro-xl", "pixel-9-pro", "pixel-9", "galaxy-s24-ultra", "galaxy-s24"],
            defaultValue: "pixel-9-pro",
            label: "Model",
        },
    ],
    states: [
        {
            name: "Pixel 9 Pro (default)",
            render: () => (<Android model="pixel-9-pro">
          <Screen />
        </Android>),
        },
        {
            name: "Galaxy S24 Ultra (maximum)",
            render: () => (<Android model="galaxy-s24-ultra">
          <Screen />
        </Android>),
        },
        {
            name: "Galaxy S24 (minimum)",
            render: () => (<Android model="galaxy-s24">
          <Screen />
        </Android>),
        },
    ],
    renderWithProps: (p) => (<Android model={p.model as AndroidModel}>
      <Screen />
    </Android>),
    toCode: (p) => `<Android model="${p.model}">
  <img src="/app.png" />
</Android>`,
};
