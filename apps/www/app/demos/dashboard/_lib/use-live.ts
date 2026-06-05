"use client";
import { useEffect, useRef, useState } from "react";

// 实时刷新通用 hook：base 就绪后每 intervalMs 调一次 step(prev, tick) 推进快照。
// step 用 latest-ref 持有 → 不因闭包过期、也不因 step 重建而重置 interval（参考 Flow 画布同款范式）。
export function useTicker<T>(
  base: T | null,
  step: (prev: T, tick: number) => T,
  opts?: { intervalMs?: number; running?: boolean },
): T | null {
  const intervalMs = opts?.intervalMs ?? 3000;
  const running = opts?.running ?? true;
  const [state, setState] = useState<T | null>(base);
  const stepRef = useRef(step);
  stepRef.current = step;
  const tickRef = useRef(0);

  // base 变化（重新加载 / 切数据源）→ 重置实时态
  useEffect(() => {
    setState(base);
    tickRef.current = 0;
  }, [base]);

  useEffect(() => {
    if (!running || base == null) return;
    const id = setInterval(() => {
      tickRef.current += 1;
      setState((prev) => (prev ? stepRef.current(prev, tickRef.current) : prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [running, base, intervalMs]);

  return state;
}
