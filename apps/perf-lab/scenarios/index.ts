import type { PerformanceScenario } from "@hulianui/hulian-scan/browser";

import { knownBadScenario } from "../fixtures/known-bad";
import { knownGoodScenario } from "../fixtures/known-good";
import { createGenericScenario } from "./generic";
import { scenarioLoaders, scenarioMetadata } from "./generated";
import { specializedScenarioById } from "./specialized";
import { createAnimationScenario } from "./specialized/animation";

const fixed = new Map<string, PerformanceScenario>([
  [knownBadScenario.id, knownBadScenario],
  [knownGoodScenario.id, knownGoodScenario],
  ...specializedScenarioById,
]);
const cache = new Map(fixed);

export function listScenarioIds(): string[] {
  return [
    ...fixed.keys(),
    ...Object.values(scenarioMetadata).map((entry) => entry.scenarioId),
  ].sort();
}

export async function loadScenario(id: string): Promise<PerformanceScenario> {
  const cachedScenario = cache.get(id);
  if (cachedScenario) return cachedScenario;
  const metadata = Object.values(scenarioMetadata).find((entry) => entry.scenarioId === id);
  if (!metadata) throw new Error(`unknown performance scenario: ${id}`);
  const loader = scenarioLoaders[metadata.id as keyof typeof scenarioLoaders];
  if (!loader) throw new Error(`scenario loader missing: ${metadata.id}`);
  const showcase = await loader();
  const scenario =
    metadata.category === "animation"
      ? await createAnimationScenario(metadata, showcase)
      : await createGenericScenario(metadata, showcase);
  cache.set(id, scenario);
  return scenario;
}
