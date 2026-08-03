import type { ScenarioCategory } from "@hulianui/hulian-scan/browser";

export interface GeneratedScenarioMetadata {
  id: string;
  scenarioId: string;
  component: string;
  entry: string;
  category: ScenarioCategory;
  categories: readonly string[];
  animated: boolean;
  webgl: boolean;
  source: string;
}
