import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChatMessage } from "./chat-message";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("ChatMessage", () => {
  it("稳定父更新时跳过气泡子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <ChatMessage role="assistant" name="小助手" timestamp="10:24">
        已经帮你查到了
      </ChatMessage>
    ));
  });

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
  it("status=read 在 user 气泡渲双勾回执(aria-label 已读)", () => {
    const { getByLabelText } = render(
      <ChatMessage role="user" status="read">
        在
      </ChatMessage>,
    );
    expect(getByLabelText("已读")).toBeTruthy();
  });
  it("status=sending 渲发送中回执", () => {
    const { getByLabelText } = render(
      <ChatMessage role="user" status="sending">
        在
      </ChatMessage>,
    );
    expect(getByLabelText("发送中")).toBeTruthy();
  });
  it("ConfigProvider locale=enUS renders English receipt labels", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <ChatMessage role="user" status="read">
          Ready
        </ChatMessage>
      </ConfigProvider>,
    );
    expect(getByLabelText("Read")).toBeTruthy();
  });
  it("status 在 assistant 气泡不渲染回执", () => {
    const { queryByLabelText } = render(
      <ChatMessage role="assistant" status="read">
        在
      </ChatMessage>,
    );
    expect(queryByLabelText("已读")).toBeNull();
  });
});
