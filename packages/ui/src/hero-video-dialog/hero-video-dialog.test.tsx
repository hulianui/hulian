import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { HeroVideoDialog } from "./hero-video-dialog";

const props = { thumbnailSrc: "/c.jpg", thumbnailAlt: "封面", videoSrc: "https://example.com/embed/x" };

describe("HeroVideoDialog", () => {
  it("渲染缩略图触发按钮（默认不开弹层）", () => {
    const { getByLabelText, queryByRole } = render(<HeroVideoDialog {...props} />);
    expect(getByLabelText("播放视频")).toBeTruthy();
    expect(queryByRole("dialog")).toBeNull();
  });

  it("点击打开弹层（portal 渲染 iframe）", () => {
    const { getByLabelText, getByRole, getByTitle } = render(<HeroVideoDialog {...props} />);
    fireEvent.click(getByLabelText("播放视频"));
    expect(getByRole("dialog")).toBeTruthy();
    expect(getByTitle("视频").getAttribute("src")).toBe(props.videoSrc);
  });

  it("点关闭按钮收起", () => {
    const { getByLabelText, queryByRole } = render(<HeroVideoDialog {...props} />);
    fireEvent.click(getByLabelText("播放视频"));
    fireEvent.click(getByLabelText("关闭"));
    expect(queryByRole("dialog")).toBeNull();
  });

  it("Esc 关闭", () => {
    const { getByLabelText, queryByRole } = render(<HeroVideoDialog {...props} />);
    fireEvent.click(getByLabelText("播放视频"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("dialog")).toBeNull();
  });
});
