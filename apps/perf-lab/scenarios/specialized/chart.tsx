import { useState } from "react";

import { LineChart } from "@hulianui/ui/chart";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { invoke, nextPaint, rootFor, wait, type ScenarioController } from "./shared";

export const chartParameters = { points: 500 } as const;
const id = "chart/stress";
const controller: ScenarioController = {};
const seed = Array.from({ length: chartParameters.points }, (_, index) => ({
  x: index,
  primary: 50 + Math.sin(index / 10) * 30,
  comparison: 40 + Math.cos(index / 12) * 20,
}));

function Fixture() {
  const [data, setData] = useState(seed);
  const [visible, setVisible] = useState(true);
  controller["update"] = () =>
    setData((current) =>
      current.map((point, index) => (index === 250 ? { ...point, primary: 99 } : point)),
    );
  controller["tooltip"] = () => {
    rootFor(id)
      .querySelector<SVGElement>("svg")
      ?.dispatchEvent(
        new PointerEvent("pointermove", { bubbles: true, clientX: 300, clientY: 120 }),
      );
  };
  controller["resize"] = () => {
    window.dispatchEvent(new Event("resize"));
  };
  controller["unmount"] = async () => {
    setVisible(false);
    await wait(500);
    if (rootFor(id).querySelector("svg")) throw new Error("chart SVG survived unmount");
  };
  return (
    <div data-hulian-scan-scenario={id} style={{ width: 900 }}>
      {visible ? (
        <LineChart
          data={data}
          xKey="x"
          series={[
            { key: "primary", label: "主序列" },
            { key: "comparison", label: "对比序列" },
          ]}
          height={420}
        />
      ) : null}
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const chartScenario = definePerformanceScenario({
  id,
  component: "LineChart",
  entry: "@hulianui/ui/chart",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    { id: "update-one-series", kind: "props-update", run: () => action("update") },
    {
      id: "tooltip-pointer-move",
      kind: "interaction",
      label: "Move pointer over the 500-point chart",
      run: () => action("tooltip"),
    },
    {
      id: "resize",
      kind: "interaction",
      label: "Resize the chart viewport",
      run: () => action("resize"),
    },
    { id: "unmount-cleanup", kind: "unmount", run: () => action("unmount") },
  ],
  budgets: {},
});
