export function orderSelectedFirst<T extends { value: string | null }>(
  items: ReadonlyArray<T>,
  selectedValues: ReadonlyArray<string>,
): T[] {
  const byValue = new Map(items.map((item) => [item.value, item] as const));
  const selected = new Set(selectedValues);

  return [
    ...[...selected].flatMap((value) => byValue.get(value) ?? []),
    ...items.filter((item) => item.value == null || !selected.has(item.value)),
  ];
}
