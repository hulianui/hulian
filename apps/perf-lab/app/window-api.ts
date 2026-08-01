import type { ReactNode } from "react";

import {
  createCollector,
  type AdapterHandle,
  type PerformanceScenario,
  type ScanEvent,
  type ScanStage,
  type ScenarioRun,
} from "@hulianui/hulian-scan/browser";

import { knownBadScenario } from "../fixtures/known-bad";
import { knownGoodScenario } from "../fixtures/known-good";
import type { HarnessController } from "./harness";

export interface LabRunOptions {
  samples: number;
  warmups: number;
  timeoutMs?: number;
}

export interface HulianScanLabApi {
  ready: Promise<void>;
  list(): string[];
  run(id: string, options: LabRunOptions): Promise<ScenarioRun>;
  result(id: string): ScenarioRun | undefined;
}

declare global {
  const __HULIAN_SCAN_STAGE__: ScanStage;
  var __HULIAN_SCAN_ADAPTER__: AdapterHandle | undefined;
  var __HULIAN_SCAN_ADAPTER_INSTALLED_BEFORE_REACT__: boolean | undefined;
  var __HULIAN_SCAN_SUBSCRIBE__:
    | ((sink: (event: ScanEvent) => void) => () => void)
    | undefined;
  interface Window {
    __HULIAN_SCAN_LAB__: HulianScanLabApi;
  }
}

const scenarios = new Map<string, PerformanceScenario>([
  [knownBadScenario.id, knownBadScenario],
  [knownGoodScenario.id, knownGoodScenario],
]);

function assertRunOptions(options: LabRunOptions): void {
  if (!Number.isInteger(options.samples) || options.samples < 1) {
    throw new Error("samples must be a positive integer");
  }
  if (!Number.isInteger(options.warmups) || options.warmups < 0) {
    throw new Error("warmups must be a non-negative integer");
  }
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`scenario timeout after ${timeoutMs} ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function metrics(events: ScanEvent[]): Record<string, number> {
  const commits = events.filter((event) => event.type === "commit");
  const fibers = events.filter((event) => event.type === "fiber-render");
  const fanout = new Map<number, number>();
  for (const fiber of fibers) {
    fanout.set(fiber.commitId, (fanout.get(fiber.commitId) ?? 0) + 1);
  }
  return {
    commitDurationMs: commits.reduce(
      (total, commit) => total + commit.durationMs,
      0,
    ),
    cascadeFanout: Math.max(0, ...fanout.values()),
    longTaskMs: 0,
    droppedFrameRatio: 0,
  };
}

async function runIteration(
  scenario: PerformanceScenario,
  harness: HarnessController,
  timeoutMs: number,
): Promise<{ events: ScanEvent[]; errors: string[]; sample: Record<string, number> }> {
  const collector = createCollector();
  const subscribe = globalThis.__HULIAN_SCAN_SUBSCRIBE__;
  if (!subscribe) throw new Error("Hulian Scan adapter subscriber is missing");
  const unsubscribe = subscribe((event) => collector.accept(event));
  let openStepId: string | undefined;
  const beginStep = (stepId: string): void => {
    collector.beginStep(stepId, performance.now());
    openStepId = stepId;
  };
  const endStep = (): void => {
    if (!openStepId) return;
    collector.endStep(openStepId, performance.now());
    openStepId = undefined;
  };

  try {
    await withTimeout(
      (async () => {
        beginStep("mount");
        await harness.render(scenario.render() as ReactNode);
        endStep();

        for (const step of scenario.steps) {
          beginStep(step.id);
          await step.run();
          endStep();
        }

        beginStep("unmount");
        await harness.clear();
        endStep();
      })(),
      timeoutMs,
    );
  } catch (error) {
    endStep();
    await harness.clear();
    const result = collector.finalize();
    const message = error instanceof Error ? error.message : String(error);
    return {
      events: result.events,
      errors: [...result.errors, ...harness.takeErrors(), message],
      sample: metrics(result.events),
    };
  } finally {
    unsubscribe();
  }

  const result = collector.finalize();
  return {
    events: result.events,
    errors: [...result.errors, ...harness.takeErrors()],
    sample: metrics(result.events),
  };
}

export function createWindowApi(harness: HarnessController): HulianScanLabApi {
  const results = new Map<string, ScenarioRun>();
  let running = false;

  return {
    ready: Promise.resolve(),
    list: () => [...scenarios.keys()].sort(),
    async run(id, options) {
      if (running) throw new Error("another Hulian Scan scenario is running");
      assertRunOptions(options);
      const scenario = scenarios.get(id);
      if (!scenario) throw new Error(`unknown performance scenario: ${id}`);
      running = true;
      try {
        const events: ScanEvent[] = [];
        const errors: string[] = [];
        const samples: Array<Record<string, number>> = [];
        const iterations = options.warmups + options.samples;
        for (let index = 0; index < iterations; index += 1) {
          const iteration = await runIteration(
            scenario,
            harness,
            options.timeoutMs ?? 10_000,
          );
          if (index >= options.warmups) {
            events.push(...iteration.events);
            errors.push(...iteration.errors);
            samples.push(iteration.sample);
          }
        }
        const run: ScenarioRun = {
          schemaVersion: 1,
          scenarioId: id,
          stage: __HULIAN_SCAN_STAGE__,
          environment: "workspace",
          samples,
          events,
          errors: [...new Set(errors)],
          metadata: {
            adapterInstalledBeforeReact:
              globalThis.__HULIAN_SCAN_ADAPTER_INSTALLED_BEFORE_REACT__ === true,
            warmups: options.warmups,
            samples: options.samples,
          },
        };
        results.set(id, run);
        return run;
      } finally {
        running = false;
      }
    },
    result: (id) => results.get(id),
  };
}
