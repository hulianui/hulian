"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { HeroVideoDialog } from "./hero-video-dialog";

const THUMB = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=70";
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
