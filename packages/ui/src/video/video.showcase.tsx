"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Video } from "./video";

// 公网测试素材（Vidstack 官方 demo 资源，确定性、无需鉴权）。
const MP4 = "https://files.vidstack.io/sprite-fight/720p.mp4";
const HLS = "https://files.vidstack.io/sprite-fight/hls/stream.m3u8";
const POSTER = "https://files.vidstack.io/sprite-fight/poster.webp";

const W = "w-full max-w-2xl";

export const videoShowcase: ShowcaseSpec = {
  controls: [
    { prop: "src", type: "text", defaultValue: MP4, label: "片源 URL" },
    { prop: "aspectRatio", type: "select", options: ["16/9", "4/3", "1/1", "21/9"], defaultValue: "16/9", label: "宽高比" },
    { prop: "muted", type: "boolean", defaultValue: false, label: "静音" },
    { prop: "loop", type: "boolean", defaultValue: false, label: "循环" },
  ],
  states: [
    { name: "默认(MP4 文件)", render: () => <Video src={MP4} title="演示视频" className={W} /> },
    { name: "带海报", render: () => <Video src={MP4} poster={POSTER} title="带海报" className={W} /> },
    { name: "HLS 流(.m3u8)", render: () => <Video src={HLS} title="HLS 流" className={W} /> },
    { name: "方形 1/1", render: () => <Video src={MP4} aspectRatio="1/1" className="w-72" /> },
  ],
  renderWithProps: (p) => (
    <Video
      src={(p.src as string) || MP4}
      aspectRatio={p.aspectRatio as string}
      muted={p.muted as boolean}
      loop={p.loop as boolean}
      className={W}
    />
  ),
  toCode: (p) =>
    `<Video\n  src="${(p.src as string) || MP4}"\n  aspectRatio="${p.aspectRatio}"${p.muted ? "\n  muted" : ""}${p.loop ? "\n  loop" : ""}\n/>`,
};
