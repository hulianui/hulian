import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Conversation } from "./conversation";
import { ChatMessage } from "../chat-message";

describe("Conversation", () => {
  it("纵向堆叠 + 可滚动容器", () => {
    const { container } = render(
      <Conversation>
        <ChatMessage role="user">a</ChatMessage>
        <ChatMessage role="assistant">b</ChatMessage>
      </Conversation>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("flex-col");
    expect(root.className).toContain("overflow-y-auto");
    expect(root.children).toHaveLength(2);
  });
});
