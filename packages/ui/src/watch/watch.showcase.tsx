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
  examples: [
    {
      title: "基础用法",
      description: "用 children 填充表盘内容，默认为 Series 45mm 机型。",
      code: `<Watch model="series-45">
  <div className="flex h-full w-full flex-col items-center justify-center">
    <span className="text-base font-semibold">10:09</span>
    <span className="text-[10px] text-muted">瑚琏</span>
  </div>
</Watch>`,
      render: () => (
        <Watch model="series-45">
          <Face />
        </Watch>
      ),
    },
    {
      title: "预设机型",
      description: "model 决定表壳尺寸：Ultra 49mm 最大、Series 41mm 最小。",
      code: `<>
  <Watch model="ultra-49"><Face /></Watch>
  <Watch model="series-45"><Face /></Watch>
  <Watch model="series-41"><Face /></Watch>
</>`,
      render: () => (
        <div className="flex flex-wrap items-end gap-4">
          <Watch model="ultra-49">
            <Face />
          </Watch>
          <Watch model="series-45">
            <Face />
          </Watch>
          <Watch model="series-41">
            <Face />
          </Watch>
        </div>
      ),
    },
    {
      title: "自定义宽度",
      description: "width 显式传入时优先于 model 预设，可精确控制表壳大小。",
      code: `<Watch width={140}>
  <Face />
</Watch>`,
      render: () => (
        <Watch width={140}>
          <Face />
        </Watch>
      ),
    },
    {
      title: "图片表盘",
      description: "imageSrc 优先于 children，整张图按 cover 铺满表盘。",
      code: `<Watch model="series-45" imageSrc="/face.png" />`,
      render: () => (
        <Watch model="series-45">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-chart-1 to-chart-3 text-xs font-medium text-white">
            图片表盘
          </div>
        </Watch>
      ),
    },
  ],
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
