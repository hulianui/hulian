import type { FiberRenderEvent, ScenarioRun } from "../contracts";
import type { ValueChange } from "./compare";

export interface Diagnosis {
  fiberId?: number;
  component: string;
  ownerChain: string[];
  props: Record<string, ValueChange>;
  state: Record<string, ValueChange>;
  context: Record<string, ValueChange>;
  hooks: Record<string, ValueChange>;
}

function changed(): ValueChange {
  return { kind: "changed", visitedEntries: 0, skipped: [] };
}

function dataProperty(record: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function numberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is number => Number.isInteger(entry))
    : [];
}

function diagnoseEvent(event: FiberRenderEvent): Diagnosis | undefined {
  const description = event.changeDescription;
  if (typeof description !== "object" || description === null) return undefined;

  const props = Object.fromEntries(
    stringArray(dataProperty(description, "props")).map((name) => [name, changed()]),
  );
  const state: Record<string, ValueChange> =
    dataProperty(description, "state") === true ? { state: changed() } : {};
  const context: Record<string, ValueChange> =
    dataProperty(description, "context") === true
      ? { context: changed() }
      : {};
  const hooks = Object.fromEntries(
    numberArray(dataProperty(description, "hooks")).map((index) => [
      String(index),
      changed(),
    ]),
  );

  return {
    ...(event.fiberId === undefined ? {} : { fiberId: event.fiberId }),
    component: event.name,
    ownerChain: event.ownerName
      ? [event.ownerName, event.name]
      : [event.name],
    props,
    state,
    context,
    hooks,
  };
}

export function diagnoseRun(run: ScenarioRun): Diagnosis[] {
  return run.events
    .filter((event): event is FiberRenderEvent => event.type === "fiber-render")
    .map(diagnoseEvent)
    .filter((diagnosis): diagnosis is Diagnosis => diagnosis !== undefined);
}
