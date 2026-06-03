import type { ShowcaseSpec } from "../showcase/types";
import { Watch } from "./watch";
import type { WatchModel } from "./watch.types";

function Face() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-chart-4/40 to-chart-2/40">
      <span className="text-base font-semibold leading-none text-foreground">10:09</span>
      <span className="text-[10px] text-muted">瑚琏</span>
    </div>
  );
}

export const watchShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "model",
      type: "select",
      options: ["ultra-49", "series-45", "se-44", "series-41"],
      defaultValue: "series-45",
      label: "机型",
    },
  ],
  states: [
    {
      name: "Series 45mm（默认）",
      render: () => (
        <Watch model="series-45">
          <Face />
        </Watch>
      ),
    },
    {
      name: "Ultra 49mm（最大）",
      render: () => (
        <Watch model="ultra-49">
          <Face />
        </Watch>
      ),
    },
    {
      name: "Series 41mm（最小）",
      render: () => (
        <Watch model="series-41">
          <Face />
        </Watch>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Watch model={p.model as WatchModel}>
      <Face />
    </Watch>
  ),
  toCode: (p) => `<Watch model="${p.model}">\n  <img src="/face.png" />\n</Watch>`,
};
