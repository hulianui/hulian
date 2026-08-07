// 场景 profile 的加载与查询。真源是同目录的 agent-profiles.json。
//
// 三维正交（见 issue #41 的讨论）：
//   surface   决定组件语言 —— 这个页面该用什么
//   modifiers 决定约束与预算 —— 可组合，一个移动端 AI 产品是 ai-product + [mobile]
//   workflow  决定任务步骤 —— audit / dogfood / migrate 本就不是页面场景
//
// 刻意不做的事：不在这里判断「项目属于哪个 surface」。自动判定需要读消费项目的
// 文件，属于 inspect_project / audit 的职责（#43），这里只提供判定所需的 signals。
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PROFILES_PATH = fileURLToPath(new URL("./agent-profiles.json", import.meta.url));

let cached = null;

/** 读取 profile 真源（进程内缓存一次）。 */
export function loadProfiles() {
  if (!cached) cached = JSON.parse(readFileSync(PROFILES_PATH, "utf8"));
  return cached;
}

export function listSurfaces() {
  return loadProfiles().surfaces;
}

export function listModifiers() {
  return loadProfiles().modifiers;
}

export function listWorkflows() {
  return loadProfiles().workflows;
}

export function getSurface(id) {
  return loadProfiles().surfaces.find((s) => s.id === id) ?? null;
}

export function getModifier(id) {
  return loadProfiles().modifiers.find((m) => m.id === id) ?? null;
}

export function getWorkflow(id) {
  return loadProfiles().workflows.find((w) => w.id === id) ?? null;
}

/** 该 profile 建议用到的全部组件 slug（去重）。 */
export function surfaceComponents(surface) {
  const out = new Set();
  for (const list of Object.values(surface?.componentRoles ?? {}))
    for (const s of list) out.add(s);
  return [...out];
}

/**
 * 组合一个 surface 与若干 modifier，得到本次任务的完整约束。
 * modifier 的 require / consider 追加到组件建议，constraints 与 verification 合并。
 */
export function composeProfile({ surface: surfaceId, modifiers = [], workflow: workflowId } = {}) {
  const surface = surfaceId ? getSurface(surfaceId) : null;
  const mods = modifiers.map((m) => getModifier(m)).filter(Boolean);
  const workflow = workflowId ? getWorkflow(workflowId) : null;

  const unknown = [
    ...(surfaceId && !surface ? [`surface: ${surfaceId}`] : []),
    ...modifiers.filter((m) => !getModifier(m)).map((m) => `modifier: ${m}`),
    ...(workflowId && !workflow ? [`workflow: ${workflowId}`] : []),
  ];

  return {
    surface,
    modifiers: mods,
    workflow,
    unknown,
    components: [
      ...new Set([
        ...(surface ? surfaceComponents(surface) : []),
        ...mods.flatMap((m) => [...(m.require ?? []), ...(m.consider ?? [])]),
      ]),
    ],
    preferPages: surface?.preferPages ?? [],
    preferBlocks: surface?.preferBlocks ?? [],
    constraints: [
      ...(surface?.avoid ?? []).map((a) => `避免：${a}`),
      ...mods.flatMap((m) => m.constraints ?? []),
    ],
    verification: [
      ...new Set([
        ...(surface?.verification ?? []),
        ...mods.flatMap((m) => m.verification ?? []),
      ]),
    ],
    steps: workflow?.steps ?? [],
  };
}

/**
 * 校验 profile 引用的 slug 都真实存在于 registry。
 * 供测试与生成期门禁调用 —— profile 里写一个不存在的组件，等于让模型去 import
 * 一个查不到的东西，比不给建议更糟。
 *
 * @param {{items: Array<{name: string, type: string}>}} registry
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateProfiles(registry) {
  const profiles = loadProfiles();
  const ui = new Set(
    registry.items.filter((i) => i.type === "registry:ui").map((i) => i.name),
  );
  const blocks = new Set(
    registry.items.filter((i) => i.type === "registry:block").map((i) => i.name),
  );
  const errors = [];
  const warnings = [];

  const checkComponents = (list, where) => {
    for (const slug of list ?? [])
      if (!ui.has(slug)) errors.push(`${where}: 组件 "${slug}" 不在 registry 中`);
  };

  // detect / avoidGroups 是 audit 自动判场景的判据（#43）。写错的 slug 或分类不会报错，
  // 只会让判定**永远落空** —— 静默失效比报错更难发现，所以必须在这里挡住。
  const allCategories = new Set(
    registry.items.filter((i) => i.type === "registry:ui").flatMap((i) => i.categories ?? []),
  );
  // avoidGroups 允许两种写法：整类 "mockups"，或类下的一组 "decoration/backdrop"。
  // 后者必须是 registry 里真实存在的 category/group 组合，写错同样静默落空。
  const allGroupPaths = new Set(
    registry.items
      .filter((i) => i.type === "registry:ui")
      .flatMap((i) => (i.categories ?? []).map((c) => (i.meta?.group ? `${c}/${i.meta.group}` : null)))
      .filter(Boolean),
  );
  const checkDetect = (detect, where) => {
    checkComponents(detect?.components, `${where}/detect.components`);
    for (const key of Object.keys(detect ?? {}))
      if (!["paths", "deps", "components"].includes(key))
        warnings.push(`${where}: detect 里有未知键 "${key}"，不会被使用`);
  };

  const seenSurface = new Set();
  for (const s of profiles.surfaces) {
    if (seenSurface.has(s.id)) errors.push(`surface id 重复: ${s.id}`);
    seenSurface.add(s.id);
    if (!s.intent) errors.push(`surface ${s.id}: 缺 intent`);
    checkDetect(s.detect, `surface ${s.id}`);
    for (const entry of s.avoidGroups ?? [])
      if (!allCategories.has(entry) && !allGroupPaths.has(entry))
        errors.push(
          `surface ${s.id}: avoidGroups 里的 "${entry}" 既不是 registry 中的分类，也不是真实的 <分类>/<组>`,
        );
    // allowEffects / preferEffects 里的 slug 写错 = 发掘面静默少一件，同样要挡（#140）。
    checkComponents(s.allowEffects, `surface ${s.id}/allowEffects`);
    checkComponents(s.preferEffects, `surface ${s.id}/preferEffects`);
    if (s.visualBudget && !Array.isArray(s.visualBudget.slots))
      errors.push(`surface ${s.id}: visualBudget 缺 slots（说明允许放在哪些位置）`);
    if (!s.componentRoles || !Object.keys(s.componentRoles).length)
      errors.push(`surface ${s.id}: 缺 componentRoles`);
    for (const [role, list] of Object.entries(s.componentRoles ?? {}))
      checkComponents(list, `surface ${s.id}/${role}`);
    for (const p of s.preferPages ?? [])
      if (!blocks.has(p)) errors.push(`surface ${s.id}: page "${p}" 不在 registry 中`);
    for (const b of s.preferBlocks ?? [])
      if (!blocks.has(b)) errors.push(`surface ${s.id}: block "${b}" 不在 registry 中`);
    if (!(s.preferPages?.length || s.preferBlocks?.length) && !s.maturity)
      warnings.push(`surface ${s.id}: 没有任何 page/block 候选，且未说明原因`);
  }

  const seenMod = new Set();
  for (const m of profiles.modifiers) {
    if (seenMod.has(m.id)) errors.push(`modifier id 重复: ${m.id}`);
    seenMod.add(m.id);
    checkDetect(m.detect, `modifier ${m.id}`);
    checkComponents(m.require, `modifier ${m.id}/require`);
    checkComponents(m.consider, `modifier ${m.id}/consider`);
    if (!m.constraints?.length) warnings.push(`modifier ${m.id}: 没有 constraints`);
  }

  const seenWf = new Set();
  for (const w of profiles.workflows) {
    if (seenWf.has(w.id)) errors.push(`workflow id 重复: ${w.id}`);
    seenWf.add(w.id);
    if (!w.steps?.length) errors.push(`workflow ${w.id}: 缺 steps`);
  }

  checkComponents(profiles.metrics?.highLevelComponents, "metrics/highLevelComponents");

  return { errors, warnings };
}
