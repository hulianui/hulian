import { describe, expect, it, vi } from "vitest";

import { withHardTimeout } from "./default-dependencies";

describe("withHardTimeout", () => {
  it("rejects browser work that cannot service its in-page timeout", async () => {
    vi.useFakeTimers();
    const pending = new Promise<never>(() => undefined);
    const result = withHardTimeout(pending, 90_000, "gantt/basic");
    const rejection = expect(result).rejects.toThrow(/gantt\/basic.*outer browser timeout/);
    await vi.advanceTimersByTimeAsync(90_000);
    await rejection;
    vi.useRealTimers();
  });
});
