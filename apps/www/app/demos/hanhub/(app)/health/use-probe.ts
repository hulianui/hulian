"use client";
import { useCallback, useState } from "react";
import { channels as seedChannels, probeHistory as seedHistory } from "../../_data/channels";
import type { Channel, ProbeRecord } from "../../_data/types";

/** 确定性伪随机：按种子派生 [0,1)，避免 Math.random 触发 hydration 警告。 */
function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** 围绕基准值做 ±pct 的确定性微调（保留整数/上限）。 */
function jitter(base: number, seed: number, pct: number, cap?: number): number {
  const delta = (seededUnit(seed) - 0.5) * 2 * pct;
  const next = Math.round(base * (1 + delta));
  return cap != null ? Math.min(next, cap) : Math.max(next, 0);
}

export interface ProbeState {
  channels: Channel[];
  history: ProbeRecord[];
  probing: boolean;
  runProbe: () => void;
  /** 当前测速轮次（用于派生确定性伪随机种子）。 */
  round: number;
}

export function useProbe(): ProbeState {
  const [channels, setChannels] = useState<Channel[]>(() => seedChannels.map((c) => ({ ...c })));
  const [history, setHistory] = useState<ProbeRecord[]>(() => seedHistory.map((h) => ({ ...h })));
  const [probing, setProbing] = useState(false);
  const [round, setRound] = useState(0);

  const runProbe = useCallback(() => {
    setProbing(true);
    const nextRound = round + 1;
    // 模拟 1~2s 网络往返。
    const ms = 1000 + Math.round(seededUnit(nextRound * 7) * 1000);
    window.setTimeout(() => {
      setChannels((prev) =>
        prev.map((c, i) => {
          // 离线/维护渠道不参与刷新（保持不可用语义）。
          if (c.health === "offline" || c.health === "maintenance") return c;
          const seed = nextRound * 100 + i;
          const latencyMs = jitter(c.latencyMs || 120, seed, 0.35);
          const successRate = Math.min(
            0.999,
            Math.max(0.85, c.successRate + (seededUnit(seed + 3) - 0.5) * 0.04),
          );
          const health: Channel["health"] = successRate < 0.95 || latencyMs > 350 ? "degraded" : "online";
          const trend = [...c.trend.slice(1), Number(successRate.toFixed(3))];
          return { ...c, latencyMs, successRate, health, trend, lastProbe: "刚刚" };
        }),
      );
      // 追加探测历史（取在线渠道结果，最多前 3 条）。
      setChannels((latest) => {
        const stamp = formatClock(nextRound);
        const records: ProbeRecord[] = latest
          .filter((c) => c.health === "online" || c.health === "degraded")
          .slice(0, 3)
          .map((c) => ({
            time: stamp,
            channel: c.name,
            ok: c.successRate >= 0.95,
            latencyMs: c.latencyMs,
            note: c.health === "degraded" ? `200 OK · 延迟偏高` : "200 OK",
          }));
        setHistory((h) => [...records, ...h].slice(0, 12));
        return latest;
      });
      setRound(nextRound);
      setProbing(false);
    }, ms);
  }, [round]);

  return { channels, history, probing, runProbe, round };
}

/** 由轮次派生一个确定性的「时钟」标记，避免 new Date() 造成水合差异。 */
function formatClock(round: number): string {
  const base = 10 * 3600 + 42 * 60 + 12; // 10:42:12 起步
  const t = base + round * 47;
  const hh = String(Math.floor(t / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
