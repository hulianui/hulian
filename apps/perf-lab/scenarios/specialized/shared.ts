export interface ScenarioController {
  [key: string]: (() => void | Promise<void>) | undefined;
}

export function nextPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function rootFor(id: string): HTMLElement {
  const root = document.querySelector<HTMLElement>(
    `[data-hulian-scan-scenario=${JSON.stringify(id)}]`,
  );
  if (!root) throw new Error(`scenario is not mounted: ${id}`);
  return root;
}

export function invoke(controller: ScenarioController, action: string): Promise<void> {
  const operation = controller[action];
  if (!operation) throw new Error(`scenario controller action is missing: ${action}`);
  return Promise.resolve(operation());
}

export function inputValue(element: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}
