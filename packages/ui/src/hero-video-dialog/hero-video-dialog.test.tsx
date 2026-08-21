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

  it("videoSrc 是视频文件时自动挂原生 <video>（poster 复用缩略图）", () => {
    const { getByLabelText } = render(
      <HeroVideoDialog thumbnailSrc="/c.jpg" thumbnailAlt="封面" videoSrc="/demo/sample-video.mp4" />,
    );
    fireEvent.click(getByLabelText("播放视频"));
    const video = document.body.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe("/demo/sample-video.mp4");
    expect(video?.getAttribute("poster")).toBe("/c.jpg");
    expect(document.body.querySelector("iframe")).toBeNull();
  });

  it("videoType=\"embed\" 强制走 iframe（即便 src 是视频文件）", () => {
    const { getByLabelText, getByTitle } = render(
      <HeroVideoDialog
        thumbnailSrc="/c.jpg"
        thumbnailAlt="封面"
        videoSrc="/demo/sample-video.mp4"
        videoType="embed"
      />,
    );
    fireEvent.click(getByLabelText("播放视频"));
    expect(getByTitle("视频").tagName).toBe("IFRAME");
    expect(document.body.querySelector("video")).toBeNull();
  });

  it("videoType=\"video\" 强制走 <video>（即便 src 是 embed 地址）", () => {
    const { getByLabelText } = render(<HeroVideoDialog {...props} videoType="video" />);
    fireEvent.click(getByLabelText("播放视频"));
    expect(document.body.querySelector("video")).toBeTruthy();
    expect(document.body.querySelector("iframe")).toBeNull();
  });

  it("HLS(.m3u8) 不参与自动判别，仍留在 iframe 分支", () => {
    // 多数浏览器原生放不动 HLS，自动挂 <video> 会黑屏；要放 HLS 请用 Video 播放器组件。
    const { getByLabelText } = render(
      <HeroVideoDialog thumbnailSrc="/c.jpg" videoSrc="/demo/hls/stream.m3u8" />,
    );
    fireEvent.click(getByLabelText("播放视频"));
    expect(document.body.querySelector("video")).toBeNull();
    expect(document.body.querySelector("iframe")).toBeTruthy();
  });

  it.each(["/hero.webm?v=2", "/hero.mp4?token=abc", "/hero.mp4#t=10", "/HERO.MP4"])(
    "带查询串 / hash / 大写扩展名的视频地址仍判为 <video>：%s",
    (src) => {
      const { getByLabelText } = render(<HeroVideoDialog thumbnailSrc="/c.jpg" videoSrc={src} />);
      fireEvent.click(getByLabelText("播放视频"));
      expect(document.body.querySelector("video")).toBeTruthy();
      expect(document.body.querySelector("iframe")).toBeNull();
    },
  );

  it("Esc 关闭", () => {
    const { getByLabelText, queryByRole } = render(<HeroVideoDialog {...props} />);
    fireEvent.click(getByLabelText("播放视频"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("dialog")).toBeNull();
  });
});
