"use client";
import { useCallback, useRef, useState, type ReactNode } from "react";

/** 每行的元信息（key 用于 React 稳定渲染，name 为当前索引）。 */
export interface FormListField {
  key: string;
  name: number;
}

export interface FormListOperations<T> {
  /** 末尾追加一行（可给默认值）。 */
  add: (defaultValue?: T) => void;
  /** 删除指定索引行。 */
  remove: (index: number) => void;
  /** 把 from 行移动到 to 位置。 */
  move: (from: number, to: number) => void;
}

export interface FormListProps<T> {
  /** 受控数组值。 */
  value?: T[];
  /** 非受控初始值。 */
  defaultValue?: T[];
  /** 值变化回调（受控/非受控均触发）。 */
  onChange?: (next: T[]) => void;
  /** render-prop：(每行元信息, 增删移操作, 当前数组值)。每行内复用 Field/Input/Select。 */
  children: (fields: FormListField[], operations: FormListOperations<T>, value: T[]) => ReactNode;
}

/** 动态数组字段：增删行 + 移动，render-prop 暴露 {fields, add, remove, move}。受控/非受控对称。 */
export function FormList<T = unknown>({ value, defaultValue, onChange, children }: FormListProps<T>) {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState<T[]>(defaultValue ?? []);
  const current = isControlled ? value! : inner;

  // 行 key：与数组等长，增删移同步维护，保证移动/删除不串 React 状态
  const keySeq = useRef(0);
  const keysRef = useRef<string[]>([]);
  // 首次或长度漂移时补齐 key（受控外部直接改数组长度时容错）
  if (keysRef.current.length !== current.length) {
    const next = keysRef.current.slice(0, current.length);
    while (next.length < current.length) next.push(`row-${keySeq.current++}`);
    keysRef.current = next;
  }

  const commit = useCallback(
    (nextValue: T[], nextKeys: string[]) => {
      keysRef.current = nextKeys;
      if (!isControlled) setInner(nextValue);
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const add = useCallback(
    (defaultRow?: T) => {
      const nextValue = [...current, (defaultRow ?? ({} as T))];
      commit(nextValue, [...keysRef.current, `row-${keySeq.current++}`]);
    },
    [current, commit],
  );

  const remove = useCallback(
    (index: number) => {
      const nextValue = current.filter((_, i) => i !== index);
      commit(nextValue, keysRef.current.filter((_, i) => i !== index));
    },
    [current, commit],
  );

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return;
      const reorder = <X,>(arr: X[]) => {
        const copy = [...arr];
        const [item] = copy.splice(from, 1);
        copy.splice(to, 0, item);
        return copy;
      };
      commit(reorder(current), reorder(keysRef.current));
    },
    [current, commit],
  );

  const fields: FormListField[] = current.map((_, i) => ({ key: keysRef.current[i], name: i }));

  return <>{children(fields, { add, remove, move }, current)}</>;
}
