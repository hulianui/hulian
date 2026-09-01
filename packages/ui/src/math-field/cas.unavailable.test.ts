import { describe, expect, it, vi } from "vitest";

vi.mock("@cortex-js/compute-engine", () => {
  throw new Error("Cannot find package '@cortex-js/compute-engine'");
});

describe("createCasComparator 缺依赖", () => {
  it("抛 ComputeEngineUnavailableError，消息带安装命令", async () => {
    const { createCasComparator, ComputeEngineUnavailableError, COMPUTE_ENGINE_INSTALL_HINT } = await import("./cas");
    await expect(createCasComparator()).rejects.toBeInstanceOf(ComputeEngineUnavailableError);
    await expect(createCasComparator()).rejects.toThrow(COMPUTE_ENGINE_INSTALL_HINT);
  });
});
