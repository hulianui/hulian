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
  profilingHooksAvailable?: boolean;
}

export function assertPreReactInstallation(hook: RendererHook | undefined): void {
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

  const location = source.lineNumber ? `${source.fileName}:${source.lineNumber}` : source.fileName;
  return source.columnNumber ? `${location}:${source.columnNumber}` : location;
}

function renderedInWindow(fiber: LiteFiberSummary, renderedAfterMs: number | undefined): boolean {
  if (fiber.actualDuration <= Number.EPSILON) return false;
  if (renderedAfterMs === undefined || fiber.depth === 0) return true;
  return Number.isFinite(fiber.actualStartTime) && fiber.actualStartTime >= renderedAfterMs - 0.5;
}

function selfDurationAt(tree: LiteFiberSummary[], index: number, renderedAfterMs?: number): number {
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
    if (candidate.depth === fiber.depth + 1 && renderedInWindow(candidate, renderedAfterMs)) {
      assertFiniteNonNegative(candidate.actualDuration, "fiber duration");
      directChildrenDuration += candidate.actualDuration;
    }
  }

  return Math.max(0, fiber.actualDuration - directChildrenDuration);
}

function inferredOwnerName(tree: LiteFiberSummary[], index: number): string | undefined {
  const fiber = tree[index];
  if (!fiber || fiber.depth === 0) return undefined;
  for (let ownerIndex = index - 1; ownerIndex >= 0; ownerIndex -= 1) {
    const candidate = tree[ownerIndex];
    if (!candidate || candidate.depth >= fiber.depth) continue;
    if (candidate.tag !== 5 && candidate.tag !== 6) return candidate.name;
  }
  return undefined;
}

function normalizeFiber(
  fiber: LiteFiberSummary,
  tree: LiteFiberSummary[],
  index: number,
  commitId: number,
  renderedAfterMs?: number,
): ScanEvent {
  const source = formatSource(fiber.source);
  const ownerName = fiber.ownerName ?? inferredOwnerName(tree, index);
  return {
    type: "fiber-render",
    commitId,
    ...(fiber.fiberId === undefined ? {} : { fiberId: fiber.fiberId }),
    name: fiber.name,
    ...(ownerName ? { ownerName } : {}),
    ...(source ? { source } : {}),
    depth: fiber.depth,
    actualDurationMs: fiber.actualDuration,
    selfDurationMs: selfDurationAt(tree, index, renderedAfterMs),
    ...(fiber.changeDescription == null ? {} : { changeDescription: fiber.changeDescription }),
  };
}

function normalizeCommitTree(
  tree: LiteFiberSummary[],
  state: NormalizationState,
  timestampMs: number,
  durationMs: number,
  renderedAfterMs?: number,
): ScanEvent[] {
  assertFiniteNonNegative(timestampMs, "commit timestamp");
  assertFiniteNonNegative(durationMs, "commit duration");
  const commitId = state.nextCommitId;
  const normalized: ScanEvent[] = [
    { type: "commit", commitId, timestampMs, durationMs },
    ...tree.flatMap((fiber, index) =>
      renderedInWindow(fiber, renderedAfterMs)
        ? [normalizeFiber(fiber, tree, index, commitId, renderedAfterMs)]
        : [],
    ),
  ];
  state.nextCommitId += 1;
  return normalized;
}

function normalizeLiteEvent(event: LiteEvent, state: NormalizationState): ScanEvent[] {
  if (event.kind === "profiling-hooks-status") {
    state.profilingHooksAvailable = event.available;
    return [];
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
      if (state.profilingHooksAvailable !== false) {
        throw new Error("commit without commit-start");
      }
      const tree = event.tree ?? [];
      const durationMs = tree
        .filter((fiber) => fiber.depth === 0)
        .reduce((total, fiber) => {
          assertFiniteNonNegative(fiber.actualDuration, "fiber duration");
          return total + fiber.actualDuration;
        }, 0);
      return normalizeCommitTree(
        tree,
        state,
        Math.max(0, event.timestamp - durationMs),
        durationMs,
        Math.max(0, event.timestamp - durationMs),
      );
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
  const tree = state.tree;
  const normalized = normalizeCommitTree(tree, state, state.startedAt, durationMs);

  state.startedAt = undefined;
  state.tree = undefined;
  return normalized;
}

export function installReactScanAdapter(options: AdapterOptions): AdapterHandle {
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
    minFiberActualDurationMs: Number.EPSILON,
    onEvent(event) {
      for (const normalized of normalizeLiteEvent(event, state)) {
        options.sink(normalized);
      }
    },
  });

  return { stop: () => upstream.stop() };
}
