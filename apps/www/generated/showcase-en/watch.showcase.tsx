import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Watch } from "../../../../packages/ui/src/watch/watch";
import type { WatchModel } from "../../../../packages/ui/src/watch/watch.types";
function Face() {
    return (<div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-chart-4/40 to-chart-2/40">
      <span className="text-base font-semibold leading-none text-foreground">10:09</span>
      <span className="text-[10px] text-muted-foreground">Hulian</span>
    </div>);
}
export const watchShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Fill the dial content with children, the default is Series 45mm model.",
            code: `<Watch model="series-45">
  <div className="flex h-full w-full flex-col items-center justify-center">
    <span className="text-base font-semibold">10:09</span>
    <span className="text-[10px] text-muted-foreground">Hulian</span>
  </div>
</Watch>`,
            render: () => (<Watch model="series-45">
          <Face />
        </Watch>),
        },
        {
            title: "Default model",
            description: "model determines the case size: Ultra 49mm is the largest, Series 41mm is the smallest.",
            code: `<>
  <Watch model="ultra-49"><Face /></Watch>
  <Watch model="series-45"><Face /></Watch>
  <Watch model="series-41"><Face /></Watch>
</>`,
            render: () => (<div className="flex flex-wrap items-end gap-4">
          <Watch model="ultra-49">
            <Face />
          </Watch>
          <Watch model="series-45">
            <Face />
          </Watch>
          <Watch model="series-41">
            <Face />
          </Watch>
        </div>),
        },
        {
            title: "Custom width",
            description: "width takes precedence over the model preset when passed in explicitly, allowing precise control of the case size.",
            code: `<Watch width={140}>
  <Face />
</Watch>`,
            render: () => (<Watch width={140}>
          <Face />
        </Watch>),
        },
        {
            title: "Picture dial",
            description: "imageSrc takes priority over children, and the entire picture is filled with cover on the dial.",
            code: `<Watch model="series-45" imageSrc="/face.png" />`,
            render: () => (<Watch model="series-45">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chart-1 to-chart-3 text-xs font-medium text-white">
            Picture dial
          </div>
        </Watch>),
        },
    ],
    controls: [
        {
            prop: "model",
            type: "select",
            options: ["ultra-49", "series-45", "se-44", "series-41"],
            defaultValue: "series-45",
            label: "Model",
        },
    ],
    states: [
        {
            name: "Series 45mm (default)",
            render: () => (<Watch model="series-45">
          <Face />
        </Watch>),
        },
        {
            name: "Ultra 49mm (maximum)",
            render: () => (<Watch model="ultra-49">
          <Face />
        </Watch>),
        },
        {
            name: "Series 41mm (minimum)",
            render: () => (<Watch model="series-41">
          <Face />
        </Watch>),
        },
    ],
    renderWithProps: (p) => (<Watch model={p.model as WatchModel}>
      <Face />
    </Watch>),
    toCode: (p) => `<Watch model="${p.model}">
  <img src="/face.png" />
</Watch>`,
};
