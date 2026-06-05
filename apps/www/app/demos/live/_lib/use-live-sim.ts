"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { createInitialState, reducer, type LiveAction } from "./live-sim";

interface Options {
  running?: boolean;
  /** 各定时器节奏（ms）。 */
  danmakuMs?: number;
  giftMs?: number;
  statsMs?: number;
  aiMs?: number;
}

/** 直播实时引擎 hook：纯 reducer + 多定时器派发 tick（seed 递增 → 确定性内容）。 */
export function useLiveSim(opts: Options = {}) {
  const { running = true, danmakuMs = 750, giftMs = 2600, statsMs = 2000, aiMs = 6500 } = opts;
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const seed = useRef(1);
  const nextSeed = useCallback(() => seed.current++, []);

  useEffect(() => {
    if (!running) return;
    const ids = [
      setInterval(() => dispatch({ type: "TICK_DANMAKU", seed: nextSeed() }), danmakuMs),
      setInterval(() => dispatch({ type: "TICK_GIFT", seed: nextSeed() }), giftMs),
      setInterval(() => dispatch({ type: "TICK_STATS", seed: nextSeed() }), statsMs),
      setInterval(() => dispatch({ type: "TICK_AI", seed: nextSeed() }), aiMs),
    ];
    return () => ids.forEach(clearInterval);
  }, [running, danmakuMs, giftMs, statsMs, aiMs, nextSeed]);

  const send = useCallback((action: LiveAction) => dispatch(action), []);
  return { state, send };
}
