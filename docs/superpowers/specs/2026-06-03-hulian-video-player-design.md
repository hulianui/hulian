# 瑚琏 Video 播放器组件 设计

- 日期: 2026-06-03
- 状态: 已通过 brainstorming，待 plan
- 引擎: `@vidstack/react`（React-first headless）
- 皮肤: 瑚琏自搓（token 驱动，复用 _icons / Slider / Menu 风格）

## 背景与动机

项目此前**没有真正的视频播放器**。唯一沾边的 `hero-video-dialog` 只是"缩略图 + 播放钮 → 弹出居中模态 → 模态内塞 `<iframe src>`"，无播放/暂停/进度/音量/全屏等任何控件，仅能喂 YouTube/Bilibili 嵌入页。需要补一个真正的 `Video` 组件。

## 引擎选型结论

候选：plyr（vanilla 成熟引擎，自带 UI，CSS 变量调色）/ Vidstack（React-first headless）/ 裸 `<video>` 自搓。

**选 Vidstack**。理由：瑚琏到处用"headless 引擎 + 自家 token 皮肤"模式（Table 引 TanStack、Chart 引 recharts、日期引 MUI X）。Vidstack 的 headless 模型让我们像搓 Table 一样搓 Player，UI 100% 是我们的、可被 token 自由换肤；plyr 会让我们继承它的 UI 再覆盖，长期与 token 体系拧着来。plyr 唯一优势（零依赖）在已为多个引擎引依赖的前提下不具决定性。

## 架构（沿用 recharts/Chart "引擎+皮肤"分层）

```
packages/ui/src/video/
  video.tsx           # 主组件: MediaPlayer + MediaProvider + 瑚琏控件层
  video-controls.tsx  # 控件条骨架: Controls.Root / Controls.Group 编排
  video.types.ts      # VideoProps
  video.showcase.tsx  # 文档站示例: 文件 / HLS / 海报 / 受控
  video.test.tsx      # 渲染 + 关键交互断言
  index.ts            # 桶导出
```

- **引擎**: `@vidstack/react` 的 `MediaPlayer` / `MediaProvider` + primitives（`PlayButton` / `MuteButton` / `FullscreenButton` / `PIPButton` / `TimeSlider` / `VolumeSlider` / `Menu`）+ `useMediaState` hook。
- **皮肤**: 控件全部用 Tailwind + 瑚琏 token class 自搓；图标走自有 `../_icons`（**不引** `@vidstack/react/icons`）；交互态吃 Vidstack 暴露的 `data-*`（`data-active` / `data-focus` / `data-hocus` 等）。
- **CSS**: 仅引 Vidstack 的 `base.css`（slider / 媒体布局最小 reset），**不引**默认主题 `default-theme.css`。

## 控件范围（首版 = 核心集）

- 播放 / 暂停
- 进度条（带缓冲条 + hover 预览时间）
- 当前时长 / 总时长
- 音量（静音钮 + 滑条）
- 倍速菜单：档位 `0.5 / 0.75 / 1 / 1.25 / 1.5 / 2`，默认 `1`
- 画中画（PiP）
- 全屏

**留作后续**（types 预留扩展位、不堵死）：移动端手势（双击快进 / 滑动音量）、字幕（VTT）菜单、多画质切换菜单。

## 片源（文件 + HLS）

- `src` 支持：单个 mp4/webm 文件 URL、`.m3u8`（HLS）、或多源数组。
- HLS：由 Vidstack 按需加载 hls.js。**决策（v1）**：默认沿用 Vidstack 的"从 CDN 动态拉 hls.js"行为（零额外打包负担）；在 `video.types` / 文档中暴露"可自托管 hls.js 加载器"的口子，但 v1 不实现自托管逻辑。
- 暂不支持 YouTube / Vimeo（本次未选）。

## API 形态（prop 驱动优先，不过早 headless 化）

```ts
interface VideoProps {
  src: string | { src: string; type?: string }[];
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  crossOrigin?: boolean | string;
  aspectRatio?: string;          // 默认 "16/9"
  playbackRates?: number[];      // 默认 [0.5,0.75,1,1.25,1.5,2]
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}
```

单组件、prop 驱动。**暂不**对外暴露 compound slots（`Video.Controls` 之类）——YAGNI，有真实组合需求再开。

## token 桥接

- 进度条 / 音量滑条视觉对齐现有 Slider；颜色走 `var(--primary)` / `var(--border)` / `var(--surface)` / `var(--foreground)` 等语义 token。
- 明暗自适应靠 token 自身切换，不写第二套配色。
- 倍速 / 后续菜单复用瑚琏 Menu/Popover 的视觉规范（圆角 `var(--radius)`、`var(--surface)` 背景、`var(--border)` 描边）。

## 与 hero-video-dialog 的关系

**互不影响**。`hero-video-dialog` 是营销落地页的"缩略图弹框"，职责不同，保留不动。

## 依赖 & 集成

- `packages/ui` 的 `dependencies` 新增 `@vidstack/react`（其内部按需带 hls.js，不直接依赖 hls.js）。
- 桶导出 `packages/ui/src/index.ts` 加 `Video` + `VideoProps`。
- 进 manifest / registry / 文档站（与现有组件同流程），分类归"数据展示 / 媒体"（实现期对齐 manifest 现有分类命名）。

## 测试策略

- jsdom 下断言：组件渲染、控件可见性、受控事件透传（`onPlay`/`onPause` 等到可断言层）。
- Vidstack 真实媒体行为（seek / 全屏 / PiP）在 jsdom 有限——重交互靠 `video.showcase` 人工实机验，测试里 mock 到可断言层，不强测浏览器原生媒体 API。

## 已知风险 / 待实现期确认

1. Vidstack `base.css` 的引入方式（组件内 import vs 文档站全局），需与瑚琏现有 CSS 注入约定对齐。
2. hls.js 默认 CDN 拉取在内网/离线环境会失效——文档需注明，自托管口子留好。
3. jsdom 对 `HTMLMediaElement` 支持不全，测试需 mock，避免假阴性。
4. Vidstack primitives 的 `data-*` 状态属性命名以实现期实际 API 为准（按 context7 文档：`data-active`/`data-focus`/`data-hocus`）。
