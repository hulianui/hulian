// 元素 → 路径解析（无 React / 无副作用 / 不写目标文档）。
//
// 抽成纯函数的理由：jsdom 有完整的 DOM 查询能力（querySelector / parentElement / nth-of-type
// 全可信），但 getBoundingClientRect 恒为 0 —— 所以「路径」这层能在 jsdom 里认真测，
// 「几何」那层只能测形状（见 overlay-geometry.ts）。两层拆开，测试才不会假绿。
//
// 两套路径并存，优先级固定：
//   ① marked      —— 读被预览树自己打的标记属性（data-hulian-path），最稳，跨重排不失效；
//   ② structural  —— 读不到标记时回退到结构化选择器（div > section:nth-of-type(2) > button）。
// 消费方拿到 source 字段就知道这条路径的可靠程度，不必猜。

/** 路径来源：读自标记属性 / 由 DOM 结构推导。 */
export type ElementPathSource = "marked" | "structural";

export interface ElementPathOptions {
  /** 标记路径的属性名。默认 `data-hulian-path`。 */
  pathAttribute?: string;
  /** 标记组件名的属性名。默认 `data-hulian-component`。 */
  componentAttribute?: string;
  /**
   * 结构化路径遇到带 id 的祖先时是否就此锚定（不再上溯到 root）。默认 true。
   * 锚定让路径更短、且不受无关兄弟节点增删影响；关掉则始终给出从 root 起的完整链路。
   */
  anchorOnId?: boolean;
}

export interface ElementPathResult {
  /** 路径字符串（marked 时为标记原值，structural 时为相对 root 的 CSS 选择器）。 */
  path: string;
  /** 路径来源。 */
  source: ElementPathSource;
  /** 就近读到的组件名（`data-hulian-component`），没有则 null。 */
  component: string | null;
  /** 路径实际指向的元素 —— 读到祖先标记时会比传入的元素更靠上。 */
  element: Element;
}

export const DEFAULT_PATH_ATTRIBUTE = "data-hulian-path";
export const DEFAULT_COMPONENT_ATTRIBUTE = "data-hulian-component";

/**
 * 跨 realm 安全的「这是不是元素」判断。
 *
 * iframe 里的元素属于 iframe 自己的 realm，它们**不是**宿主 realm 的 `Element` 实例，
 * `node instanceof Element` 恒 false —— 这是同源 iframe 场景最容易踩的静默失效。
 * 改用 nodeType 鸭子判断，两个 realm 都成立。
 */
export function asElement(node: unknown): Element | null {
  const n = node as { nodeType?: number; tagName?: unknown } | null | undefined;
  if (!n || n.nodeType !== 1 || typeof n.tagName !== "string") return null;
  return n as unknown as Element;
}

/** 转义属性选择器里的值（`[attr="value"]` 形式，只需处理反斜杠与双引号）。 */
export function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** 转义 CSS 标识符（id）。优先用原生 CSS.escape，缺失时退到保守转义。 */
function escapeIdentifier(value: string): string {
  const css = (globalThis as { CSS?: { escape?: (v: string) => string } }).CSS;
  if (typeof css?.escape === "function") return css.escape(value);
  return value.replace(/[^\w-]/g, (c) => `\\${c}`);
}

/** id 是否适合作为锚点：必须以字母/下划线/连字符开头（数字开头的 id 选择器需要转义且易错，直接不用）。 */
function isAnchorableId(id: string | null): id is string {
  return !!id && /^[A-Za-z_-]/.test(id);
}

/**
 * 从 el 起向上找第一个带指定属性且值非空的元素（**不含 root 自身**）。
 *
 * 不含 root 是刻意的：root 上如果也挂了标记，所有元素都会解析成同一条路径，
 * 「选中谁」的信息就没了 —— 那种退化比读不到标记更糟。
 */
export function findMarkedElement(el: Element, root: Element, attribute: string): Element | null {
  let cur: Element | null = el;
  while (cur && cur !== root) {
    const value = cur.getAttribute?.(attribute);
    if (value) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function segmentOf(el: Element, anchorOnId: boolean): string {
  const tag = el.tagName.toLowerCase();
  const id = el.getAttribute("id");
  if (anchorOnId && isAnchorableId(id)) return `${tag}#${escapeIdentifier(id)}`;
  const parent = el.parentElement;
  if (!parent) return tag;
  const sameType = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
  if (sameType.length < 2) return tag;
  // nth-of-type 按「同 tag 兄弟」计数，正好等于 sameType 里的序号（1 起）。
  return `${tag}:nth-of-type(${sameType.indexOf(el) + 1})`;
}

/**
 * 结构化路径：从 root 内部一路拼到 el，形如 `div > section:nth-of-type(2) > button`。
 *
 * 路径**相对 root**（不含 root 自身），因此可以直接喂给 `root.querySelector()`。
 * el 就是 root、或 el 不在 root 里 → 返回空串（调用方据此判定「没有可用路径」）。
 */
export function structuralPath(el: Element, root: Element, options: ElementPathOptions = {}): string {
  const { anchorOnId = true } = options;
  if (el === root) return "";
  const segments: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root) {
    const segment = segmentOf(cur, anchorOnId);
    segments.unshift(segment);
    // 命中 id 锚点：路径到此为止（`#app > div > button` 依然能被 querySelector 解析）。
    if (segment.includes("#")) return segments.join(" > ");
    cur = cur.parentElement;
  }
  if (!cur) return ""; // 走到 document 顶都没碰到 root → el 不在 root 内
  return segments.join(" > ");
}

/**
 * 解析元素路径：先读标记属性，读不到再回退结构化路径。
 * el 是 root 自身或不在 root 内 → null（root 不可被选中）。
 */
export function elementPath(
  el: Element,
  root: Element,
  options: ElementPathOptions = {},
): ElementPathResult | null {
  const {
    pathAttribute = DEFAULT_PATH_ATTRIBUTE,
    componentAttribute = DEFAULT_COMPONENT_ATTRIBUTE,
  } = options;
  if (el === root || !root.contains(el)) return null;

  const marked = findMarkedElement(el, root, pathAttribute);
  const target = marked ?? el;
  const componentHost = findMarkedElement(target, root, componentAttribute);
  const component = componentHost?.getAttribute(componentAttribute) ?? null;

  if (marked) {
    return { path: marked.getAttribute(pathAttribute)!, source: "marked", component, element: marked };
  }
  const path = structuralPath(el, root, options);
  if (!path) return null;
  return { path, source: "structural", component, element: el };
}

/**
 * 路径 → 元素（受控 `selectedPath` 回填用）。
 * 先当标记路径查 `[data-hulian-path="…"]`，未命中再当 CSS 选择器查。
 * 非法选择器不抛错，返回 null。
 */
export function resolveElementByPath(
  root: Element,
  path: string,
  options: ElementPathOptions = {},
): Element | null {
  const { pathAttribute = DEFAULT_PATH_ATTRIBUTE } = options;
  if (!path) return null;
  const marked = root.querySelector(`[${pathAttribute}="${escapeAttributeValue(path)}"]`);
  if (marked) return marked;
  try {
    return root.querySelector(path);
  } catch {
    return null;
  }
}

/**
 * 标签文案：有组件名用组件名，否则取路径末段（`>` 与 `/` 都算分隔符，
 * 因为标记路径常写成 `App/Header/Logo` 这类树形串）。
 */
export function pathLabel(path: string, component?: string | null): string {
  if (component) return component;
  const segments = path.split(/[>/]/);
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const seg = segments[i]!.trim();
    if (seg) return seg;
  }
  return "";
}
