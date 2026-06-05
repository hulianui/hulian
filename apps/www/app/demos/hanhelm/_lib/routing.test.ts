import { describe, expect, it } from "vitest";
import { scoreExecutors, DEFAULT_WEIGHTS } from "./routing";
import type { Executor, Task } from "../_data/types";

const execs: Executor[] = [
  {
    id: "haiku",
    name: "Haiku",
    kind: "model",
    capabilities: ["text", "translate"],
    pricePer1kIn: 0.007,
    pricePer1kOut: 0.035,
    latencyMs: 400,
    maxConcurrency: 50,
    load: 0.2,
    health: "healthy",
    fallbackChain: ["sonnet"],
  },
  {
    id: "opus",
    name: "Opus",
    kind: "model",
    capabilities: ["text", "code", "orchestrate"],
    pricePer1kIn: 0.035,
    pricePer1kOut: 0.175,
    latencyMs: 1800,
    maxConcurrency: 10,
    load: 0.6,
    health: "healthy",
    fallbackChain: ["sonnet"],
  },
];
const task: Task = {
  id: "t1",
  title: "翻译",
  type: "翻译",
  capabilities: ["translate"],
  priority: "P2",
  slaMs: 5000,
  budgetYuan: 0.5,
  status: "queued",
  createdAt: 0,
  waitedMs: 0,
  assignedExecutorId: null,
  submitter: "测试",
  subtasks: [],
  edges: [],
  frames: [],
  routing: {} as never,
};

describe("scoreExecutors", () => {
  it("能力不匹配被淘汰", () => {
    const r = scoreExecutors(task, execs, DEFAULT_WEIGHTS);
    const opus = r.candidates.find((c) => c.executorId === "opus")!;
    expect(opus.eliminated).toBeTruthy(); // opus 不含 translate
  });
  it("选中能力匹配且综合分最高者", () => {
    const r = scoreExecutors(task, execs, DEFAULT_WEIGHTS);
    expect(r.chosenId).toBe("haiku");
  });
  it("提高成本权重时仍偏好便宜模型", () => {
    const r = scoreExecutors({ ...task, capabilities: ["text"] }, execs, { ...DEFAULT_WEIGHTS, cost: 0.9 });
    expect(r.chosenId).toBe("haiku");
  });
  it("无可用候选时 chosenId 为 null", () => {
    const r = scoreExecutors({ ...task, capabilities: ["image"] }, execs, DEFAULT_WEIGHTS);
    expect(r.chosenId).toBeNull();
  });
});
