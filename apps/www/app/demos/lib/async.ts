"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** demo 用：模拟网络延迟，让 loading/skeleton 等真实态有戏。 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const jitter = (min = 350, max = 800) => min + Math.floor(Math.random() * (max - min));

/** 初始加载态：seed 延迟返回，驱动 Skeleton / ProTable.loading。failOnce 模拟一次失败 + reload 重试。 */
export function useMockData<T>(seed: T, opts?: { delay?: number; failOnce?: boolean }) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const failedRef = useRef(false);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    await sleep(opts?.delay ?? jitter());
    if (opts?.failOnce && !failedRef.current) {
      failedRef.current = true;
      setError("加载失败，请重试（这里报错是故意设计展示组件的）");
      setLoading(false);
      return;
    }
    setData(seedRef.current);
    setLoading(false);
  }, [opts?.delay, opts?.failOnce]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/** 提交/动作 pending：包一层延迟 + try/finally，配 Spinner + disabled。 */
export function usePending() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async (fn: () => void | Promise<void>) => {
    setPending(true);
    try {
      await sleep(jitter(300, 600));
      await fn();
    } finally {
      setPending(false);
    }
  }, []);
  return [pending, run] as const;
}
