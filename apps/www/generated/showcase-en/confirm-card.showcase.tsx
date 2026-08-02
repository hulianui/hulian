"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ConfirmCard } from "../../../../packages/ui/src/confirm-card/confirm-card";
const items = [
    { label: "Basic information", value: "Lin Wanqing \u00B7 138-0000-0000" },
    { label: "Job intention", value: "Yunqi Technology \u00B7 President's Personal Secretary" },
    { label: "Educational background", value: "Jiangnan University Administration" },
    { label: "Work experience", value: "Morningstar Group CEO Office Manager" },
];
function InteractiveDemo() {
    const [acted, setActed] = useState<"confirmed" | "edited" | null>(null);
    return (<div className="w-full max-w-md">
      <ConfirmCard title="Case Summary · Please confirm" items={items} acted={acted} onConfirm={() => setActed("confirmed")} onEdit={() => setActed("edited")}/>
    </div>);
}
export const confirmCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "label/value List + Confirm/Modify double action. onConfirm/onEdit receives business callback.",
            code: `<ConfirmCard
  title="Dossier summary \u00B7 Please confirm"
  items={[
    { label: "Basic information", value: "Lin Wanqing \u00B7 138-0000-0000" },
    { label: "Job Intention", value: "Yunqi Technology\u00B7President's Personal Secretary" },
  ]}
  onConfirm={handleConfirm}
  onEdit={handleEdit}
/>`,
            render: () => (<div className="w-full max-w-md">
          <ConfirmCard title="Case Summary · Please confirm" items={items} onConfirm={() => { }} onEdit={() => { }}/>
        </div>),
        },
        {
            title: "Confirmed (Locked)",
            description: "acted=\"confirmed\" Lock button and mark selected results.",
            code: `<ConfirmCard items={items} acted="confirmed" onConfirm={\u2026} onEdit={\u2026} />`,
            render: () => (<div className="w-full max-w-md">
          <ConfirmCard items={items} acted="confirmed" onConfirm={() => { }} onEdit={() => { }}/>
        </div>),
        },
        {
            title: "Single action scene",
            description: "If onEdit is not passed, the modification button will not be rendered to avoid unresponsive dead buttons.",
            code: `<ConfirmCard
  title="Insufficient balance"
  items={[{ label: "Current Balance", value: "\u00A5 0.00" }]}
  confirmText="Go to recharge"
  onConfirm={goRecharge}
/>`,
            render: () => (<div className="w-full max-w-md">
          <ConfirmCard title="Insufficient balance" items={[{ label: "Current balance", value: "\u00A5 0.00" }]} confirmText="Go to recharge" onConfirm={() => { }}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        { name: "To be confirmed (interactive)", render: () => <InteractiveDemo /> },
        {
            name: "Confirmed (Locked)",
            render: () => (<div className="w-full max-w-md">
          <ConfirmCard items={items} acted="confirmed"/>
        </div>),
        },
    ],
    renderWithProps: () => <InteractiveDemo />,
    toCode: () => `<ConfirmCard items={[{ label, value }, \u2026]} onConfirm={\u2026} onEdit={\u2026} />`,
};
