import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChatMessage } from "./chat-message";

describe("ChatMessage", () => {
  it("user 气泡用 primary 底 + 右对齐(flex-row-reverse)", () => {
    const { container, getByText } = render(<ChatMessage role="user">你好</ChatMessage>);
    expect(getByText("你好").className).toContain("bg-primary");
    expect(container.firstElementChild?.className).toContain("flex-row-reverse");
  });
  it("assistant 气泡用 surface 底", () => {
    const { getByText } = render(<ChatMessage role="assistant">在的</ChatMessage>);
    expect(getByText("在的").className).toContain("bg-surface");
  });
  it("loading 时正文渲 TypingDots(role=status)", () => {
    const { getByRole, queryByText } = render(
      <ChatMessage role="assistant" loading>
        不该显示
      </ChatMessage>,
    );
    expect(getByRole("status")).toBeTruthy();
    expect(queryByText("不该显示")).toBeNull();
  });
  it("system 居中弱化、无气泡底色", () => {
    const { getByText } = render(<ChatMessage role="system">已切换模型</ChatMessage>);
    const el = getByText("已切换模型");
    expect(el.className).toContain("text-center");
    expect(el.className).not.toContain("bg-primary");
  });
});
