import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { PromptSuggestions } from "./prompt-suggestions";

describe("PromptSuggestions", () => {
  it("string 项：label 即 value", () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <PromptSuggestions suggestions={["总结要点", "翻译成英文"]} onSelect={onSelect} />,
    );
    fireEvent.click(getByText("总结要点"));
    expect(onSelect).toHaveBeenCalledWith("总结要点");
  });
  it("{label,value} 项：回传 value", () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <PromptSuggestions
        suggestions={[{ label: "写一首诗", value: "prompt:poem" }]}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(getByText("写一首诗"));
    expect(onSelect).toHaveBeenCalledWith("prompt:poem");
  });
  it("渲染全部建议为按钮", () => {
    const { getAllByRole } = render(
      <PromptSuggestions suggestions={["a", "b", "c"]} />,
    );
    expect(getAllByRole("button")).toHaveLength(3);
  });
});
