"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { HeroVideoDialog } from "./hero-video-dialog";

const THUMB = "/demo/photo-hero.jpg";
const VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

export const heroVideoDialogShowcase: ShowcaseSpec = {
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
