"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Video } from "../../../../packages/ui/src/video/video";
import { demoAsset } from "../../../../packages/ui/src/lib/demo-asset";
const MP4 = demoAsset("/demo/sample-video.mp4");
const HLS = demoAsset("/demo/hls/stream.m3u8");
const POSTER = demoAsset("/demo/sample-poster.jpg");
const W = "w-full max-w-2xl";
export const videoShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input MP4 file URL, which comes with Hulian skin's playback/progress/volume/double speed/full screen controls.",
            code: `<Video src="/demo/sample-video.mp4" title="Demo video" className="w-full max-w-2xl" />`,
            render: () => <Video src={MP4} title="Demonstration video" className={W}/>,
        },
        {
            title: "With poster",
            description: "poster Show the cover image before the first frame is loaded.",
            code: `<Video src="/demo/sample-video.mp4" poster="/demo/sample-poster.jpg" title="With poster" className="w-full max-w-2xl" />`,
            render: () => <Video src={MP4} poster={POSTER} title="With poster" className={W}/>,
        },
        {
            title: "HLS stream",
            description: "src Transfer .m3u8 to play the HLS live/on-demand stream.",
            code: `<Video src="/demo/hls/stream.m3u8" title="HLS flow" className="w-full max-w-2xl" />`,
            render: () => <Video src={HLS} title="HLS stream" className={W}/>,
        },
        {
            title: "Chapter Markers",
            description: "chapters renders segments tick on the progress bar, hover displays chapter titles.",
            code: `<Video
  src="/demo/sample-video.mp4"
  poster="/demo/sample-poster.jpg"
  title="With Chapter Marks"
  className="w-full max-w-2xl"
  chapters={[
    { time: 0, title: "Opening Introduction" },
    { time: 3, title: "Core Concept" },
    { time: 6, title: "Practical Demonstration" },
    { time: 9, title: "Summary" },
  ]}
/>`,
            render: () => (<Video src={MP4} poster={POSTER} title="With chapter markers" className={W} chapters={[
                    { time: 0, title: "Opening introduction" },
                    { time: 3, title: "Core Concepts" },
                    { time: 6, title: "Practical demonstration" },
                    { time: 9, title: "Summary" },
                ]}/>),
        },
    ],
    controls: [
        { prop: "src", type: "text", defaultValue: MP4, label: "Source URL" },
        { prop: "aspectRatio", type: "select", options: ["16/9", "4/3", "1/1", "21/9"], defaultValue: "16/9", label: "Aspect Ratio" },
        { prop: "muted", type: "boolean", defaultValue: false, label: "Mute" },
        { prop: "loop", type: "boolean", defaultValue: false, label: "Loop" },
    ],
    states: [
        { name: "Default (MP4 file)", render: () => <Video src={MP4} title="Demonstration video" className={W}/> },
        { name: "With poster", render: () => <Video src={MP4} poster={POSTER} title="With poster" className={W}/> },
        { name: "HLS stream (.m3u8)", render: () => <Video src={HLS} title="HLS stream" className={W}/> },
        { name: "Square 1/1", render: () => <Video src={MP4} aspectRatio="1/1" className="w-72"/> },
        {
            name: "Chapter mark (progress bar cue points)",
            render: () => (<Video src={MP4} poster={POSTER} title="With chapter markers" className={W} chapters={[
                    { time: 0, title: "Opening introduction" },
                    { time: 3, title: "Core Concepts" },
                    { time: 6, title: "Practical demonstration" },
                    { time: 9, title: "Summary" },
                ]}/>),
        },
        {
            name: "Resume (starting from the 4th second)",
            render: () => <Video src={MP4} poster={POSTER} title="Resume positioning" startTime={4} className={W}/>,
        },
        {
            name: "Ending screen (next section)",
            render: () => (<Video src={MP4} poster={POSTER} title="End screen" className={W} endScreen={<div className="text-center text-white">
              <div className="text-sm text-white/70">The next episode will be played soon</div>
              <div className="mt-1 text-lg font-semibold">02 · Component-based thinking</div>
            </div>}/>),
        },
    ],
    renderWithProps: (p) => (<Video src={(p.src as string) || MP4} aspectRatio={p.aspectRatio as string} muted={p.muted as boolean} loop={p.loop as boolean} className={W}/>),
    toCode: (p) => `<Video
  src="${(p.src as string) || MP4}"
  aspectRatio="${p.aspectRatio}"${p.muted ? "\n  muted" : ""}${p.loop ? "\n  loop" : ""}
/>`,
};
