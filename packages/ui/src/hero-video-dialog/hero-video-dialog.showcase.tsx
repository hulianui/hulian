"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { HeroVideoDialog } from "./hero-video-dialog";
import { demoAsset } from "../lib/demo-asset";

const THUMB = demoAsset("/demo/photo-hero.jpg");
const VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

export const heroVideoDialogShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传缩略图 + 视频 embed 地址，点击缩略图弹出居中视频层（Esc / 点遮罩关闭）。",
      code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="产品预览"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
/>`,
      render: () => (
        <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="产品预览" videoSrc={VIDEO} className="w-80" />
      ),
    },
    {
      title: "自定义尺寸",
      description: "用 className 控制缩略图容器宽度，弹层视频固定为 16:9。",
      code: `<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="封面"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
  className="w-full max-w-md"
/>`,
      render: () => (
        <HeroVideoDialog
          thumbnailSrc={THUMB}
          thumbnailAlt="封面"
          videoSrc={VIDEO}
          className="w-full max-w-md"
        />
      ),
    },
  ],
  controls: [],
  states: [
    {
      name: "default",
      render: () => (
        <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="预览" videoSrc={VIDEO} className="w-80" />
      ),
    },
  ],
  renderWithProps: () => (
    <HeroVideoDialog thumbnailSrc={THUMB} thumbnailAlt="预览" videoSrc={VIDEO} className="w-80" />
  ),
  toCode: () =>
    `<HeroVideoDialog\n  thumbnailSrc="/cover.jpg"\n  videoSrc="https://www.youtube.com/embed/..."\n/>`,
};
