import { useState } from "react";

import { VirtualList } from "@hulianui/ui/virtual-list";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { invoke, nextPaint, rootFor, type ScenarioController } from "./shared";

export const virtualListParameters = { items: 10_000, itemHeight: 40 } as const;
const id = "virtual-list/scroll";
const controller: ScenarioController = {};
const initialItems = Array.from({ length: virtualListParameters.items }, (_, index) => ({
  id: index,
  label: `虚拟行 ${index}`,
}));

function scrollTo(offset: number): void {
  const scroller = rootFor(id).querySelector<HTMLElement>(".overflow-auto");
  if (!scroller) throw new Error("virtual-list scroll container is missing");
  scroller.scrollTop = offset;
  scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
}

function assertBoundedDom(): void {
  const rendered = rootFor(id).querySelectorAll("[data-index]").length;
  if (rendered === 0 || rendered > 100) {
    throw new Error(`virtual-list rendered ${rendered} rows; expected 1..100`);
  }
}

function Fixture() {
  const [items, setItems] = useState(initialItems);
  controller["start"] = () => scrollTo(0);
  controller["middle"] = () => scrollTo((virtualListParameters.items / 2) * 40);
  controller["end"] = () => scrollTo(virtualListParameters.items * 40);
  controller["replace"] = () => setItems((current) => [...current]);
  controller["assert"] = assertBoundedDom;
  return (
    <div data-hulian-scan-scenario={id}>
      <VirtualList
        items={items}
        itemHeight={virtualListParameters.itemHeight}
        height={400}
        overscan={8}
        getKey={(item) => item.id}
        renderItem={(item) => <div style={{ height: 40 }}>{item.label}</div>}
      />
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const virtualListScenario = definePerformanceScenario({
  id,
  component: "VirtualList",
  entry: "@hulianui/ui/virtual-list",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    {
      id: "scroll-start",
      kind: "interaction",
      label: "Scroll to the start",
      run: () => action("start"),
    },
    {
      id: "scroll-middle",
      kind: "interaction",
      label: "Scroll to the middle",
      run: () => action("middle"),
    },
    { id: "scroll-end", kind: "interaction", label: "Scroll to the end", run: () => action("end") },
    { id: "replace-items", kind: "props-update", run: () => action("replace") },
    { id: "assert-bounded-dom", kind: "stress", run: () => action("assert") },
  ],
  budgets: {},
});
