import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComponentPreview, componentPreviewLabels } from "./component-preview";

describe("ComponentPreview locale labels", () => {
  it("provides English labels for the English documentation build", () => {
    expect(componentPreviewLabels("en")).toEqual({ preview: "Preview", code: "Code" });
  });

  it("keeps Chinese tab labels in the default Chinese documentation build", () => {
    render(<ComponentPreview code={"<Button>保存</Button>"}>示例</ComponentPreview>);

    expect(screen.getByRole("tab", { name: "预览" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "代码" })).toBeTruthy();
  });
});
