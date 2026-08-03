export interface CompareLimits {
  maxDepth: number;
  maxEntries: number;
}

export interface ValueChange {
  kind: "same-reference" | "equal-by-value" | "changed" | "truncated";
  visitedEntries: number;
  skipped: string[];
}

type ChangeKind = ValueChange["kind"];

interface CompareState {
  limits: CompareLimits;
  visitedEntries: number;
  skipped: Set<string>;
  pairs: WeakMap<object, WeakSet<object>>;
}

function isObject(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function isReactElement(value: object): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(value, "$$typeof");
  if (!descriptor || !("value" in descriptor)) return false;
  return (
    descriptor.value === Symbol.for("react.element") ||
    descriptor.value === Symbol.for("react.transitional.element")
  );
}

function rememberPair(left: object, right: object, state: CompareState): boolean {
  const rights = state.pairs.get(left);
  if (rights?.has(right)) return true;
  if (rights) {
    rights.add(right);
  } else {
    state.pairs.set(left, new WeakSet([right]));
  }
  return false;
}

function combine(kinds: ChangeKind[]): ChangeKind {
  if (kinds.includes("changed")) return "changed";
  if (kinds.includes("truncated")) return "truncated";
  return "equal-by-value";
}

function keyLabel(key: PropertyKey): string {
  return typeof key === "symbol" ? key.description ?? key.toString() : String(key);
}

function compareMaps(
  left: Map<unknown, unknown>,
  right: Map<unknown, unknown>,
  depth: number,
  state: CompareState,
): ChangeKind {
  const sizeGetter = Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get;
  const leftSize = sizeGetter?.call(left) as number | undefined;
  const rightSize = sizeGetter?.call(right) as number | undefined;
  if (leftSize !== rightSize) return "changed";

  const leftEntries = Map.prototype.entries.call(left) as IterableIterator<
    [unknown, unknown]
  >;
  const rightEntries = Map.prototype.entries.call(right) as IterableIterator<
    [unknown, unknown]
  >;
  const kinds: ChangeKind[] = [];
  while (true) {
    const leftEntry = leftEntries.next();
    const rightEntry = rightEntries.next();
    if (leftEntry.done || rightEntry.done) {
      if (leftEntry.done !== rightEntry.done) return "changed";
      break;
    }
    kinds.push(compareInternal(leftEntry.value[0], rightEntry.value[0], depth + 1, state));
    kinds.push(compareInternal(leftEntry.value[1], rightEntry.value[1], depth + 1, state));
    if (kinds.includes("changed")) return "changed";
  }
  return combine(kinds);
}

function compareSets(
  left: Set<unknown>,
  right: Set<unknown>,
  depth: number,
  state: CompareState,
): ChangeKind {
  const sizeGetter = Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get;
  const leftSize = sizeGetter?.call(left) as number | undefined;
  const rightSize = sizeGetter?.call(right) as number | undefined;
  if (leftSize !== rightSize) return "changed";

  const leftValues = Set.prototype.values.call(left) as IterableIterator<unknown>;
  const rightValues = Set.prototype.values.call(right) as IterableIterator<unknown>;
  const kinds: ChangeKind[] = [];
  while (true) {
    const leftEntry = leftValues.next();
    const rightEntry = rightValues.next();
    if (leftEntry.done || rightEntry.done) {
      if (leftEntry.done !== rightEntry.done) return "changed";
      break;
    }
    kinds.push(compareInternal(leftEntry.value, rightEntry.value, depth + 1, state));
    if (kinds.includes("changed")) return "changed";
  }
  return combine(kinds);
}

function compareDescriptors(
  left: object,
  right: object,
  depth: number,
  state: CompareState,
): ChangeKind {
  const leftDescriptors = Object.getOwnPropertyDescriptors(left);
  const rightDescriptors = Object.getOwnPropertyDescriptors(right);
  const keys = new Set<PropertyKey>([
    ...Reflect.ownKeys(leftDescriptors),
    ...Reflect.ownKeys(rightDescriptors),
  ]);
  const kinds: ChangeKind[] = [];

  for (const key of keys) {
    const leftDescriptor = Reflect.getOwnPropertyDescriptor(leftDescriptors, key)?.value as
      | PropertyDescriptor
      | undefined;
    const rightDescriptor = Reflect.getOwnPropertyDescriptor(rightDescriptors, key)?.value as
      | PropertyDescriptor
      | undefined;
    if (!leftDescriptor || !rightDescriptor) return "changed";
    if (
      !("value" in leftDescriptor) ||
      !("value" in rightDescriptor)
    ) {
      state.skipped.add(`getter:${keyLabel(key)}`);
      continue;
    }
    kinds.push(
      compareInternal(
        leftDescriptor.value,
        rightDescriptor.value,
        depth + 1,
        state,
      ),
    );
    if (kinds.includes("changed")) return "changed";
  }
  return combine(kinds);
}

function compareInternal(
  left: unknown,
  right: unknown,
  depth: number,
  state: CompareState,
): ChangeKind {
  if (state.visitedEntries >= state.limits.maxEntries) return "truncated";
  state.visitedEntries += 1;
  if (Object.is(left, right)) return "same-reference";
  if (depth >= state.limits.maxDepth) return "truncated";
  if (!isObject(left) || !isObject(right)) return "changed";
  if (typeof left === "function" || typeof right === "function") return "changed";
  if (isReactElement(left) || isReactElement(right)) return "changed";
  if (Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return "changed";
  if (rememberPair(left, right, state)) return "equal-by-value";

  if (left instanceof Date && right instanceof Date) {
    return Date.prototype.getTime.call(left) === Date.prototype.getTime.call(right)
      ? "equal-by-value"
      : "changed";
  }
  if (left instanceof RegExp && right instanceof RegExp) {
    return left.source === right.source && left.flags === right.flags
      ? "equal-by-value"
      : "changed";
  }
  if (left instanceof Map && right instanceof Map) {
    return compareMaps(left, right, depth, state);
  }
  if (left instanceof Set && right instanceof Set) {
    return compareSets(left, right, depth, state);
  }

  return compareDescriptors(left, right, depth, state);
}

export function compareValues(
  previous: unknown,
  next: unknown,
  limits: CompareLimits,
): ValueChange {
  if (
    !Number.isInteger(limits.maxDepth) ||
    limits.maxDepth < 1 ||
    !Number.isInteger(limits.maxEntries) ||
    limits.maxEntries < 1
  ) {
    throw new Error("compare limits must be positive integers");
  }
  const state: CompareState = {
    limits,
    visitedEntries: 0,
    skipped: new Set(),
    pairs: new WeakMap(),
  };
  return {
    kind: compareInternal(previous, next, 0, state),
    visitedEntries: state.visitedEntries,
    skipped: [...state.skipped].sort(),
  };
}
