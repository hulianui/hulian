import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@hulianui/ui/select";
import { definePerformanceScenario } from "@hulianui/hulian-scan/browser";

import { inputValue, invoke, nextPaint, rootFor, type ScenarioController } from "./shared";

export const selectParameters = { options: 1_000 } as const;
const id = "select/stress";
const controller: ScenarioController = {};
const options = Array.from({ length: selectParameters.options }, (_, index) => ({
  value: `option-${index}`,
  label: `性能选项 ${index}`,
}));

export function selectSearchInput(root: ParentNode = document): HTMLInputElement | null {
  return root.querySelector<HTMLInputElement>('input[placeholder="搜索"]');
}

function Fixture() {
  const [value, setValue] = useState<string | null>(null);
  controller["open"] = () => {
    rootFor(id).querySelector<HTMLButtonElement>("button")?.click();
  };
  controller["keyboard"] = () => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
  };
  controller["search"] = () => {
    const input = selectSearchInput();
    if (!input) throw new Error("select search input is missing");
    inputValue(input, "性能选项 999");
  };
  controller["choose"] = () => {
    const candidate = [...document.querySelectorAll<HTMLElement>("[role=option]")].find((item) =>
      item.textContent?.includes("性能选项 999"),
    );
    if (!candidate) {
      const rendered = [...document.querySelectorAll<HTMLElement>("[role=option]")]
        .map((item) => item.textContent)
        .join(" | ");
      const filteredCount = document
        .querySelector("[data-hulian-virtual-count]")
        ?.getAttribute("data-hulian-virtual-count");
      const input = selectSearchInput();
      throw new Error(
        `filtered select option is missing; input: ${input?.value ?? "missing"}; filtered count: ${filteredCount ?? "unknown"}; rendered options: ${rendered || "none"}`,
      );
    }
    candidate.click();
  };
  controller["close"] = () => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  };
  controller["reopen"] = () => {
    rootFor(id).querySelector<HTMLButtonElement>("button")?.click();
  };
  return (
    <div data-hulian-scan-scenario={id} className="w-80">
      <Select items={options} value={value} onValueChange={setValue} searchable>
        <SelectTrigger />
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

async function action(name: string): Promise<void> {
  await invoke(controller, name);
  await nextPaint();
}

export const selectScenario = definePerformanceScenario({
  id,
  component: "Select",
  entry: "@hulianui/ui/select",
  category: "heavy",
  render: () => <Fixture />,
  steps: [
    {
      id: "open-1000-options",
      kind: "interaction",
      label: "Open 1000 searchable options",
      run: () => action("open"),
    },
    {
      id: "keyboard-navigation",
      kind: "interaction",
      label: "Navigate options with the keyboard",
      run: () => action("keyboard"),
    },
    {
      id: "search-options",
      kind: "interaction",
      label: "Search 1000 options",
      run: () => action("search"),
    },
    {
      id: "choose-option",
      kind: "interaction",
      label: "Choose the filtered option",
      run: () => action("choose"),
    },
    {
      id: "close",
      kind: "interaction",
      label: "Close the select popup",
      run: () => action("close"),
    },
    { id: "reopen", kind: "stress", run: () => action("reopen") },
  ],
  budgets: {},
});
