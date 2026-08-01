import { instrument } from "react-scan/lite";
import type { LiteEvent, LiteFiberSummary } from "react-scan/lite";

import type { ScanEvent, ScanStage } from "../contracts";

export interface AdapterOptions {
  stage: ScanStage;
  sink: (event: ScanEvent) => void;
  instrument?: typeof instrument;
}

export interface AdapterHandle {
  stop(): void;
}

interface RendererHook {
  renderers?: Map<unknown, unknown>;
}

interface NormalizationState {
  nextCommitId: number;
  startedAt?: number;
  tree?: LiteFiberSummary[];
}

export function assertPreReactInstallation(
  hook: RendererHook | undefined,
): void {
  if (hook?.renderers && hook.renderers.size > 0) {
    throw new Error("hulian-scan must install before React");
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`invalid ${label}: ${String(value)}`);
  }
}

function formatSource(source: LiteFiberSummary["source"]): string | undefined {
  if (!source) return undefined;

  const location = source.lineNumber
    ? `${source.fileName}:${source.lineNumber}`
    : source.fileName;
  return source.columnNumber ? `${location}:${source.columnNumber}` : location;
}

function selfDurationAt(tree: LiteFiberSummary[], index: number): number {
  const fiber = tree[index];
  if (!fiber) throw new Error(`missing fiber at index ${index}`);

  assertFiniteNonNegative(fiber.actualDuration, "fiber duration");
  if (!Number.isInteger(fiber.depth) || fiber.depth < 0) {
    throw new Error(`invalid fiber depth: ${String(fiber.depth)}`);
  }

  let directChildrenDuration = 0;
  for (let childIndex = index + 1; childIndex < tree.length; childIndex += 1) {
    const candidate = tree[childIndex];
    if (!candidate) break;
    if (candidate.depth <= fiber.depth) break;
    if (candidate.depth === fiber.depth + 1) {
      assertFiniteNonNegative(candidate.actualDuration, "fiber duration");
      directChildrenDuration += candidate.actualDuration;
    }
  }

  return Math.max(0, fiber.actualDuration - directChildrenDuration);
}

function normalizeFiber(
  fiber: LiteFiberSummary,
  tree: LiteFiberSummary[],
  index: number,
  commitId: number,
): ScanEvent {
  const source = formatSource(fiber.source);
  return {
    type: "fiber-render",
    commitId,
    ...(fiber.fiberId === undefined ? {} : { fiberId: fiber.fiberId }),
    name: fiber.name,
    ...(fiber.ownerName ? { ownerName: fiber.ownerName } : {}),
    ...(source ? { source } : {}),
    depth: fiber.depth,
    actualDurationMs: fiber.actualDuration,
    selfDurationMs: selfDurationAt(tree, index),
    ...(fiber.changeDescription == null
      ? {}
      : { changeDescription: fiber.changeDescription }),
  };
}

function normalizeLiteEvent(
  event: LiteEvent,
  state: NormalizationState,
  stage: ScanStage,
): ScanEvent[] {
  if (
    event.kind === "profiling-hooks-status" &&
    event.available === false &&
    stage === "measurement"
  ) {
    throw new Error(
      `profiling hooks unavailable: ${event.reason ?? "unknown reason"}`,
    );
  }

  if (event.kind === "commit-start") {
    if (state.startedAt !== undefined) {
      throw new Error("commit-start received before previous commit-stop");
    }
    assertFiniteNonNegative(event.timestamp, "commit timestamp");
    state.startedAt = event.timestamp;
    state.tree = undefined;
    return [];
  }

  if (event.kind === "commit") {
    if (state.startedAt === undefined) {
      throw new Error("commit without commit-start");
    }
    if (state.tree !== undefined) {
      throw new Error("duplicate commit payload before commit-stop");
    }
    assertFiniteNonNegative(event.timestamp, "commit timestamp");
    state.tree = event.tree ?? [];
    return [];
  }

  if (event.kind !== "commit-stop") return [];
  if (state.startedAt === undefined || state.tree === undefined) {
    throw new Error("commit-stop without complete commit pair");
  }

  const durationMs = event.timestamp - state.startedAt;
  assertFiniteNonNegative(durationMs, "commit duration");
  const commitId = state.nextCommitId;
  const tree = state.tree;
  const normalized: ScanEvent[] = [
    {
      type: "commit",
      commitId,
      timestampMs: state.startedAt,
      durationMs,
    },
    ...tree.map((fiber, index) =>
      normalizeFiber(fiber, tree, index, commitId),
    ),
  ];

  state.nextCommitId += 1;
  state.startedAt = undefined;
  state.tree = undefined;
  return normalized;
}

export function installReactScanAdapter(
  options: AdapterOptions,
): AdapterHandle {
  const globalHook = (
    globalThis as typeof globalThis & {
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: RendererHook;
    }
  ).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  assertPreReactInstallation(globalHook);

  const state: NormalizationState = { nextCommitId: 1 };
  const upstream = (options.instrument ?? instrument)({
    includeFiberTree: true,
    includeProfilingHooks: true,
    recordChangeDescriptions: options.stage === "diagnosis",
    includeFiberSource: options.stage === "diagnosis",
    includeFiberIdentity: true,
    includeLaneLabels: options.stage === "diagnosis",
    onEvent(event) {
      for (const normalized of normalizeLiteEvent(event, state, options.stage)) {
        options.sink(normalized);
      }
    },
  });

  return { stop: () => upstream.stop() };
}
