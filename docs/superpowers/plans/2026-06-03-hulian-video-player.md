# 瑚琏 Video 播放器组件 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@hulian/ui` 新增一个真正的 `Video` 播放器组件，以 Vidstack 为引擎、瑚琏 token 自搓皮肤，支持文件 + HLS，核心控件集齐全。

**Architecture:** 沿用 recharts/Chart 的「引擎 + 皮肤」分层。`@vidstack/react` 的 `MediaPlayer`/`MediaProvider` + primitives 提供媒体引擎与状态；控件条用 Tailwind + 瑚琏语义 token 自搓，图标走自有 `../_icons`，交互态吃 Vidstack 暴露的 `data-*`。纯逻辑（时间格式化、src 归一化、默认倍速）抽成可单测的纯函数。

**Tech Stack:** React 18+, TypeScript, `@vidstack/react`(内部按需带 hls.js), Tailwind v4, Vitest + jsdom, Testing Library。

参考设计：`docs/superpowers/specs/2026-06-03-hulian-video-player-design.md`

---

## 接线点总览（实现期会触达的所有文件）

**新建（组件本体，`packages/ui/src/video/`）：**
- `video.types.ts` — `VideoProps` 类型 + 纯逻辑（`formatTime` / `normalizeSrc` / `DEFAULT_PLAYBACK_RATES`）
- `video-controls.tsx` — 控件条骨架（`Controls.Root`/`Group` 编排 + 各控件 + 倍速菜单）
- `video.tsx` — 主组件（`MediaPlayer` + `MediaProvider` + `Poster` + 控件层 + base.css 引入）
- `video.showcase.tsx` — 文档站 `ShowcaseSpec`（文件 / HLS / 海报 / 受控）
- `video.test.tsx` — 纯逻辑单测 + 渲染冒烟
- `index.ts` — 桶导出

**修改（接线）：**
- `packages/ui/package.json` — `dependencies` 加 `@vidstack/react`
- `packages/ui/src/index.ts` — 加 `export * from "./video";`
- `packages/ui/src/showcase.ts` — 加 `export { videoShowcase } from "./video/video.showcase";`
- `apps/www/lib/manifest.ts` — 加 Video 条目（`data-display` / `collection`）
- `apps/www/lib/registry.tsx` — import `videoShowcase` + `specBySlug` 加 `video: videoShowcase`

**测试命令（单文件）：** `pnpm --filter @hulian/ui exec vitest run src/video/video.test.tsx`
**类型检查：** `pnpm --filter @hulian/ui typecheck`

---

## Task 1: 依赖 + 纯逻辑与类型（TDD 核心可单测层）

**Files:**
- Modify: `packages/ui/package.json`（dependencies 加 `@vidstack/react`）
- Create: `packages/ui/src/video/video.types.ts`
- Create: `packages/ui/src/video/video.test.tsx`

- [ ] **Step 1: 安装依赖**

Run:
```bash
pnpm --filter @hulian/ui add @vidstack/react
```
Expected: `packages/ui/package.json` 的 `dependencies` 出现 `"@vidstack/react": "^1.x"`，lockfile 更新。

- [ ] **Step 2: 写失败的纯逻辑测试**

Create `packages/ui/src/video/video.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { formatTime, normalizeSrc, DEFAULT_PLAYBACK_RATES } from "./video.types";

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
```

- [ ] **Step 3: 运行测试确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run src/video/video.test.tsx`
Expected: FAIL —「Failed to resolve import "./video.types"」或函数未定义。

- [ ] **Step 4: 写 types + 纯逻辑实现**

Create `packages/ui/src/video/video.types.ts`:
```ts
import type { ReactNode } from "react";

/** 默认倍速档位（设计已定）。 */
export const DEFAULT_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

/** Vidstack 可接受的 src 形态：单 URL（文件/.m3u8）或多源数组。 */
export type VideoSource = string | { src: string; type?: string }[];

export interface VideoProps {
  /** 文件 URL / HLS .m3u8 / 多源数组。 */
  src: VideoSource;
  /** 海报图。 */
  poster?: string;
  /** 无障碍标题，也用于内部 aria。 */
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  /** 透传给底层 media 的 crossorigin。 */
  crossOrigin?: boolean | string;
  /** CSS aspect-ratio，默认 "16/9"。 */
  aspectRatio?: string;
  /** 倍速档位，默认 DEFAULT_PLAYBACK_RATES。 */
  playbackRates?: number[];
  className?: string;
  /** —— 后续扩展位（v1 未实现，预留不堵死）—— */
  children?: ReactNode;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  /** 播放进度回调，单位秒。 */
  onTimeUpdate?: (currentTime: number) => void;
}

/** 秒 → 人读时间。NaN/负数/Infinity 兜底 0:00；≥1h 走 h:mm:ss。 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/** src 归一化（v1 直接透传，留作未来 YouTube/Vimeo 适配钩子）。 */
export function normalizeSrc(src: VideoSource): VideoSource {
  return src;
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run src/video/video.test.tsx`
Expected: PASS（6 个 it 全绿）。

- [ ] **Step 6: 提交**

```bash
git add packages/ui/package.json pnpm-lock.yaml packages/ui/src/video/video.types.ts packages/ui/src/video/video.test.tsx
git commit -m "feat(ui): Video 纯逻辑层(types/formatTime/normalizeSrc) + @vidstack/react 依赖"
```

---

## Task 2: 控件条骨架 `video-controls.tsx`

控件条用 Vidstack primitives 提供行为、瑚琏 token 提供皮肤、`../_icons` 提供图标。**不依赖 `useMediaState('viewType')` 做条件渲染**（我们已知是 video，控件恒挂，避免 jsdom 下状态未就绪导致控件不出）。

**Files:**
- Create: `packages/ui/src/video/video-controls.tsx`

- [ ] **Step 1: 写控件条实现**

Create `packages/ui/src/video/video-controls.tsx`:
```tsx
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
        <Menu.RadioGroup
          className="flex flex-col"
          value={String(rate)}
        >
          {rates.map((r) => (
            <Menu.Radio
              key={r}
              value={String(r)}
              onSelect={() => remote.changePlaybackRate(r)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm,0.375rem)] px-2.5 py-1.5 text-sm text-foreground outline-none data-[hocus]:bg-muted data-[focus]:bg-muted"
            >
              <span className="tabular-nums">{r}×</span>
              <Check className="size-4 opacity-0 group-data-[checked]:opacity-100 data-[checked]:opacity-100" />
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
      {/* 底部渐变遮罩，保证控件在亮画面上可读 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      {/* 进度条 */}
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

      {/* 控件行 */}
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
```

- [ ] **Step 2: 确认 `../_icons` 已导出所需图标**

Run:
```bash
grep -nE "Play|Pause|Volume2|VolumeX|Maximize|Minimize|PictureInPicture|Gauge|Check" packages/ui/src/_icons/index.ts
```
Expected: 命中 `Play`/`Pause`/`Check` 等。**若某图标缺失**（如 `PictureInPicture`/`Gauge`），按 `_icons/index.ts` 现有风格补一行 `export { PictureInPicture, Gauge } from "lucide-react";`（瑚琏 `_icons` 是 lucide 再导出层，沿用即可），与本组件同次提交。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/video/video-controls.tsx packages/ui/src/_icons/index.ts
git commit -m "feat(ui): Video 控件条骨架(Vidstack primitives + 瑚琏 token 皮肤)"
```

> 注：本任务无独立单测——控件依赖 Vidstack 媒体上下文，留到 Task 3 主组件挂载后由冒烟测试覆盖；真实交互（seek/全屏/PiP）由 showcase 人工实机验（见设计文档测试策略）。

---

## Task 3: 主组件 `video.tsx` + 桶导出

**Files:**
- Create: `packages/ui/src/video/video.tsx`
- Create: `packages/ui/src/video/index.ts`

- [ ] **Step 1: 写主组件**

Create `packages/ui/src/video/video.tsx`:
```tsx
"use client";
import "@vidstack/react/player/styles/base.css";
import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
import { cn } from "../lib/cn";
import { VideoControls } from "./video-controls";
import { DEFAULT_PLAYBACK_RATES, formatTime, normalizeSrc, type VideoProps } from "./video.types";

// Vidstack 引擎（媒体加载/HLS/状态）+ 瑚琏皮肤（控件 token 化）。
// HLS：src 给 .m3u8 即可，Vidstack 按需加载 hls.js（v1 默认 CDN，自托管口子见 types 注释/文档）。
export function Video({
  src,
  poster,
  title,
  autoPlay,
  muted,
  loop,
  crossOrigin,
  aspectRatio = "16/9",
  playbackRates,
  className,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: VideoProps) {
  const rates = playbackRates ?? [...DEFAULT_PLAYBACK_RATES];
  return (
    <MediaPlayer
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius)] border border-border bg-black text-white",
        className,
      )}
      title={title}
      src={normalizeSrc(src)}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      crossOrigin={crossOrigin as never}
      aspectRatio={aspectRatio}
      playsInline
      viewType="video"
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
      onTimeUpdate={(detail) => onTimeUpdate?.(detail.currentTime)}
    >
      <MediaProvider>
        {poster ? (
          <Poster className="absolute inset-0 size-full object-cover opacity-0 transition-opacity data-[visible]:opacity-100" src={poster} alt={title ?? ""} />
        ) : null}
      </MediaProvider>
      <VideoControls playbackRates={rates} />
    </MediaPlayer>
  );
}

// 复出纯逻辑，便于消费侧/测试引用。
export { formatTime, normalizeSrc };
```

> **API 校验说明：** `onTimeUpdate` 回调入参形态、`crossOrigin` 类型、`Poster` props 以 `@vidstack/react` 实际类型为准——Step 3 的 `typecheck` 会暴露任何签名不符；若 `onTimeUpdate` 入参不是 `{ currentTime }` 而是事件对象，改成 `(nativeEvent) => onTimeUpdate?.(nativeEvent.target.currentTime)` 或按类型提示取值。`crossOrigin as never` 是为绕过布尔/字符串联合与 Vidstack 严格类型的临时桥，typecheck 报错则改为 `crossOrigin ? "" : undefined` 的字符串化。

- [ ] **Step 2: 写桶导出**

Create `packages/ui/src/video/index.ts`:
```ts
export { Video } from "./video";
export { formatTime, normalizeSrc, DEFAULT_PLAYBACK_RATES } from "./video.types";
export type { VideoProps, VideoSource } from "./video.types";
```

- [ ] **Step 3: 类型检查**

Run: `pnpm --filter @hulian/ui typecheck`
Expected: PASS。**若报 Vidstack API 签名错**，按 Step 1 校验说明就地修正（仅调 prop/回调取值，不改组件结构），直到 PASS。

- [ ] **Step 4: 提交**

```bash
git add packages/ui/src/video/video.tsx packages/ui/src/video/index.ts
git commit -m "feat(ui): Video 主组件(MediaPlayer+MediaProvider+Poster+控件层) + 桶导出"
```

---

## Task 4: 渲染冒烟测试

在 Task 1 的纯逻辑测试基础上，追加「组件能挂载且核心控件出现」的冒烟用例。Vidstack 在 jsdom 下可能在挂载时触碰未实现的媒体 API——本任务先尝试真实渲染，失败再降级为 mock。

**Files:**
- Modify: `packages/ui/src/video/video.test.tsx`

- [ ] **Step 1: 追加冒烟测试**

在 `video.test.tsx` 末尾追加：
```tsx
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { Video } from "./video";

afterEach(() => cleanup());

describe("<Video> 渲染冒烟", () => {
  it("挂载不抛错且渲出播放钮", () => {
    render(<Video src="https://files.vidstack.io/sprite-fight/720p.mp4" title="演示" />);
    // 控件恒挂（不依赖 viewType 状态）：播放钮 aria 在
    expect(screen.getByLabelText(/播放|暂停/)).toBeTruthy();
  });

  it("HLS .m3u8 src 也能挂载", () => {
    render(<Video src="https://files.vidstack.io/sprite-fight/hls/stream.m3u8" />);
    expect(screen.getByLabelText(/静音|取消静音/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `pnpm --filter @hulian/ui exec vitest run src/video/video.test.tsx`
Expected: PASS。

**若 Vidstack 在 jsdom 下挂载抛错**（如 `customElements`/`HTMLMediaElement` 相关），在测试文件顶部（import 之前）加入下面的 mock 把 Vidstack 降级为透传 host 元素，再跑通：
```tsx
import { vi } from "vitest";
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
```
> 该 mock 是 jsdom 兜底（媒体引擎本就无法在 jsdom 真跑）；真实播放/控件交互由 showcase 人工实机验。记录选择哪条路径。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/video/video.test.tsx
git commit -m "test(ui): Video 渲染冒烟(含 jsdom Vidstack 兜底 mock 方案)"
```

---

## Task 5: Showcase

**Files:**
- Create: `packages/ui/src/video/video.showcase.tsx`

- [ ] **Step 1: 写 showcase**

Create `packages/ui/src/video/video.showcase.tsx`:
```tsx
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
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --filter @hulian/ui typecheck`
Expected: PASS（showcase 的 `ShowcaseSpec` 形态对齐）。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/video/video.showcase.tsx
git commit -m "feat(ui): Video showcase(文件/海报/HLS/宽高比)"
```

---

## Task 6: 接线（桶 + showcase 桶 + manifest + registry）

**Files:**
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/showcase.ts`
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: 主桶导出**

在 `packages/ui/src/index.ts` 中 `export * from "./hero-video-dialog";`（第 127 行附近）后追加：
```ts
export * from "./video";
```

- [ ] **Step 2: showcase 桶导出**

在 `packages/ui/src/showcase.ts` 中 `export { heroVideoDialogShowcase } ...`（第 61 行附近）后追加：
```ts
export { videoShowcase } from "./video/video.showcase";
```

- [ ] **Step 3: manifest 加条目**

在 `apps/www/lib/manifest.ts` 的 `carousel` 条目（`category: "data-display", group: "collection"`，第 188 行附近）后追加：
```ts
  { slug: "video", name: "Video", description: "视频播放器 · Vidstack 引擎 + 瑚琏 token 自搓皮肤(播放/进度/音量/倍速/PiP/全屏) + 文件/HLS", category: "data-display", group: "collection", status: "new" },
```

- [ ] **Step 4: registry 接入**

在 `apps/www/lib/registry.tsx` 的 import 块加入 `videoShowcase`（与 `carouselShowcase` 同列）：
```ts
  videoShowcase,
```
并在 `specBySlug` 映射中 `carousel: carouselShowcase,`（第 178 行附近）后追加：
```ts
  video: videoShowcase,
```

- [ ] **Step 5: 跑 manifest 测试 + 全量 typecheck**

Run:
```bash
pnpm --filter @hulian/ui exec vitest run src/video/video.test.tsx
pnpm --filter www exec vitest run lib/manifest.test.ts
pnpm --filter @hulian/ui typecheck
```
Expected: 全 PASS。manifest.test 校验 group 合法（`collection` 在 `data-display` 的 groups 内）。

- [ ] **Step 6: 提交**

```bash
git add packages/ui/src/index.ts packages/ui/src/showcase.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(ui): Video 接线(主桶/showcase 桶/manifest/registry)"
```

---

## Task 7: 全量验证 + 文档站实机验

**Files:** 无新增，仅验证。

- [ ] **Step 1: 全量构建 + 类型 + 测试**

Run:
```bash
pnpm --filter @hulian/ui typecheck && pnpm --filter @hulian/ui test
pnpm --filter www build
```
Expected: 三者皆 PASS（`www build` 能把 Video 文档页静态产出，证明 base.css 引入与 RSC/client 边界无误）。

- [ ] **Step 2: 文档站起预览人工验**

Run（注意：用 filter，避免根 `pnpm dev` 的 kill:stale 误杀桌面 app 5514——见记忆 `hulian-pnpm-dev-killstale-kills-5514`）：
```bash
pnpm --filter www dev
```
打开 Video 组件页，人工核对（jsdom 测不到的部分）：
- 播放/暂停切换、进度条 seek + 缓冲条、hover 预览时间
- 音量滑条 + 静音切换
- 倍速菜单切档生效
- 画中画进/出、全屏进/出
- 海报在播放前显示、起播后隐去
- 明/暗主题切换控件颜色随 token 走
- HLS `.m3u8` 用例能正常起播（验证 Vidstack 按需拉 hls.js）

- [ ] **Step 3: （如有微调）提交**

```bash
git add -A packages/ui/src/video
git commit -m "fix(ui): Video 实机验后皮肤/交互微调"
```

---

## Self-Review 记录

**Spec 覆盖核对：**
- 引擎 Vidstack ✓(Task 3) / 自搓 token 皮肤 ✓(Task 2) / 核心控件集 ✓(Task 2，播放·进度+缓冲+预览·时长·音量·倍速·PiP·全屏全覆盖) / 文件+HLS ✓(Task 3 src 透传 .m3u8 + Task 5/7 验) / 倍速档位 `[0.5..2]` ✓(Task 1) / 单组件 prop API ✓(Task 1 types) / 不暴露 compound slots ✓ / hero-video-dialog 不动 ✓ / token 桥接 ✓(Task 2) / 依赖入 dependencies ✓(Task 1) / manifest+registry+桶接线 ✓(Task 6) / 测试策略(纯逻辑硬测 + 冒烟 + 人工实机) ✓(Task 1/4/7)。
- 设计「待实现期确认」4 点均落到任务：base.css 引入(Task 3 Step1 + Task 7 build 验) / hls.js CDN 失效文档注记(types 注释 + Task 7 HLS 验) / jsdom mock(Task 4 兜底) / `data-*` 命名以实际为准(Task 3 typecheck 兜)。

**占位符扫描：** 无 TBD/TODO；每个写码步骤均给出完整代码；Vidstack API 不确定处以「typecheck 兜 + 就地修正说明」收口，非占位。

**类型一致性：** `VideoProps`/`VideoSource`/`formatTime`/`normalizeSrc`/`DEFAULT_PLAYBACK_RATES` 在 types(Task1)、主组件(Task3)、桶(Task3)、测试(Task1/4)、showcase(Task5) 间命名一致；`videoShowcase` 在 showcase.ts(Task6 S2)与 registry(Task6 S4)一致；manifest group `collection` 经 manifest.test 校验(Task6 S5)。
