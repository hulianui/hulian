import { useState } from "react";

import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

function ExpensiveChildView({ config }: { config: { rows: number } }) {
  let checksum = 0;
  for (let index = 0; index < config.rows * 2_000; index += 1) {
    checksum = (checksum + index * 17) % 104_729;
  }
  return <output data-checksum={checksum}>{config.rows}</output>;
}
Object.defineProperty(ExpensiveChildView, "displayName", {
  value: "ExpensiveChildView",
});

const stableConfig = { rows: 200 } as const;

export function KnownBad() {
  const [tick, setTick] = useState(0);
  return (
    <div data-hulian-scan-fixture="known-bad">
      <button data-fixture-update onClick={() => setTick((value) => value + 1)}>
        {tick}
      </button>
      <ExpensiveChildView config={stableConfig} />
    </div>
  );
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export const knownBadScenario = definePerformanceScenario({
  id: "fixture/known-bad",
  component: "ExpensiveChildView",
  entry: "fixture/known-bad",
  category: "standard",
  render: () => <KnownBad />,
  steps: [
    {
      id: "stable-parent-update",
      kind: "parent-update",
      run: async () => {
        const button = document.querySelector<HTMLButtonElement>("[data-fixture-update]");
        if (!button) throw new Error("known-bad update button missing");
        for (let index = 0; index < 5; index += 1) {
          button.click();
          await nextPaint();
        }
      },
    },
  ],
  budgets: { maxAvoidableRenderCount: 0 },
});
