import { describe, expect, it, vi } from "vitest";

import type { ScanEvent } from "../contracts";
import {
  assertPreReactInstallation,
  installReactScanAdapter,
} from "./react-scan-lite";

describe("installReactScanAdapter", () => {
  it("normalizes Lite commit data without leaking upstream fields", () => {
    const sink: ScanEvent[] = [];
    const stop = vi.fn();
    const handle = installReactScanAdapter({
      stage: "measurement",
      sink: (event) => sink.push(event),
      instrument: (options = {}) => {
        options.onEvent?.({ kind: "commit-start", timestamp: 10 } as never);
        options.onEvent?.({
          kind: "commit",
          timestamp: 12,
          rendererId: 1,
          tree: [
            {
              name: "Button",
              depth: 0,
              tag: 0,
              actualDuration: 3,
              actualStartTime: 8,
              selfBaseDuration: 2,
              treeBaseDuration: 3,
              fiberId: 7,
              ownerName: "Fixture",
              source: { fileName: "button.tsx", lineNumber: 10 },
            },
            {
              name: "span",
              depth: 1,
              tag: 5,
              actualDuration: 1,
              actualStartTime: 9,
              selfBaseDuration: 1,
              treeBaseDuration: 1,
            },
            {
              name: "StableSibling",
              depth: 1,
              tag: 0,
              actualDuration: 0,
              actualStartTime: 0,
              selfBaseDuration: 5,
              treeBaseDuration: 5,
            },
          ],
        } as never);
        options.onEvent?.({ kind: "commit-stop", timestamp: 14 } as never);
        return { stop, isActive: () => true, subscribe: () => () => {} };
      },
    });

    expect(sink).toContainEqual({
      type: "commit",
      commitId: 1,
      timestampMs: 10,
      durationMs: 4,
    });
    expect(sink).toContainEqual({
      type: "fiber-render",
      commitId: 1,
      fiberId: 7,
      name: "Button",
      ownerName: "Fixture",
      source: "button.tsx:10",
      depth: 0,
      actualDurationMs: 3,
      selfDurationMs: 2,
    });
    expect(JSON.stringify(sink)).not.toMatch(/fiberRoot|bippy|selfBaseDuration/);
    expect(sink).not.toContainEqual(
      expect.objectContaining({ name: "StableSibling" }),
    );

    handle.stop();
    expect(stop).toHaveBeenCalledOnce();
  });

  it("rejects malformed commit pairs and invalid durations", () => {
    expect(() =>
      installReactScanAdapter({
        stage: "measurement",
        sink: () => undefined,
        instrument: (options = {}) => {
          options.onEvent?.({ kind: "commit-stop", timestamp: 12 } as never);
          return {
            stop: () => undefined,
            isActive: () => true,
            subscribe: () => () => {},
          };
        },
      }),
    ).toThrow(/commit-stop without complete commit pair/);

    expect(() =>
      installReactScanAdapter({
        stage: "measurement",
        sink: () => undefined,
        instrument: (options = {}) => {
          options.onEvent?.({ kind: "commit-start", timestamp: 12 } as never);
          options.onEvent?.({ kind: "commit", timestamp: 12, tree: [] } as never);
          options.onEvent?.({ kind: "commit-stop", timestamp: 10 } as never);
          return {
            stop: () => undefined,
            isActive: () => true,
            subscribe: () => () => {},
          };
        },
      }),
    ).toThrow(/invalid commit duration/);
  });

  it("falls back to commit tree timing when React 19.2 omits profiling hooks", () => {
    const sink: ScanEvent[] = [];
    expect(() =>
      installReactScanAdapter({
        stage: "measurement",
        sink: (event) => sink.push(event),
        instrument: (options = {}) => {
          options.onEvent?.({
            kind: "profiling-hooks-status",
            timestamp: 1,
            available: false,
            reason: "no-inject-method",
          } as never);
          options.onEvent?.({
            kind: "commit",
            timestamp: 5,
            tree: [
              {
                name: "Button",
                depth: 0,
                tag: 0,
                actualDuration: 2,
                actualStartTime: 3,
                selfBaseDuration: 1,
                treeBaseDuration: 2,
              },
            ],
          } as never);
          return {
            stop: () => undefined,
            isActive: () => true,
            subscribe: () => () => {},
          };
        },
      }),
    ).not.toThrow();
    expect(sink).toContainEqual({
      type: "commit",
      commitId: 1,
      timestampMs: 3,
      durationMs: 2,
    });
  });
});

describe("assertPreReactInstallation", () => {
  it("fails when React already owns the renderer hook", () => {
    expect(() =>
      assertPreReactInstallation({ renderers: new Map([[1, {}]]) }),
    ).toThrow(/before React/);
  });
});
