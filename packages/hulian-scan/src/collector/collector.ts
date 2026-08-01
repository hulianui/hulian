import type { ScanEvent } from "../contracts";

export interface ScanCollector {
  accept(event: ScanEvent): void;
  beginStep(stepId: string, atMs: number): void;
  endStep(stepId: string, atMs: number): void;
  finalize(): { events: ScanEvent[]; errors: string[] };
}

export function createCollector(): ScanCollector {
  const events: ScanEvent[] = [];
  const open = new Map<string, number>();
  const errors: string[] = [];

  return {
    accept(event) {
      const activeStepIds = [...open.keys()];
      events.push(
        activeStepIds.length === 1
          ? { ...event, stepId: activeStepIds[0] }
          : event,
      );
    },
    beginStep(stepId, atMs) {
      if (open.has(stepId)) {
        errors.push(`step already open: ${stepId}`);
        return;
      }
      open.set(stepId, atMs);
    },
    endStep(stepId, atMs) {
      const start = open.get(stepId);
      if (start === undefined || atMs < start) {
        errors.push(`invalid step window: ${stepId}`);
      }
      open.delete(stepId);
    },
    finalize() {
      for (const stepId of open.keys()) {
        errors.push(`step not closed: ${stepId}`);
      }
      if (!events.some((event) => event.type === "commit")) {
        errors.push("no React commit captured");
      }
      return { events: [...events], errors: [...errors] };
    },
  };
}
