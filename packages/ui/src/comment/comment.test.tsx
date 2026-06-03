import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Comment, CommentAction, CommentActions } from "./comment";

describe("Comment", () => {
  it("渲染作者 + 正文", () => {
    const { getByText } = render(<Comment author="瑚琏" content="一条评论" />);
    expect(getByText("瑚琏")).toBeTruthy();
    expect(getByText("一条评论")).toBeTruthy();
  });

  it("渲染时间戳", () => {
    const { getByText } = render(<Comment author="瑚琏" datetime="2 小时前" />);
    expect(getByText("2 小时前")).toBeTruthy();
  });

  it("comment 类型渲染 Avatar（fallback 透传）", () => {
    const { getByText } = render(<Comment author="李四" avatar={{ fallback: "李" }} />);
    expect(getByText("李")).toBeTruthy();
  });

  it("type=log 渲染点标记而非 Avatar，正文内联", () => {
    const { container, getByText } = render(
      <Comment type="log" author="系统" avatar={{ fallback: "X" }} content="改为已解决" />,
    );
    expect(container.querySelector("article")!.getAttribute("data-type")).toBe("log");
    // log 忽略 avatar fallback
    expect(container.textContent).not.toContain("X");
    expect(getByText("改为已解决")).toBeTruthy();
  });

  it("渲染操作区 slot", () => {
    const { getByText } = render(
      <Comment author="瑚琏" actions={<CommentAction>赞</CommentAction>} />,
    );
    expect(getByText("赞")).toBeTruthy();
  });

  it("嵌套子评论递归渲染", () => {
    const { getByText } = render(
      <Comment author="父" content="父评论">
        <Comment author="子" content="子回复" />
      </Comment>,
    );
    expect(getByText("子")).toBeTruthy();
    expect(getByText("子回复")).toBeTruthy();
  });

  it("connector 给子评论区加左连接线", () => {
    const { container } = render(
      <Comment author="父" connector>
        <Comment author="子" />
      </Comment>,
    );
    expect(container.innerHTML).toContain("border-l");
  });

  it("无 connector 不加左连接线", () => {
    const { container } = render(
      <Comment author="父">
        <Comment author="子" />
      </Comment>,
    );
    expect(container.innerHTML).not.toContain("border-l");
  });

  it("透传 className 到外壳", () => {
    const { container } = render(<Comment author="x" className="my-comment" />);
    expect(container.querySelector("article")!.classList.contains("my-comment")).toBe(true);
  });
});

describe("CommentAction", () => {
  it("默认渲染 button", () => {
    const { getByText } = render(<CommentAction>回复</CommentAction>);
    expect((getByText("回复") as HTMLElement).tagName).toBe("BUTTON");
  });

  it("传 href 渲染为链接（dogfood Link）", () => {
    const { getByText } = render(<CommentAction href="#reply">回复</CommentAction>);
    const el = getByText("回复") as HTMLAnchorElement;
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("#reply");
  });
});

describe("CommentActions", () => {
  it("渲染容器与子项", () => {
    const { getByText } = render(
      <CommentActions>
        <CommentAction>赞</CommentAction>
      </CommentActions>,
    );
    expect(getByText("赞")).toBeTruthy();
  });
});
