import { vi } from "vitest";
// Vidstack 媒体引擎在 jsdom 下挂载即抛 ReferenceError: IntersectionObserver is not defined
// （MediaLoadController.onAttach 触碰 IO/HTMLMediaElement 等未实现的浏览器 API）。
// 故把 @vidstack/react 降级为透传 host 元素，仅验证「组件能挂载不崩 + 控件结构在」。
// 真实播放/seek/全屏交互由 showcase 人工实机验，不在此强测。
vi.mock("@vidstack/react", () => {
  const React = require("react");
  const pass = (label?: string) => ({ children, ...p }: any) =>
    React.createElement("div", { "aria-label": p["aria-label"] ?? label, ...p }, children);
  const Slider: any = pass(); Slider.Root = pass(); Slider.Track = pass();
  Slider.TrackFill = pass(); Slider.Progress = pass(); Slider.Thumb = pass();
  Slider.Preview = pass(); Slider.Value = pass();
  const Menu: any = {}; Menu.Root = pass(); Menu.Button = pass(); Menu.Content = pass();
  Menu.RadioGroup = pass(); Menu.Radio = pass();
  const Controls: any = {}; Controls.Root = pass(); Controls.Group = pass();
  return {
    MediaPlayer: pass(), MediaProvider: pass(), Poster: pass(),
    PlayButton: pass("播放"), MuteButton: pass("静音"),
    FullscreenButton: pass("全屏"), PIPButton: pass("画中画"),
    Time: pass(), TimeSlider: Slider, VolumeSlider: Slider, Menu, Controls,
    useMediaState: () => undefined, useMediaRemote: () => ({ changePlaybackRate: () => {} }),
  };
});
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { formatTime, normalizeSrc, DEFAULT_PLAYBACK_RATES } from "./video.types";
import { Video } from "./video";

describe("video pure logic", () => {
  it("formatTime 个位秒补零、分钟无前导零", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(600)).toBe("10:00");
  });
  it("formatTime 超过一小时显示 h:mm:ss", () => {
    expect(formatTime(3661)).toBe("1:01:01");
  });
  it("formatTime 对 NaN/负数/Infinity 兜底为 0:00", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(-5)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
  it("normalizeSrc 字符串原样透传", () => {
    expect(normalizeSrc("a.mp4")).toBe("a.mp4");
  });
  it("normalizeSrc 数组透传给 Vidstack 的 src 形态", () => {
    const arr = [{ src: "a.mp4", type: "video/mp4" }];
    expect(normalizeSrc(arr)).toBe(arr);
  });
  it("默认倍速档位", () => {
    expect(DEFAULT_PLAYBACK_RATES).toEqual([0.5, 0.75, 1, 1.25, 1.5, 2]);
  });
});

afterEach(() => cleanup());

describe("<Video> 渲染冒烟", () => {
  it("挂载不抛错且渲出播放钮", () => {
    render(<Video src="https://files.vidstack.io/sprite-fight/720p.mp4" title="演示" />);
    // 锚定全词，避免误匹配 aria-label="播放速度" 的倍速菜单按钮
    expect(screen.getByLabelText(/^(播放|暂停)$/)).toBeTruthy();
  });

  it("HLS .m3u8 src 也能挂载", () => {
    render(<Video src="https://files.vidstack.io/sprite-fight/hls/stream.m3u8" />);
    expect(screen.getByLabelText(/^(静音|取消静音)$/)).toBeTruthy();
  });
});
