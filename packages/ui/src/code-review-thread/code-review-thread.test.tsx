import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { severityStyle } from "./code-review-thread.severity";
import { CodeReviewThread } from "./code-review-thread";
import type { ReviewComment } from "./code-review-thread.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

const comments: ReviewComment[] = [
  {
    id: "c1",
    author: { name: "审查官", kind: "ai" },
    severity: "critical",
    body: "这里有空指针风险",
    time: "刚刚",
    suggestion: { oldText: "a.b", newText: "a?.b" },
  },
  { id: "c2", author: { name: "张三", kind: "human" }, body: "确认一下" },
];

describe("severityStyle", () => {
  it("critical → danger", () => expect(severityStyle("critical").tagTone).toBe("danger"));
  it("minor → brand（库无 info 色）", () => expect(severityStyle("minor").tagTone).toBe("brand"));
  it("缺省 → info/neutral", () => expect(severityStyle().tagTone).toBe("neutral"));
});

describe("CodeReviewThread", () => {
  it("渲染所有评论 + AI 标 + 严重标", () => {
    const { getByText, getAllByText } = render(<CodeReviewThread comments={comments} />);
    expect(getByText("这里有空指针风险")).toBeTruthy();
    expect(getByText("确认一下")).toBeTruthy();
    expect(getByText("AI")).toBeTruthy();
    expect(getAllByText("严重").length).toBeGreaterThan(0);
  });

  it("建议修改渲染 + 采纳触发回调", () => {
    const fn = vi.fn();
    const { getByText } = render(<CodeReviewThread comments={comments} onAdoptSuggestion={fn} />);
    fireEvent.click(getByText("采纳建议"));
    expect(fn).toHaveBeenCalledWith("c1");
  });

  it("标记已解决触发 onStatusChange", () => {
    const fn = vi.fn();
    const { getByText } = render(<CodeReviewThread comments={comments} onStatusChange={fn} />);
    fireEvent.click(getByText("标记已解决"));
    expect(fn).toHaveBeenCalledWith("resolved");
  });

  it("折叠态只显摘要、隐藏评论正文；展开后显示", () => {
    const { queryByText, getByText, container } = render(
      <CodeReviewThread comments={comments} defaultCollapsed />,
    );
    expect(queryByText("这里有空指针风险")).toBeNull();
    // 摘要按钮
    expect(container.textContent).toContain("2 条批注");
    fireEvent.click(getByText(/2 条批注/));
    expect(getByText("这里有空指针风险")).toBeTruthy();
  });

  it("回复输入 + 提交触发 onReply 并清空", () => {
    const fn = vi.fn();
    const { getByPlaceholderText, getByText } = render(<CodeReviewThread comments={comments} onReply={fn} />);
    const ta = getByPlaceholderText("回复这条批注…") as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "好的我改" } });
    fireEvent.click(getByText("回复"));
    expect(fn).toHaveBeenCalledWith("好的我改");
    expect(ta.value).toBe("");
  });

  it("受控 status=resolved 显示已解决标 + 重新打开", () => {
    const { getByText } = render(<CodeReviewThread comments={comments} status="resolved" />);
    expect(getByText("已解决")).toBeTruthy();
    expect(getByText("重新打开")).toBeTruthy();
  });

  it("线程动作与严重度跟随 ConfigProvider", () => {
    const { getByText, getByPlaceholderText } = render(<ConfigProvider locale={enUS}><CodeReviewThread comments={comments} /></ConfigProvider>);
    expect(getByText("Critical")).toBeTruthy();
    expect(getByText("Mark resolved")).toBeTruthy();
    expect(getByPlaceholderText("Reply to this comment…")).toBeTruthy();
  });
});
