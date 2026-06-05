"use client";
import {
  Controls,
  PlayButton,
  MuteButton,
  FullscreenButton,
  PIPButton,
  TimeSlider,
  VolumeSlider,
  Time,
  Menu,
  useMediaState,
  useMediaRemote,
} from "@vidstack/react";
import type { ReactNode } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  Gauge,
  Check,
  RefreshCw,
} from "../_icons";
import { cn } from "../lib/cn";
import { chapterMarkers, type VideoChapter } from "./video.types";

const btn =
  "inline-flex size-9 items-center justify-center rounded-[var(--radius-sm,0.375rem)] text-white/90 outline-none transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-ring data-[focus]:ring-2 data-[focus]:ring-ring";

function PlaybackRateMenu({ rates }: { rates: number[] }) {
  const rate = useMediaState("playbackRate");
  const remote = useMediaRemote();
  return (
    <Menu.Root>
      <Menu.Button className={cn(btn, "w-auto gap-1 px-2 text-xs tabular-nums")} aria-label="播放速度">
        <Gauge className="size-4" />
        {rate}×
      </Menu.Button>
      <Menu.Content
        className="z-10 flex min-w-28 flex-col rounded-[var(--radius)] border border-border bg-surface p-1 shadow-lg outline-none"
        placement="top end"
      >
        <Menu.RadioGroup className="flex flex-col" value={String(rate)}>
          {rates.map((r) => (
            <Menu.Radio
              key={r}
              value={String(r)}
              onSelect={() => remote.changePlaybackRate(r)}
              className="group flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm,0.375rem)] px-2.5 py-1.5 text-sm text-foreground outline-none data-[hocus]:bg-muted data-[focus]:bg-muted"
            >
              <span className="tabular-nums">{r}×</span>
              <Check className="size-4 opacity-0 group-data-[checked]:opacity-100" />
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

export function VideoControls({
  playbackRates,
  chapters,
  endScreen,
}: {
  playbackRates: number[];
  chapters?: VideoChapter[];
  endScreen?: ReactNode;
}) {
  const isPaused = useMediaState("paused");
  const isMuted = useMediaState("muted");
  const isFullscreen = useMediaState("fullscreen");
  const isPip = useMediaState("pictureInPicture");
  const isEnded = useMediaState("ended");
  const duration = useMediaState("duration");
  const remote = useMediaRemote();
  const markers = chapterMarkers(chapters, duration ?? 0);

  return (
    <Controls.Root
      className={cn(
        "absolute inset-0 z-10 flex flex-col justify-end opacity-0 transition-opacity data-[visible]:opacity-100",
        // 暂停时控制条常驻（含初始未播放态），不再只靠悬停浮现——否则看着像一张静止图。
        (isPaused || isEnded) && "opacity-100",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      {/* 播完结束屏：浮现覆盖层（自定义内容如「下一节」+ 内置重播）。优先级高于暂停大钮。 */}
      {isEnded ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/70 p-4 backdrop-blur-sm">
          {endScreen}
          <button
            type="button"
            onClick={() => {
              remote.seek(0);
              remote.play();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white outline-none transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="size-4" />
            重新播放
          </button>
        </div>
      ) : null}

      {/* 暂停态居中大播放按钮：给出明确的「可播放」提示 + 点击即播（结束屏出现时不显示） */}
      {isPaused && !isEnded ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <PlayButton
            className="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm outline-none transition hover:scale-105 hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-ring data-[focus]:ring-2 data-[focus]:ring-ring"
            aria-label="播放视频"
          >
            <Play className="size-7 translate-x-px fill-current" />
          </PlayButton>
        </div>
      ) : null}

      <Controls.Group className="relative px-3">
        <TimeSlider.Root className="group relative flex h-5 w-full cursor-pointer touch-none select-none items-center outline-none">
          <TimeSlider.Track className="relative h-1 w-full rounded-full bg-white/30">
            <TimeSlider.Progress className="absolute h-full rounded-full bg-white/40" />
            <TimeSlider.TrackFill className="absolute h-full rounded-full bg-primary" />
            {/* 章节分段标记（cue points）：进度条上的竖向 tick，hover 显示章节名 */}
            {markers.map((m, i) => (
              <span
                key={`${i}-${m.percent}`}
                className="group/cue absolute top-1/2 z-10 h-2.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-sm"
                style={{ left: `${m.percent}%` }}
              >
                <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[11px] text-white opacity-0 transition-opacity group-hover/cue:opacity-100">
                  {m.title}
                </span>
              </span>
            ))}
          </TimeSlider.Track>
          <TimeSlider.Thumb className="absolute size-3 -translate-x-1/2 rounded-full bg-primary opacity-0 ring-2 ring-white/60 transition-opacity group-hover:opacity-100 group-data-[dragging]:opacity-100" />
          <TimeSlider.Preview className="flex flex-col items-center" noClamp>
            <TimeSlider.Value className="rounded bg-black/80 px-1.5 py-0.5 text-xs tabular-nums text-white" />
          </TimeSlider.Preview>
        </TimeSlider.Root>
      </Controls.Group>

      <Controls.Group className="relative flex items-center gap-1 px-2 pb-2">
        <PlayButton className={btn} aria-label={isPaused ? "播放" : "暂停"}>
          {isPaused ? <Play className="size-5 fill-current" /> : <Pause className="size-5 fill-current" />}
        </PlayButton>

        <MuteButton className={btn} aria-label={isMuted ? "取消静音" : "静音"}>
          {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </MuteButton>

        <VolumeSlider.Root className="group relative flex h-9 w-20 cursor-pointer touch-none select-none items-center outline-none">
          <VolumeSlider.Track className="relative h-1 w-full rounded-full bg-white/30">
            <VolumeSlider.TrackFill className="absolute h-full rounded-full bg-white" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="absolute size-3 -translate-x-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 group-data-[dragging]:opacity-100" />
        </VolumeSlider.Root>

        <div className="flex items-center gap-1 px-2 text-xs tabular-nums text-white/90">
          <Time type="current" />
          <span className="text-white/50">/</span>
          <Time type="duration" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <PlaybackRateMenu rates={playbackRates} />
          <PIPButton className={btn} aria-label={isPip ? "退出画中画" : "画中画"}>
            <PictureInPicture className="size-5" />
          </PIPButton>
          <FullscreenButton className={btn} aria-label={isFullscreen ? "退出全屏" : "全屏"}>
            {isFullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}
          </FullscreenButton>
        </div>
      </Controls.Group>
    </Controls.Root>
  );
}
