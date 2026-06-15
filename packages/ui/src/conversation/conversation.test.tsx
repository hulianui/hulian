import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Conversation } from "./conversation";
import { ChatMessage } from "../chat-message";

// jsdom 不做真实布局：手动给容器钉上滚动几何（scrollHeight/clientHeight），
// 并把 scrollTop 设为可写，以便断言自动贴底是否触发。
function stubScrollGeometry(el: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight });
  let top = 0;
  Object.defineProperty(el, "scrollTop", {
    configurable: true,
    get: () => top,
    set: (v: number) => {
      top = v;
    },
  });
}

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

  it("用户主动上滚后，父级 re-render 不再把视口拽回底部", () => {
    const { container, rerender } = render(
      <Conversation>
        <ChatMessage role="user">a</ChatMessage>
      </Conversation>,
    );
    const root = container.firstElementChild as HTMLElement;
    stubScrollGeometry(root, 1000, 200);

    // 模拟用户向上翻阅历史：scrollTop 远离底部，触发 scroll 事件记录意图。
    root.scrollTop = 0;
    fireEvent.scroll(root);
    expect(root.scrollTop).toBe(0);

    // 父级因无关原因 re-render（children 未增）—— 不应被强制贴底。
    rerender(
      <Conversation>
        <ChatMessage role="user">a</ChatMessage>
      </Conversation>,
    );
    expect(root.scrollTop).toBe(0);
  });

  it("停在底部时，新内容渲染仍自动贴底", () => {
    const { container, rerender } = render(
      <Conversation>
        <ChatMessage role="user">a</ChatMessage>
      </Conversation>,
    );
    const root = container.firstElementChild as HTMLElement;
    stubScrollGeometry(root, 1000, 200);

    // 用户停在底部附近（容差内）：scrollTop 接近 scrollHeight - clientHeight。
    root.scrollTop = 800;
    fireEvent.scroll(root);

    // 新消息到达 → 应贴底到新的 scrollHeight。
    rerender(
      <Conversation>
        <ChatMessage role="user">a</ChatMessage>
        <ChatMessage role="assistant">b</ChatMessage>
      </Conversation>,
    );
    expect(root.scrollTop).toBe(root.scrollHeight);
  });

  it("autoScroll=false 时不触碰滚动位置", () => {
    const { container, rerender } = render(
      <Conversation autoScroll={false}>
        <ChatMessage role="user">a</ChatMessage>
      </Conversation>,
    );
    const root = container.firstElementChild as HTMLElement;
    stubScrollGeometry(root, 1000, 200);
    root.scrollTop = 300;
    rerender(
      <Conversation autoScroll={false}>
        <ChatMessage role="user">a</ChatMessage>
        <ChatMessage role="assistant">b</ChatMessage>
      </Conversation>,
    );
    expect(root.scrollTop).toBe(300);
  });
});
