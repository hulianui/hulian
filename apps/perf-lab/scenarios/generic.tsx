import { useState } from "react";

import type { Control, ShowcaseSpec } from "@hulianui/ui";
import { definePerformanceScenario, type PerformanceScenario } from "@hulianui/hulian-scan/browser";

import type { GeneratedScenarioMetadata } from "./contract";

interface GenericController {
  parentUpdate?: () => void;
  propsUpdate?: () => void;
  stressUpdate?: (index: number) => void;
  unmount?: () => void;
}

function nextPaint(): Promise<void> {
  if (typeof requestAnimationFrame !== "function") {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

function rootFor(id: string): HTMLElement {
  const root = document.querySelector<HTMLElement>(
    `[data-hulian-scan-scenario=${JSON.stringify(id)}]`,
  );
  if (!root) throw new Error(`scenario is not mounted: ${id}`);
  return root;
}

function distinctControlValue(control: Control): string | number | boolean | undefined {
  switch (control.type) {
    case "boolean":
      return !Boolean(control.defaultValue);
    case "number":
      return Number(control.defaultValue) + 1;
    case "text":
      return `${String(control.defaultValue)}-hulian-scan`;
    case "select":
      return control.options?.find((value) => value !== control.defaultValue);
  }
}

function defaultProps(showcase: ShowcaseSpec): Record<string, unknown> {
  return Object.fromEntries(
    showcase.controls.map((control) => [control.prop, control.defaultValue]),
  );
}

function GenericFixture({
  id,
  showcase,
  initialRender,
  controllable,
  controller,
}: {
  id: string;
  showcase: ShowcaseSpec;
  initialRender: () => React.ReactNode;
  controllable?: { control: Control; alternate: string | number | boolean };
  controller: GenericController;
}) {
  const [parentTick, setParentTick] = useState(0);
  const [props, setProps] = useState(() => defaultProps(showcase));
  const [usesControlledPreview, setUsesControlledPreview] = useState(false);
  const [visible, setVisible] = useState(true);

  controller.parentUpdate = () => setParentTick((value) => value + 1);
  controller.propsUpdate = controllable
    ? () => {
        setUsesControlledPreview(true);
        setProps((current) => ({
          ...current,
          [controllable.control.prop]: controllable.alternate,
        }));
      }
    : undefined;
  controller.stressUpdate = (index) => {
    if (!controllable) {
      setParentTick((value) => value + 1);
      return;
    }
    setUsesControlledPreview(true);
    setProps((current) => ({
      ...current,
      [controllable.control.prop]:
        index % 2 === 0 ? controllable.alternate : controllable.control.defaultValue,
    }));
  };
  controller.unmount = () => setVisible(false);

  return (
    <div data-hulian-scan-scenario={id} data-hulian-scan-parent-tick={parentTick}>
      {visible ? (usesControlledPreview ? showcase.renderWithProps(props) : initialRender()) : null}
    </div>
  );
}

function firstInteractive(root: HTMLElement): HTMLElement | undefined {
  return [...root.querySelectorAll<HTMLElement>("button,input,select,textarea,[role=button]")].find(
    (element) => !element.matches(":disabled") && element.getAttribute("aria-disabled") !== "true",
  );
}

export async function createGenericScenario(
  metadata: GeneratedScenarioMetadata,
  showcase: ShowcaseSpec,
): Promise<PerformanceScenario> {
  const initialRender = showcase.examples?.[0]?.render ?? showcase.states[0]?.render;
  if (!initialRender) {
    throw new Error(`${metadata.id} showcase has no example or state render`);
  }
  const controllable = showcase.controls.flatMap((control) => {
    const alternate = distinctControlValue(control);
    return alternate === undefined ? [] : [{ control, alternate }];
  })[0];
  const controller: GenericController = {};
  const assertMounted = (): HTMLElement => rootFor(metadata.scenarioId);

  return definePerformanceScenario({
    id: metadata.scenarioId,
    component: metadata.component,
    entry: metadata.entry,
    category: metadata.category,
    render: () => (
      <GenericFixture
        id={metadata.scenarioId}
        showcase={showcase}
        initialRender={initialRender}
        controllable={controllable}
        controller={controller}
      />
    ),
    steps: [
      {
        id: "mount-assertion",
        kind: "mount",
        run: async () => {
          const root = assertMounted();
          if (!root.hasChildNodes()) {
            throw new Error(`${metadata.id} rendered no DOM`);
          }
        },
      },
      {
        id: "stable-parent-update",
        kind: "parent-update",
        run: async () => {
          if (!controller.parentUpdate) throw new Error("parent controller missing");
          controller.parentUpdate();
          await nextPaint();
        },
      },
      {
        id: controllable
          ? `props-update:${controllable.control.prop}`
          : "props-update:not-applicable-no-distinct-control",
        kind: "props-update",
        run: async () => {
          assertMounted();
          controller.propsUpdate?.();
          await nextPaint();
        },
      },
      {
        id: "interaction:first-enabled-control-or-not-applicable",
        kind: "interaction",
        label: "First enabled button, input, select, textarea, or role=button",
        run: async () => {
          const target = firstInteractive(assertMounted());
          target?.click();
          await nextPaint();
        },
      },
      {
        id: controllable ? `stress:${controllable.control.prop}` : "stress:stable-parent-update",
        kind: "stress",
        run: async () => {
          if (!controller.stressUpdate) throw new Error("stress controller missing");
          for (let index = 0; index < 10; index += 1) {
            controller.stressUpdate(index);
            await nextPaint();
          }
        },
      },
      {
        id: "unmount-observe",
        kind: "unmount",
        run: async () => {
          if (!controller.unmount) throw new Error("unmount controller missing");
          controller.unmount();
          await new Promise((resolve) => setTimeout(resolve, 250));
          if (assertMounted().hasChildNodes()) {
            throw new Error(`${metadata.id} retained DOM after scenario unmount`);
          }
        },
      },
    ],
    budgets: {},
  });
}
