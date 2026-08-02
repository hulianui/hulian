import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("ComponentPreview locale labels", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("renders English tab labels in the English documentation build", async () => {
    vi.stubEnv("DOCS_LOCALE", "en");
    const { ComponentPreview } = await import("./component-preview");

    render(<ComponentPreview code={"<Button>Save</Button>"}>Demo</ComponentPreview>);

    expect(screen.getByRole("tab", { name: "Preview" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Code" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "预览" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "代码" })).toBeNull();
  }, 30_000);

  it("keeps Chinese tab labels in the Chinese documentation build", async () => {
    vi.stubEnv("DOCS_LOCALE", "zh-CN");
    const { ComponentPreview } = await import("./component-preview");

    render(<ComponentPreview code={"<Button>保存</Button>"}>示例</ComponentPreview>);

    expect(screen.getByRole("tab", { name: "预览" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "代码" })).toBeTruthy();
  }, 30_000);
});
