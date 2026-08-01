import type { ReactNode } from "react";

import {
  createCollector,
  type AdapterHandle,
  type PerformanceScenario,
  type ScanEvent,
  type ScanStage,
  type ScenarioRun,
} from "@hulianui/hulian-scan/browser";

import { listScenarioIds, loadScenario } from "../scenarios";
import type { HarnessController } from "./harness";

export interface LabRunOptions {
  samples: number;
  warmups: number;
  timeoutMs?: number;
}

export interface HulianScanLabApi {
  ready: Promise<void>;
  list(): string[];
  describe(id: string): Promise<{
    category: PerformanceScenario["category"];
    component: string;
    entry: string;
    webgl?: boolean;
  }>;
  run(id: string, options: LabRunOptions): Promise<ScenarioRun>;
  result(id: string): ScenarioRun | undefined;
}

declare global {
  const __HULIAN_SCAN_STAGE__: ScanStage;
  var __HULIAN_SCAN_ADAPTER__: AdapterHandle | undefined;
  var __HULIAN_SCAN_ADAPTER_INSTALLED_BEFORE_REACT__: boolean | undefined;
  var __HULIAN_SCAN_SUBSCRIBE__: ((sink: (event: ScanEvent) => void) => () => void) | undefined;
  interface Window {
    __HULIAN_SCAN_LAB__: HulianScanLabApi;
  }
}

function assertRunOptions(options: LabRunOptions): void {
  if (!Number.isInteger(options.samples) || options.samples < 1) {
    throw new Error("samples must be a positive integer");
  }
  if (!Number.isInteger(options.warmups) || options.warmups < 0) {
    throw new Error("warmups must be a non-negative integer");
  }
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
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

interface BrowserObservation {
  beginStep(stepId: string, interaction: boolean): void;
  endStep(): void;
  finish(): {
    interactionDurations: number[];
    longTaskDurations: number[];
    frameDurations: number[];
  };
}

function observeBrowser(category: PerformanceScenario["category"]): BrowserObservation {
  const prefix = `hulian-scan-${Math.random().toString(36).slice(2)}`;
  const interactionDurations: number[] = [];
  const longTaskDurations: number[] = [];
  const frameDurations: number[] = [];
  let current: { stepId: string; startName: string; interaction: boolean } | undefined;
  let observer: PerformanceObserver | undefined;
  let frameRequest: number | undefined;
  let previousFrame: number | undefined;

  try {
    observer = new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries()) longTaskDurations.push(entry.duration);
    });
    observer.observe({ type: "longtask", buffered: false });
  } catch {
    observer = undefined;
  }

  if (category === "animation") {
    const sampleFrame = (timestamp: number): void => {
      if (previousFrame !== undefined) frameDurations.push(timestamp - previousFrame);
      previousFrame = timestamp;
      frameRequest = requestAnimationFrame(sampleFrame);
    };
    frameRequest = requestAnimationFrame(sampleFrame);
  }

  const endStep = (): void => {
    if (!current) return;
    const endName = `${prefix}:${current.stepId}:end`;
    const measureName = `${prefix}:${current.stepId}`;
    performance.mark(endName);
    const measure = performance.measure(measureName, current.startName, endName);
    if (current.interaction) interactionDurations.push(measure.duration);
    current = undefined;
  };

  return {
    beginStep(stepId, interaction) {
      endStep();
      const startName = `${prefix}:${stepId}:start`;
      performance.mark(startName);
      current = { stepId, startName, interaction };
    },
    endStep,
    finish() {
      endStep();
      observer?.takeRecords().forEach((entry) => longTaskDurations.push(entry.duration));
      observer?.disconnect();
      if (frameRequest !== undefined) cancelAnimationFrame(frameRequest);
      performance.clearMarks(prefix);
      for (const entry of performance.getEntriesByType("mark")) {
        if (entry.name.startsWith(prefix)) performance.clearMarks(entry.name);
      }
      for (const entry of performance.getEntriesByType("measure")) {
        if (entry.name.startsWith(prefix)) performance.clearMeasures(entry.name);
      }
      return { interactionDurations, longTaskDurations, frameDurations };
    },
  };
}

export type GpuMode = "hardware" | "software" | "unavailable";

export function classifyGpuRenderer(renderer: string | undefined): GpuMode {
  if (!renderer) return "unavailable";
  return /swiftshader|software|llvmpipe|lavapipe/i.test(renderer) ? "software" : "hardware";
}

function inspectGpu(): { renderer?: string; mode: GpuMode } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return { mode: "unavailable" };
    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = extension
      ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL))
      : undefined;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ...(renderer ? { renderer } : {}), mode: classifyGpuRenderer(renderer) };
  } catch {
    return { mode: "unavailable" };
  }
}

function isMountStep(stepId: string | undefined): boolean {
  return /^(?:mount|mount[-:])/.test(stepId ?? "");
}

function isUnmountStep(stepId: string | undefined): boolean {
  return /^(?:unmount|unmount[-:])/.test(stepId ?? "");
}

export function computeMetrics(
  events: ScanEvent[],
  observation: ReturnType<BrowserObservation["finish"]>,
): Record<string, number> {
  const commits = events.filter((event) => event.type === "commit");
  const fibers = events.filter((event) => event.type === "fiber-render");
  const fanout = new Map<number, number>();
  const mountFanout = new Map<number, number>();
  const seenFiberIds = new Set<number>();
  for (const fiber of fibers) {
    const isNewFiber = fiber.fiberId !== undefined && !seenFiberIds.has(fiber.fiberId);
    if (fiber.fiberId !== undefined) seenFiberIds.add(fiber.fiberId);

    // A popup/list can mount during an interaction. Those fibers are mount work,
    // not an update cascade. react-scan/lite IDs are stable and alternate-aware,
    // so only fibers observed in an earlier commit count toward update fanout.
    if (isMountStep(fiber.stepId) || isNewFiber) {
      mountFanout.set(fiber.commitId, (mountFanout.get(fiber.commitId) ?? 0) + 1);
    } else if (!isUnmountStep(fiber.stepId)) {
      fanout.set(fiber.commitId, (fanout.get(fiber.commitId) ?? 0) + 1);
    }
  }
  const longestTaskMs = Math.max(0, ...observation.longTaskDurations);
  const droppedFrames = observation.frameDurations.filter((duration) => duration > 20).length;
  return {
    commitDurationMs: commits.reduce((total, commit) => total + commit.durationMs, 0),
    mountFanout: Math.max(0, ...mountFanout.values()),
    cascadeFanout: Math.max(0, ...fanout.values()),
    interactionLatencyMs: Math.max(0, ...observation.interactionDurations),
    longTaskCount: observation.longTaskDurations.length,
    longestTaskMs,
    longTaskMs: longestTaskMs,
    droppedFrameRatio:
      observation.frameDurations.length === 0
        ? 0
        : droppedFrames / observation.frameDurations.length,
    longestFrameMs: Math.max(0, ...observation.frameDurations),
  };
}

async function runIteration(
  scenario: PerformanceScenario,
  harness: HarnessController,
  timeoutMs: number,
): Promise<{ events: ScanEvent[]; errors: string[]; sample: Record<string, number> }> {
  const collector = createCollector();
  const browserObservation = observeBrowser(scenario.category);
  const subscribe = globalThis.__HULIAN_SCAN_SUBSCRIBE__;
  if (!subscribe) throw new Error("Hulian Scan adapter subscriber is missing");
  const unsubscribe = subscribe((event) => collector.accept(event));
  let openStepId: string | undefined;
  const beginStep = (stepId: string, interaction = false): void => {
    collector.beginStep(stepId, performance.now());
    browserObservation.beginStep(stepId, interaction);
    openStepId = stepId;
  };
  const endStep = (): void => {
    if (!openStepId) return;
    collector.endStep(openStepId, performance.now());
    browserObservation.endStep();
    openStepId = undefined;
  };

  try {
    await withTimeout(
      (async () => {
        beginStep("mount");
        await harness.render(scenario.render() as ReactNode);
        endStep();

        for (const step of scenario.steps) {
          beginStep(step.id, step.kind === "interaction");
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
    const observation = browserObservation.finish();
    return {
      events: result.events,
      errors: [...result.errors, ...harness.takeErrors(), message],
      sample: computeMetrics(result.events, observation),
    };
  } finally {
    unsubscribe();
  }

  const result = collector.finalize();
  const observation = browserObservation.finish();
  return {
    events: result.events,
    errors: [...result.errors, ...harness.takeErrors()],
    sample: computeMetrics(result.events, observation),
  };
}

export function createWindowApi(harness: HarnessController): HulianScanLabApi {
  const results = new Map<string, ScenarioRun>();
  let running = false;

  return {
    ready: Promise.resolve(),
    list: listScenarioIds,
    async describe(id) {
      const scenario = await loadScenario(id);
      return {
        category: scenario.category,
        component: scenario.component,
        entry: scenario.entry,
        webgl: scenario.webgl,
      };
    },
    async run(id, options) {
      if (running) throw new Error("another Hulian Scan scenario is running");
      assertRunOptions(options);
      running = true;
      try {
        const scenario: PerformanceScenario = await loadScenario(id);
        const events: ScanEvent[] = [];
        const errors: string[] = [];
        const samples: Array<Record<string, number>> = [];
        const iterations = options.warmups + options.samples;
        for (let index = 0; index < iterations; index += 1) {
          const iteration = await runIteration(scenario, harness, options.timeoutMs ?? 10_000);
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
            component: scenario.component,
            category: scenario.category,
            entry: scenario.entry,
            webgl: scenario.webgl === true,
            ...(() => {
              if (!scenario.webgl) return { gpuMetricsTrusted: true };
              const gpu = inspectGpu();
              return {
                gpuMode: gpu.mode,
                gpuMetricsTrusted: gpu.mode === "hardware",
                ...(gpu.renderer ? { gpuRenderer: gpu.renderer } : {}),
              };
            })(),
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
