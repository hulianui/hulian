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
} from "../_icons";
import { cn } from "../lib/cn";

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

export function VideoControls({ playbackRates }: { playbackRates: number[] }) {
  const isPaused = useMediaState("paused");
  const isMuted = useMediaState("muted");
  const isFullscreen = useMediaState("fullscreen");
  const isPip = useMediaState("pictureInPicture");

  return (
    <Controls.Root className="absolute inset-0 z-10 flex flex-col justify-end opacity-0 transition-opacity data-[visible]:opacity-100">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      <Controls.Group className="relative px-3">
        <TimeSlider.Root className="group relative flex h-5 w-full cursor-pointer touch-none select-none items-center outline-none">
          <TimeSlider.Track className="relative h-1 w-full rounded-full bg-white/30">
            <TimeSlider.Progress className="absolute h-full rounded-full bg-white/40" />
            <TimeSlider.TrackFill className="absolute h-full rounded-full bg-primary" />
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
