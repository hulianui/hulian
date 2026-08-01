import type { PerformanceScenario } from "@hulianui/hulian-scan/browser";

import { animationParameters, animationScenario } from "./animation";
import { chartParameters, chartScenario } from "./chart";
import { dialogParameters, dialogScenario } from "./dialog";
import { formParameters, formScenario } from "./form";
import { markdownEditorParameters, markdownEditorScenario } from "./markdown-editor";
import { proTableParameters, proTableScenario } from "./pro-table";
import { selectParameters, selectScenario } from "./select";
import { tableParameters, tableScenario } from "./table";
import { treeParameters, treeScenario } from "./tree";
import { virtualListParameters, virtualListScenario } from "./virtual-list";

export interface SpecializedScenarioDefinition {
  scenario: PerformanceScenario;
  parameters: Readonly<Record<string, number>>;
}

export const specializedScenarios = {
  table: { scenario: tableScenario, parameters: tableParameters },
  proTable: { scenario: proTableScenario, parameters: proTableParameters },
  tree: { scenario: treeScenario, parameters: treeParameters },
  virtualList: { scenario: virtualListScenario, parameters: virtualListParameters },
  select: { scenario: selectScenario, parameters: selectParameters },
  dialog: { scenario: dialogScenario, parameters: dialogParameters },
  form: { scenario: formScenario, parameters: formParameters },
  chart: { scenario: chartScenario, parameters: chartParameters },
  markdownEditor: { scenario: markdownEditorScenario, parameters: markdownEditorParameters },
  animation: { scenario: animationScenario, parameters: animationParameters },
} satisfies Record<string, SpecializedScenarioDefinition>;

export const specializedScenarioById = new Map<string, PerformanceScenario>(
  Object.values(specializedScenarios).map(({ scenario }) => [scenario.id, scenario]),
);
