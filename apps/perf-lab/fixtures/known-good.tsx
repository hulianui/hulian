import { memo, useState } from "react";

import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

const stableConfig = { rows: 200 } as const;

function ExpensiveChildView({ config }: { config: { rows: number } }) {
  let checksum = 0;
  for (let index = 0; index < config.rows * 2_000; index += 1) {
    checksum = (checksum + index * 17) % 104_729;
  }
  return <output data-checksum={checksum}>{config.rows}</output>;
}

const ExpensiveChild = memo(ExpensiveChildView);
ExpensiveChild.displayName = "ExpensiveChild";

function LocalTicker() {
  const [tick, setTick] = useState(0);
  return (
    <button data-fixture-update onClick={() => setTick((value) => value + 1)}>
      {tick}
    </button>
  );
}

export function KnownGood() {
  return (
    <div data-hulian-scan-fixture="known-good">
      <LocalTicker />
      <ExpensiveChild config={stableConfig} />
    </div>
  );
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export const knownGoodScenario = definePerformanceScenario({
  id: "fixture/known-good",
  component: "ExpensiveChildView",
  entry: "fixture/known-good",
  category: "standard",
  render: () => <KnownGood />,
  steps: [
    {
      id: "stable-parent-update",
      kind: "parent-update",
      run: async () => {
        const button = document.querySelector<HTMLButtonElement>(
          "[data-fixture-update]",
        );
        if (!button) throw new Error("known-good update button missing");
        for (let index = 0; index < 5; index += 1) {
          button.click();
          await nextPaint();
        }
      },
    },
  ],
  budgets: { maxAvoidableRenderCount: 0 },
});
