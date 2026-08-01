import { useState } from "react";

import { Dialog, DialogClose, DialogContent } from "@hulianui/ui/dialog";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { invoke, nextPaint, wait, type ScenarioController } from "./shared";

export const dialogParameters = { cycles: 5 } as const;
const id = "dialog/cycles";
const controller: ScenarioController = {};

function Fixture() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  controller["cycles"] = async () => {
    for (let index = 0; index < dialogParameters.cycles; index += 1) {
      setOpen(true);
      await nextPaint();
      setOpen(false);
      await nextPaint();
    }
  };
  controller["open"] = () => setOpen(true);
  controller["close"] = () => setOpen(false);
  controller["unmount"] = async () => {
    setVisible(false);
    await wait(500);
    if (document.querySelector('[role="dialog"]'))
      throw new Error("dialog portal survived unmount");
  };
  return (
    <div data-hulian-scan-scenario={id}>
      {visible ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent title="性能对话框" footer={<DialogClose>关闭</DialogClose>}>
            <p>反复打开关闭时检查 Portal 与过渡清理。</p>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const dialogScenario = definePerformanceScenario({
  id,
  component: "Dialog",
  entry: "@hulianui/ui/dialog",
  category: "core",
  render: () => <Fixture />,
  steps: [
    { id: "open-close-5-cycles", kind: "stress", run: () => action("cycles") },
    { id: "open", kind: "interaction", label: "Open dialog", run: () => action("open") },
    { id: "close", kind: "interaction", label: "Close dialog", run: () => action("close") },
    { id: "unmount-observe", kind: "unmount", run: () => action("unmount") },
  ],
  budgets: {},
});
