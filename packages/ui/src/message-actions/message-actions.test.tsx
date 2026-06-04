import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { MessageActions } from "./message-actions";

describe("MessageActions", () => {
  it("仅渲染有回调/content 的键", () => {
    const { getByLabelText, queryByLabelText } = render(
      <MessageActions content="文本" onRegenerate={() => {}} />,
    );
    expect(getByLabelText("复制")).toBeTruthy();
    expect(getByLabelText("重新生成")).toBeTruthy();
    expect(queryByLabelText("赞")).toBeNull();
    expect(queryByLabelText("踩")).toBeNull();
  });
  it("点赞/踩触发回调", () => {
    const onLike = vi.fn();
    const onDislike = vi.fn();
    const { getByLabelText } = render(
      <MessageActions onLike={onLike} onDislike={onDislike} />,
    );
    fireEvent.click(getByLabelText("赞"));
    fireEvent.click(getByLabelText("踩"));
    expect(onLike).toHaveBeenCalled();
    expect(onDislike).toHaveBeenCalled();
  });
  it("无任何 content/回调时不渲染复制键", () => {
    const { queryByLabelText } = render(<MessageActions />);
    expect(queryByLabelText("复制")).toBeNull();
  });
});
