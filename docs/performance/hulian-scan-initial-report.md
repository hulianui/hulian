# Hulian Scan 首次全局性能扫描报告

> 扫描日期：2026-08-02。范围仅为 HulianUI 仓库内部工具与 HulianUI 自身；不是对外发布的通用 profiler。

> 2026-08-02 优化后复验见文末“优化后复验”。首次扫描数据作为 before 证据保留，不用新基线覆盖。

## 结论

公开运行时 inventory 共 380 个入口：372 个可渲染入口全部完成场景，8 个非渲染入口都有显式原因，0 个未分类。
仓库外真实 tarball 消费扫描完成 372/372 个测量场景和 190 个诊断场景；0 个执行错误、0 个缺失 React commit、每个测量场景 5 个样本。
原始 packed 扫描得到 125 条硬 findings，覆盖 108 个场景；首版基线只接纳 264 个无硬违规场景，其余 108 个没有被“基线化为正常”。

## 快照与环境

| 项目 | Workspace | Packed consumer |
| --- | --- | --- |
| Git revision | `9fe5f8fbe85fd9c0f71665b7bb7f4f9a1594d269` | `50f1d19f3e404a998cd03fd24eb084de3c5ba82f` |
| React | 19.2.8 | 19.2.8 |
| Chromium | 151.0.7922.34 | 151.0.7922.34 |
| Node | 22.22.3 | 22.22.3 |
| 测量场景 | 372 | 372 |
| Findings | 133 | 125 |
| 执行错误 | 0 | 0 |

Workspace 首扫从 `9fe5f8fbe85fd9c0f71665b7bb7f4f9a1594d269` 启动；扫描期间存在随后分别进入 `15f8a90` 和 `50f1d19` 的工作区修改：`apps/perf-lab/app/harness.browser.test.ts`、`packages/hulian-scan/src/runner/default-dependencies.ts`、对应 scanner test、`packages/ui/src/ghost-cursor/ghost-cursor.tsx` 与对应 test。Packed 首扫使用干净的 `50f1d19f3e404a998cd03fd24eb084de3c5ba82f` tarball，因此基线只取 packed 结果。

### GPU 解释边界

Chromium 151 在本次默认 headless 启动下报告 ANGLE SwiftShader 软件渲染器，而同一浏览器加 `--use-angle=metal` 后报告 Apple M1 Pro Metal。受控单样本对照中，`laser-flow/frame-budget` 从 SwiftShader 的 282–552ms 长任务降到 Metal 89ms，`galaxy/frame-budget` 从 154–404ms 降到 70ms；`faulty-terminal/frame-budget` 在 Metal 下仍为 511ms。故初扫的 WebGL findings 保留为原始证据，但优化计划先修扫描器的 GPU 元数据与本机 Metal 路径，再把仍复现的目标认定为源码缺陷。CI 无硬件 GPU 时不得把 SwiftShader 帧耗时写入发布基线。

## 覆盖率

场景类别：`standard` 210，`animation` 151，`core` 4，`heavy` 7。Inventory 中 animated=151，WebGL=41。

非渲染入口：

- `@hulianui/ui/access`：Access providers and authorization helpers have no standalone visual showcase
- `@hulianui/ui/config`：Configuration provider and locale helpers have no standalone visual showcase
- `@hulianui/ui/lib`：Utility-only entry with no React render surface
- `@hulianui/ui/motion`：Motion primitives and provider infrastructure have no standalone showcase
- `@hulianui/ui/showcase`：Showcase metadata barrel, not a component entry
- `@hulianui/ui/theme`：Theme provider and hooks have no standalone visual showcase
- `@hulianui/ui/vite`：Vite plugin, no React render export
- `@hulianui/ui/vitest-preset`：Vitest preset, no React render export

## Packed findings 汇总

- `cascade-fanout`：41
- `avoidable-render`：55
- `long-task`：16
- `dropped-frames`：13

## 最慢提交（Packed median）

| 排名 | 场景 | median commit |
| ---: | --- | ---: |
| 1 | `select/stress` | 72.70ms |
| 2 | `country-select/basic` | 46.20ms |
| 3 | `chart/stress` | 23.90ms |
| 4 | `qrcode/basic` | 19.10ms |
| 5 | `contribution-graph/basic` | 16.40ms |
| 6 | `pro-table/stress` | 13.70ms |
| 7 | `table/stress` | 13.10ms |
| 8 | `infinite-menu/frame-budget` | 11.40ms |
| 9 | `menubar/basic` | 11.00ms |
| 10 | `date-range-picker/basic` | 11.00ms |
| 11 | `date-time-picker/basic` | 10.60ms |
| 12 | `region-cascader/basic` | 9.30ms |
| 13 | `combobox/basic` | 8.90ms |
| 14 | `menu/basic` | 8.90ms |
| 15 | `time-picker/basic` | 8.50ms |
| 16 | `date-picker/basic` | 7.40ms |
| 17 | `password-generator/basic` | 7.30ms |
| 18 | `popconfirm/basic` | 7.20ms |
| 19 | `glimpse/basic` | 7.00ms |
| 20 | `search-form/basic` | 7.00ms |
| 21 | `navigation-menu/basic` | 7.00ms |
| 22 | `popover/basic` | 6.70ms |
| 23 | `hover-card/basic` | 6.70ms |
| 24 | `dialog/cycles` | 6.70ms |
| 25 | `drawer/basic` | 6.60ms |
| 26 | `tree-select/basic` | 6.30ms |
| 27 | `curved-loop/frame-budget` | 6.10ms |
| 28 | `image-cropper/basic` | 6.00ms |
| 29 | `admin-layout/basic` | 6.00ms |
| 30 | `video/basic` | 5.60ms |
| 31 | `form-dialog/basic` | 5.50ms |
| 32 | `command/basic` | 5.20ms |
| 33 | `scheduler/basic` | 5.10ms |
| 34 | `cascader/basic` | 5.00ms |
| 35 | `nav-menu/basic` | 5.00ms |
| 36 | `color-swatch-picker/basic` | 4.70ms |
| 37 | `sortable/basic` | 4.70ms |
| 38 | `route-tabs/basic` | 4.70ms |
| 39 | `editable-table/basic` | 4.40ms |
| 40 | `form/validation` | 4.40ms |
| 41 | `tabs/basic` | 4.30ms |
| 42 | `layout/basic` | 4.10ms |
| 43 | `action-sheet/basic` | 4.00ms |
| 44 | `accordion/basic` | 3.90ms |
| 45 | `checkbox/basic` | 3.80ms |
| 46 | `queue-lane/basic` | 3.70ms |
| 47 | `remote-select/basic` | 3.70ms |
| 48 | `scroll-area/basic` | 3.60ms |
| 49 | `login-form/basic` | 3.50ms |
| 50 | `dock/basic` | 3.50ms |
| 51 | `shuffle/frame-budget` | 3.50ms |
| 52 | `alert-dialog/basic` | 3.40ms |
| 53 | `code-review-thread/basic` | 3.30ms |
| 54 | `pagination/basic` | 3.30ms |
| 55 | `radio/basic` | 3.20ms |
| 56 | `list/basic` | 3.20ms |
| 57 | `kanban/basic` | 3.10ms |
| 58 | `calendar/basic` | 3.10ms |
| 59 | `checkbox-group/basic` | 3.10ms |
| 60 | `click-captcha/basic` | 3.10ms |
| 61 | `pro-form/basic` | 3.00ms |
| 62 | `document-sheet/basic` | 2.90ms |
| 63 | `steps-form/basic` | 2.80ms |
| 64 | `page-header/basic` | 2.80ms |
| 65 | `number-field/basic` | 2.80ms |
| 66 | `world-map/frame-budget` | 2.80ms |
| 67 | `icon-picker/basic` | 2.80ms |
| 68 | `prompt-input/basic` | 2.60ms |
| 69 | `tooltip/basic` | 2.60ms |
| 70 | `flow/basic` | 2.50ms |
| 71 | `tool-call/basic` | 2.50ms |
| 72 | `collapsible/basic` | 2.40ms |
| 73 | `markdown/basic` | 2.40ms |
| 74 | `transfer/basic` | 2.40ms |
| 75 | `code-diff/basic` | 2.40ms |
| 76 | `gantt/basic` | 2.40ms |
| 77 | `masonry/basic` | 2.40ms |
| 78 | `pricing-table/basic` | 2.40ms |
| 79 | `field/basic` | 2.40ms |
| 80 | `slider/basic` | 2.30ms |
| 81 | `context-menu/basic` | 2.30ms |
| 82 | `resizable/basic` | 2.30ms |
| 83 | `emoji-picker/basic` | 2.20ms |
| 84 | `git-commit/basic` | 2.20ms |
| 85 | `cubes/frame-budget` | 2.20ms |
| 86 | `button-group/basic` | 2.20ms |
| 87 | `comment/basic` | 2.10ms |
| 88 | `confirm-card/basic` | 2.10ms |
| 89 | `sankey/basic` | 2.10ms |
| 90 | `artifact/basic` | 2.10ms |
| 91 | `markdown-editor/stress` | 2.10ms |
| 92 | `colorpicker/basic` | 2.10ms |
| 93 | `app-launcher/basic` | 2.00ms |
| 94 | `funnel/basic` | 1.90ms |
| 95 | `switch/basic` | 1.90ms |
| 96 | `conversation/basic` | 1.90ms |
| 97 | `question-card/basic` | 1.80ms |
| 98 | `statistic/basic` | 1.80ms |
| 99 | `toolbar/basic` | 1.80ms |
| 100 | `scope-matrix/basic` | 1.80ms |
| 101 | `service-message/basic` | 1.80ms |
| 102 | `task-runner/basic` | 1.80ms |
| 103 | `code-block/basic` | 1.80ms |
| 104 | `tree/stress` | 1.80ms |
| 105 | `heatmap/basic` | 1.70ms |
| 106 | `button/basic` | 1.70ms |
| 107 | `upload/basic` | 1.70ms |
| 108 | `dome-gallery/frame-budget` | 1.70ms |
| 109 | `timeline/basic` | 1.70ms |
| 110 | `banner/basic` | 1.70ms |
| 111 | `anchor/basic` | 1.70ms |
| 112 | `notification/basic` | 1.70ms |
| 113 | `tour/basic` | 1.70ms |
| 114 | `toggle/basic` | 1.70ms |
| 115 | `carousel/basic` | 1.70ms |
| 116 | `skeleton/basic` | 1.70ms |
| 117 | `deploy-status/basic` | 1.60ms |
| 118 | `bento-grid/basic` | 1.60ms |
| 119 | `meter/basic` | 1.60ms |
| 120 | `event-stream/basic` | 1.60ms |
| 121 | `json-viewer/basic` | 1.60ms |
| 122 | `choicebox/basic` | 1.60ms |
| 123 | `live-player/basic` | 1.60ms |
| 124 | `rating/basic` | 1.60ms |
| 125 | `steps/basic` | 1.60ms |
| 126 | `avatar/basic` | 1.50ms |
| 127 | `dossier/basic` | 1.50ms |
| 128 | `listbox/basic` | 1.50ms |
| 129 | `voice-record/basic` | 1.50ms |
| 130 | `file-tree/basic` | 1.50ms |
| 131 | `segmented/basic` | 1.50ms |
| 132 | `modal/basic` | 1.50ms |
| 133 | `back-top/basic` | 1.50ms |
| 134 | `chat-message/basic` | 1.50ms |
| 135 | `award-badge/basic` | 1.50ms |
| 136 | `agent-plan/basic` | 1.40ms |
| 137 | `navbar/basic` | 1.40ms |
| 138 | `input-otp/basic` | 1.40ms |
| 139 | `stepper/basic` | 1.40ms |
| 140 | `chip/basic` | 1.40ms |
| 141 | `hero-video-dialog/basic` | 1.40ms |
| 142 | `affix/basic` | 1.40ms |
| 143 | `input/basic` | 1.30ms |
| 144 | `live-chat/basic` | 1.30ms |
| 145 | `snippet/basic` | 1.30ms |
| 146 | `spin/basic` | 1.30ms |
| 147 | `message-actions/basic` | 1.30ms |
| 148 | `credit-card/basic` | 1.30ms |
| 149 | `sparkline/basic` | 1.30ms |
| 150 | `textarea/basic` | 1.30ms |
| 151 | `time-field/basic` | 1.30ms |
| 152 | `pull-to-refresh/basic` | 1.20ms |
| 153 | `alert/basic` | 1.20ms |
| 154 | `toast/basic` | 1.20ms |
| 155 | `grid/basic` | 1.20ms |
| 156 | `math-text/basic` | 1.20ms |
| 157 | `scroll-float/frame-budget` | 1.20ms |
| 158 | `shield-badge/basic` | 1.20ms |
| 159 | `color-field/basic` | 1.20ms |
| 160 | `decrypted-text/frame-budget` | 1.20ms |
| 161 | `intercept-card/basic` | 1.20ms |
| 162 | `stat/basic` | 1.20ms |
| 163 | `coupon/basic` | 1.10ms |
| 164 | `result/basic` | 1.10ms |
| 165 | `tab-bar/basic` | 1.10ms |
| 166 | `annotation/basic` | 1.10ms |
| 167 | `fab/basic` | 1.10ms |
| 168 | `separator/basic` | 1.10ms |
| 169 | `logo-loop/frame-budget` | 1.10ms |
| 170 | `virtual-list/scroll` | 1.10ms |
| 171 | `dot-pattern/basic` | 1.10ms |
| 172 | `viewport/basic` | 1.10ms |
| 173 | `breadcrumb/basic` | 1.00ms |
| 174 | `tag/basic` | 1.00ms |
| 175 | `avatar-circles/basic` | 1.00ms |
| 176 | `diff-stat/basic` | 1.00ms |
| 177 | `divider/basic` | 1.00ms |
| 178 | `mentions/basic` | 1.00ms |
| 179 | `region-select/basic` | 1.00ms |
| 180 | `user/basic` | 1.00ms |
| 181 | `animated-beam/frame-budget` | 1.00ms |
| 182 | `descriptions/basic` | 1.00ms |
| 183 | `fit-screen/basic` | 1.00ms |
| 184 | `grid-pattern/basic` | 1.00ms |
| 185 | `secret-field/basic` | 1.00ms |
| 186 | `prose/basic` | 0.90ms |
| 187 | `badge/basic` | 0.90ms |
| 188 | `picker/basic` | 0.90ms |
| 189 | `progressive-blur/basic` | 0.90ms |
| 190 | `score-ring/basic` | 0.90ms |
| 191 | `status-dot/basic` | 0.90ms |
| 192 | `code/basic` | 0.90ms |
| 193 | `live-product-card/basic` | 0.90ms |
| 194 | `heading/basic` | 0.90ms |
| 195 | `social-button/basic` | 0.90ms |
| 196 | `brand/basic` | 0.90ms |
| 197 | `card/basic` | 0.90ms |
| 198 | `dot/basic` | 0.90ms |
| 199 | `legend/basic` | 0.90ms |
| 200 | `scroll-reveal/frame-budget` | 0.90ms |
| 201 | `tilt/basic` | 0.90ms |
| 202 | `chrome/basic` | 0.80ms |
| 203 | `log-viewer/basic` | 0.80ms |
| 204 | `relative-time/basic` | 0.80ms |
| 205 | `spacer/basic` | 0.80ms |
| 206 | `thread-list/basic` | 0.80ms |
| 207 | `bounce-cards/frame-budget` | 0.80ms |
| 208 | `elastic-slider/frame-budget` | 0.80ms |
| 209 | `link/basic` | 0.80ms |
| 210 | `tablet/basic` | 0.80ms |
| 211 | `image/basic` | 0.80ms |
| 212 | `safari/basic` | 0.80ms |
| 213 | `typing-animation/frame-budget` | 0.80ms |
| 214 | `safe-area/basic` | 0.80ms |
| 215 | `callout/basic` | 0.70ms |
| 216 | `container/basic` | 0.70ms |
| 217 | `infinite-scroll/basic` | 0.70ms |
| 218 | `swipe-action/basic` | 0.70ms |
| 219 | `beian-footer/basic` | 0.70ms |
| 220 | `empty/basic` | 0.70ms |
| 221 | `grid-motion/frame-budget` | 0.70ms |
| 222 | `prompt-suggestions/basic` | 0.70ms |
| 223 | `split-text/frame-budget` | 0.70ms |
| 224 | `stack/basic` | 0.70ms |
| 225 | `aspect-ratio/basic` | 0.70ms |
| 226 | `iphone/basic` | 0.70ms |
| 227 | `spotlight/basic` | 0.70ms |
| 228 | `text/basic` | 0.70ms |
| 229 | `striped-pattern/basic` | 0.60ms |
| 230 | `animated-list/frame-budget` | 0.60ms |
| 231 | `blob-cursor/frame-budget` | 0.60ms |
| 232 | `blur-text/frame-budget` | 0.60ms |
| 233 | `image-viewer/basic` | 0.60ms |
| 234 | `sparkles-text/frame-budget` | 0.60ms |
| 235 | `spinner/basic` | 0.60ms |
| 236 | `watch/basic` | 0.60ms |
| 237 | `watermark/basic` | 0.60ms |
| 238 | `android/basic` | 0.60ms |
| 239 | `citation/basic` | 0.60ms |
| 240 | `pixel-transition/frame-budget` | 0.60ms |
| 241 | `chroma-grid/frame-budget` | 0.50ms |
| 242 | `true-focus/frame-budget` | 0.50ms |
| 243 | `flowing-menu/frame-budget` | 0.50ms |
| 244 | `gift-feed/frame-budget` | 0.50ms |
| 245 | `magnet-lines/frame-budget` | 0.50ms |
| 246 | `orbit-images/frame-budget` | 0.50ms |
| 247 | `profile-card/frame-budget` | 0.50ms |
| 248 | `progress/basic` | 0.50ms |
| 249 | `tilted-card/frame-budget` | 0.50ms |
| 250 | `decay-card/frame-budget` | 0.50ms |
| 251 | `gooey-nav/frame-budget` | 0.50ms |
| 252 | `glass-surface/frame-budget` | 0.40ms |
| 253 | `scroll-velocity/frame-budget` | 0.40ms |
| 254 | `card-nav/frame-budget` | 0.40ms |
| 255 | `glass-icons/frame-budget` | 0.40ms |
| 256 | `kbd/basic` | 0.40ms |
| 257 | `orbiting-circles/frame-budget` | 0.40ms |
| 258 | `reveal/frame-budget` | 0.40ms |
| 259 | `thinking-block/frame-budget` | 0.40ms |
| 260 | `word-rotate/frame-budget` | 0.40ms |
| 261 | `gradual-blur/frame-budget` | 0.40ms |
| 262 | `grid-distortion/frame-budget` | 0.40ms |
| 263 | `model-viewer/frame-budget` | 0.40ms |
| 264 | `number-ticker/frame-budget` | 0.40ms |
| 265 | `reflective-card/frame-budget` | 0.40ms |
| 266 | `sticker-peel/frame-budget` | 0.40ms |
| 267 | `terminal/frame-budget` | 0.40ms |
| 268 | `text-pressure/frame-budget` | 0.40ms |
| 269 | `magic-card/frame-budget` | 0.40ms |
| 270 | `danmaku/frame-budget` | 0.30ms |
| 271 | `animated-shiny-text/frame-budget` | 0.30ms |
| 272 | `balatro/frame-budget` | 0.30ms |
| 273 | `border-beam/frame-budget` | 0.30ms |
| 274 | `border-glow/frame-budget` | 0.30ms |
| 275 | `card-swap/frame-budget` | 0.30ms |
| 276 | `click-spark/frame-budget` | 0.30ms |
| 277 | `electric-border/frame-budget` | 0.30ms |
| 278 | `falling-text/frame-budget` | 0.30ms |
| 279 | `flickering-grid/frame-budget` | 0.30ms |
| 280 | `image-trail/frame-budget` | 0.30ms |
| 281 | `laser-flow/frame-budget` | 0.30ms |
| 282 | `lightning/frame-budget` | 0.30ms |
| 283 | `magic-bento/frame-budget` | 0.30ms |
| 284 | `plasma/frame-budget` | 0.30ms |
| 285 | `ripple-button/frame-budget` | 0.30ms |
| 286 | `side-rays/frame-budget` | 0.30ms |
| 287 | `soft-aurora/frame-budget` | 0.30ms |
| 288 | `staggered-menu/frame-budget` | 0.30ms |
| 289 | `star-border/frame-budget` | 0.30ms |
| 290 | `beams/frame-budget` | 0.30ms |
| 291 | `circular-text/frame-budget` | 0.30ms |
| 292 | `color-bends/frame-budget` | 0.30ms |
| 293 | `dark-veil/frame-budget` | 0.30ms |
| 294 | `dither/frame-budget` | 0.30ms |
| 295 | `evil-eye/frame-budget` | 0.30ms |
| 296 | `galaxy/frame-budget` | 0.30ms |
| 297 | `lanyard/frame-budget` | 0.30ms |
| 298 | `ribbons/frame-budget` | 0.30ms |
| 299 | `ripple-grid/frame-budget` | 0.30ms |
| 300 | `scrambled-text/frame-budget` | 0.30ms |
| 301 | `scroll-stack/frame-budget` | 0.30ms |
| 302 | `shape-grid/frame-budget` | 0.30ms |
| 303 | `variable-proximity/frame-budget` | 0.30ms |
| 304 | `dot-field/frame-budget` | 0.20ms |
| 305 | `faulty-terminal/frame-budget` | 0.20ms |
| 306 | `floating-reactions/frame-budget` | 0.20ms |
| 307 | `grid-scan/frame-budget` | 0.20ms |
| 308 | `lens/frame-budget` | 0.20ms |
| 309 | `light-pillar/frame-budget` | 0.20ms |
| 310 | `lightfall/frame-budget` | 0.20ms |
| 311 | `line-waves/frame-budget` | 0.20ms |
| 312 | `meteors/frame-budget` | 0.20ms |
| 313 | `pill-nav/frame-budget` | 0.20ms |
| 314 | `pixel-card/frame-budget` | 0.20ms |
| 315 | `plasma-wave/frame-budget` | 0.20ms |
| 316 | `radar/frame-budget` | 0.20ms |
| 317 | `ripple/frame-budget` | 0.20ms |
| 318 | `splash-cursor/frame-budget` | 0.20ms |
| 319 | `target-cursor/frame-budget` | 0.20ms |
| 320 | `text-cursor/frame-budget` | 0.20ms |
| 321 | `wavy-background/frame-budget` | 0.20ms |
| 322 | `animated-theme-toggler/frame-budget` | 0.20ms |
| 323 | `antigravity/frame-budget` | 0.20ms |
| 324 | `ascii-text/frame-budget` | 0.20ms |
| 325 | `aurora-text/frame-budget` | 0.20ms |
| 326 | `ballpit/frame-budget` | 0.20ms |
| 327 | `book-3d/frame-budget` | 0.20ms |
| 328 | `bubble-menu/frame-budget` | 0.20ms |
| 329 | `card-spotlight/frame-budget` | 0.20ms |
| 330 | `circular-gallery/frame-budget` | 0.20ms |
| 331 | `crosshair/frame-budget` | 0.20ms |
| 332 | `ferrofluid/frame-budget` | 0.20ms |
| 333 | `floating-lines/frame-budget` | 0.20ms |
| 334 | `flying-posters/frame-budget` | 0.20ms |
| 335 | `folder/frame-budget` | 0.20ms |
| 336 | `fuzzy-text/frame-budget` | 0.20ms |
| 337 | `ghost-cursor/frame-budget` | 0.20ms |
| 338 | `hyperspeed/frame-budget` | 0.20ms |
| 339 | `letter-glitch/frame-budget` | 0.20ms |
| 340 | `light-rays/frame-budget` | 0.20ms |
| 341 | `liquid-chrome/frame-budget` | 0.20ms |
| 342 | `liquid-ether/frame-budget` | 0.20ms |
| 343 | `magic-rings/frame-budget` | 0.20ms |
| 344 | `magnet/frame-budget` | 0.20ms |
| 345 | `marquee/frame-budget` | 0.20ms |
| 346 | `meta-balls/frame-budget` | 0.20ms |
| 347 | `pixel-snow/frame-budget` | 0.20ms |
| 348 | `pixel-trail/frame-budget` | 0.20ms |
| 349 | `prism/frame-budget` | 0.20ms |
| 350 | `prismatic-burst/frame-budget` | 0.20ms |
| 351 | `rainbow-button/frame-budget` | 0.20ms |
| 352 | `retro-grid/frame-budget` | 0.20ms |
| 353 | `shape-blur/frame-budget` | 0.20ms |
| 354 | `shimmer-button/frame-budget` | 0.20ms |
| 355 | `shine-border/frame-budget` | 0.20ms |
| 356 | `silk/frame-budget` | 0.20ms |
| 357 | `streaming-text/frame-budget` | 0.20ms |
| 358 | `typing-dots/frame-budget` | 0.20ms |
| 359 | `animated-gradient-text/frame-budget` | 0.20ms |
| 360 | `pixel-blast/frame-budget` | 0.20ms |
| 361 | `pulsating-button/frame-budget` | 0.20ms |
| 362 | `aurora/frame-budget` | 0.10ms |
| 363 | `fluid-glass/frame-budget` | 0.10ms |
| 364 | `glitch-text/frame-budget` | 0.10ms |
| 365 | `gradient-blinds/frame-budget` | 0.10ms |
| 366 | `grainient/frame-budget` | 0.10ms |
| 367 | `iridescence/frame-budget` | 0.10ms |
| 368 | `metallic-paint/frame-budget` | 0.10ms |
| 369 | `orb/frame-budget` | 0.10ms |
| 370 | `particles/frame-budget` | 0.10ms |
| 371 | `threads/frame-budget` | 0.10ms |
| 372 | `glare-hover/frame-budget` | 0.10ms |

## 全部 findings（不截断）

| 场景 | 组件 | 规则 | 严重度 | 当前值 | 证据 |
| --- | --- | --- | --- | ---: | --- |
| `qrcode/basic` | QRCode | `avoidable-render` | error | 55.0000 | GenericFixture -> QRCode in stable-parent-update; GenericFixture -> QRCode in stress:stable-parent-update |
| `scheduler/basic` | Scheduler | `avoidable-render` | error | 55.0000 | GenericFixture -> Scheduler in stable-parent-update; GenericFixture -> Scheduler in stress:stable-parent-update |
| `live-player/basic` | LivePlayer | `avoidable-render` | error | 39.0000 | GenericFixture -> LivePlayer in stable-parent-update; GenericFixture -> LivePlayer in stress:stable-parent-update |
| `file-tree/basic` | FileTree | `avoidable-render` | error | 36.0000 | GenericFixture -> FileTree in stress:stable-parent-update; GenericFixture -> FileTree in stable-parent-update |
| `agent-plan/basic` | AgentPlan | `avoidable-render` | error | 33.0000 | GenericFixture -> AgentPlan in stable-parent-update; GenericFixture -> AgentPlan in stress:stable-parent-update |
| `dossier/basic` | Dossier | `avoidable-render` | error | 33.0000 | GenericFixture -> Dossier in stable-parent-update; GenericFixture -> Dossier in stress:stable-parent-update |
| `snippet/basic` | Snippet | `avoidable-render` | error | 30.0000 | GenericFixture -> Snippet in stress:stable-parent-update; GenericFixture -> Snippet in stable-parent-update |
| `color-field/basic` | ColorField | `avoidable-render` | error | 22.0000 | Controlled -> ColorField in stable-parent-update; Controlled -> ColorField in stress:stable-parent-update |
| `live-product-card/basic` | LiveProductCard | `avoidable-render` | error | 19.0000 | GenericFixture -> LiveProductCard in stress:stable-parent-update; GenericFixture -> LiveProductCard in stable-parent-update |
| `button/basic` | Button | `avoidable-render` | error | 7.0000 | GenericFixture -> Button in stable-parent-update |
| `calendar/basic` | Calendar | `avoidable-render` | error | 5.0000 | GenericFixture -> Calendar in stable-parent-update |
| `code-review-thread/basic` | CodeReviewThread | `avoidable-render` | error | 5.0000 | GenericFixture -> CodeReviewThread in stable-parent-update |
| `color-swatch-picker/basic` | ColorSwatchPicker | `avoidable-render` | error | 5.0000 | GenericFixture -> ColorSwatchPicker in stable-parent-update |
| `country-select/basic` | CountrySelect | `avoidable-render` | error | 5.0000 | GenericFixture -> CountrySelect in stable-parent-update |
| `date-picker/basic` | DatePicker | `avoidable-render` | error | 5.0000 | GenericFixture -> DatePicker in stable-parent-update |
| `glimpse/basic` | Glimpse | `avoidable-render` | error | 5.0000 | GenericFixture -> Glimpse in stable-parent-update |
| `heatmap/basic` | Heatmap | `avoidable-render` | error | 5.0000 | GenericFixture -> Heatmap in stable-parent-update |
| `pricing-table/basic` | PricingTable | `avoidable-render` | error | 5.0000 | GenericFixture -> PricingTable in stable-parent-update |
| `rating/basic` | Rating | `avoidable-render` | error | 5.0000 | GenericFixture -> Rating in stable-parent-update |
| `search-form/basic` | SearchForm | `avoidable-render` | error | 5.0000 | GenericFixture -> SearchForm in stable-parent-update |
| `slider/basic` | Slider | `avoidable-render` | error | 5.0000 | GenericFixture -> Slider in stable-parent-update |
| `time-picker/basic` | TimePicker | `avoidable-render` | error | 5.0000 | GenericFixture -> TimePicker in stable-parent-update |
| `alert/basic` | Alert | `avoidable-render` | error | 4.0000 | GenericFixture -> Alert in stable-parent-update |
| `avatar/basic` | Avatar | `avoidable-render` | error | 4.0000 | GenericFixture -> Avatar in stable-parent-update |
| `cascader/basic` | Cascader | `avoidable-render` | error | 4.0000 | GenericFixture -> Cascader in stable-parent-update |
| `chat-message/basic` | ChatMessage | `avoidable-render` | error | 4.0000 | GenericFixture -> ChatMessage in stable-parent-update |
| `checkbox/basic` | Checkbox | `avoidable-render` | error | 4.0000 | GenericFixture -> Checkbox in stable-parent-update |
| `code-diff/basic` | CodeDiff | `avoidable-render` | error | 4.0000 | GenericFixture -> CodeDiff in stable-parent-update |
| `contribution-graph/basic` | ContributionGraph | `avoidable-render` | error | 4.0000 | GenericFixture -> ContributionGraph in stable-parent-update |
| `credit-card/basic` | CreditCard | `avoidable-render` | error | 4.0000 | GenericFixture -> CreditCard in stable-parent-update |
| `date-time-picker/basic` | DateTimePicker | `avoidable-render` | error | 4.0000 | GenericFixture -> DateTimePicker in stable-parent-update |
| `icon-picker/basic` | IconPicker | `avoidable-render` | error | 4.0000 | GenericFixture -> IconPicker in stable-parent-update |
| `intercept-card/basic` | InterceptCard | `avoidable-render` | error | 4.0000 | GenericFixture -> InterceptCard in stable-parent-update |
| `json-viewer/basic` | JsonViewer | `avoidable-render` | error | 4.0000 | GenericFixture -> JsonViewer in stable-parent-update |
| `number-field/basic` | NumberField | `avoidable-render` | error | 4.0000 | GenericFixture -> NumberField in stable-parent-update |
| `statistic/basic` | Statistic | `avoidable-render` | error | 4.0000 | GenericFixture -> Statistic in stable-parent-update |
| `steps/basic` | Steps | `avoidable-render` | error | 4.0000 | GenericFixture -> Steps in stable-parent-update |
| `switch/basic` | Switch | `avoidable-render` | error | 4.0000 | GenericFixture -> Switch in stable-parent-update |
| `tree-select/basic` | TreeSelect | `avoidable-render` | error | 4.0000 | GenericFixture -> TreeSelect in stable-parent-update |
| `award-badge/basic` | AwardBadge | `avoidable-render` | error | 3.0000 | GenericFixture -> AwardBadge in stable-parent-update |
| `deploy-status/basic` | DeployStatus | `avoidable-render` | error | 3.0000 | GenericFixture -> DeployStatus in stable-parent-update |
| `gantt/basic` | Gantt | `avoidable-render` | error | 3.0000 | GenericFixture -> Gantt in stable-parent-update |
| `git-commit/basic` | GitCommit | `avoidable-render` | error | 3.0000 | GenericFixture -> GitCommit in stable-parent-update |
| `kbd/basic` | Kbd | `avoidable-render` | error | 3.0000 | GenericFixture -> Kbd in stable-parent-update; GenericFixture -> Kbd in stress:stable-parent-update |
| `markdown/basic` | Markdown | `avoidable-render` | error | 3.0000 | GenericFixture -> Markdown in stable-parent-update |
| `scope-matrix/basic` | ScopeMatrix | `avoidable-render` | error | 3.0000 | EditableDemo -> ScopeMatrix in stable-parent-update |
| `secret-field/basic` | SecretField | `avoidable-render` | error | 3.0000 | GenericFixture -> SecretField in stable-parent-update |
| `stepper/basic` | Stepper | `avoidable-render` | error | 3.0000 | GenericFixture -> Stepper in stable-parent-update |
| `diff-stat/basic` | DiffStat | `avoidable-render` | error | 2.0000 | GenericFixture -> DiffStat in stable-parent-update |
| `event-stream/basic` | EventStream | `avoidable-render` | error | 2.0000 | GenericFixture -> EventStream in stable-parent-update |
| `meter/basic` | Meter | `avoidable-render` | error | 2.0000 | GenericFixture -> Meter in stable-parent-update |
| `separator/basic` | Separator | `avoidable-render` | error | 2.0000 | Horizontal -> Separator in stable-parent-update |
| `spinner/basic` | Spinner | `avoidable-render` | error | 2.0000 | GenericFixture -> Spinner in stable-parent-update |
| `status-dot/basic` | StatusDot | `avoidable-render` | error | 2.0000 | GenericFixture -> StatusDot in stable-parent-update |
| `tag/basic` | Tag | `avoidable-render` | error | 2.0000 | GenericFixture -> Tag in stable-parent-update |
| `select/stress` | Select | `cascade-fanout` | error | 567.0000 | cascadeFanout p95 567 exceeds 250 |
| `country-select/basic` | CountrySelect | `cascade-fanout` | error | 287.0000 | cascadeFanout p95 287 exceeds 30 |
| `tree-select/basic` | TreeSelect | `cascade-fanout` | error | 110.0000 | cascadeFanout p95 110 exceeds 30 |
| `video/basic` | Video | `cascade-fanout` | error | 86.0000 | cascadeFanout p95 86 exceeds 30 |
| `form/validation` | Form | `cascade-fanout` | error | 77.0000 | cascadeFanout p95 77 exceeds 50 |
| `admin-layout/basic` | AdminLayout | `cascade-fanout` | error | 64.0000 | cascadeFanout p95 64 exceeds 30 |
| `search-form/basic` | SearchForm | `cascade-fanout` | error | 61.0000 | cascadeFanout p95 61 exceeds 30 |
| `navigation-menu/basic` | NavigationMenu | `cascade-fanout` | error | 57.0000 | cascadeFanout p95 57 exceeds 30 |
| `date-time-picker/basic` | DateTimePicker | `cascade-fanout` | error | 56.0000 | cascadeFanout p95 56 exceeds 30 |
| `route-tabs/basic` | RouteTabs | `cascade-fanout` | error | 56.0000 | cascadeFanout p95 56 exceeds 30 |
| `combobox/basic` | Combobox | `cascade-fanout` | error | 52.0000 | cascadeFanout p95 52 exceeds 30 |
| `menubar/basic` | Menubar | `cascade-fanout` | error | 51.0000 | cascadeFanout p95 51 exceeds 30 |
| `command/basic` | Command | `cascade-fanout` | error | 49.0000 | cascadeFanout p95 49 exceeds 30 |
| `list/basic` | List | `cascade-fanout` | error | 48.0000 | cascadeFanout p95 48 exceeds 30 |
| `date-range-picker/basic` | DateRangePicker | `cascade-fanout` | error | 47.0000 | cascadeFanout p95 47 exceeds 30 |
| `region-cascader/basic` | RegionCascader | `cascade-fanout` | error | 47.0000 | cascadeFanout p95 47 exceeds 30 |
| `password-generator/basic` | PasswordGenerator | `cascade-fanout` | error | 46.0000 | cascadeFanout p95 46 exceeds 30 |
| `dock/basic` | Dock | `cascade-fanout` | error | 45.0000 | cascadeFanout p95 45 exceeds 30 |
| `popover/basic` | Popover | `cascade-fanout` | error | 45.0000 | cascadeFanout p95 45 exceeds 30 |
| `form-dialog/basic` | ModalForm | `cascade-fanout` | error | 44.0000 | cascadeFanout p95 44 exceeds 30 |
| `layout/basic` | Layout | `cascade-fanout` | error | 43.0000 | cascadeFanout p95 43 exceeds 30 |
| `time-picker/basic` | TimePicker | `cascade-fanout` | error | 43.0000 | cascadeFanout p95 43 exceeds 30 |
| `page-header/basic` | PageHeader | `cascade-fanout` | error | 42.0000 | cascadeFanout p95 42 exceeds 30 |
| `popconfirm/basic` | Popconfirm | `cascade-fanout` | error | 42.0000 | cascadeFanout p95 42 exceeds 30 |
| `accordion/basic` | Accordion | `cascade-fanout` | error | 41.0000 | cascadeFanout p95 41 exceeds 30 |
| `cascader/basic` | Cascader | `cascade-fanout` | error | 40.0000 | cascadeFanout p95 40 exceeds 30 |
| `drawer/basic` | Drawer | `cascade-fanout` | error | 40.0000 | cascadeFanout p95 40 exceeds 30 |
| `sortable/basic` | Sortable | `cascade-fanout` | error | 40.0000 | cascadeFanout p95 40 exceeds 30 |
| `menu/basic` | Menu | `cascade-fanout` | error | 39.0000 | cascadeFanout p95 39 exceeds 30 |
| `pro-form/basic` | ProForm | `cascade-fanout` | error | 37.0000 | cascadeFanout p95 37 exceeds 30 |
| `code-review-thread/basic` | CodeReviewThread | `cascade-fanout` | error | 36.0000 | cascadeFanout p95 36 exceeds 30 |
| `date-picker/basic` | DatePicker | `cascade-fanout` | error | 36.0000 | cascadeFanout p95 36 exceeds 30 |
| `glimpse/basic` | Glimpse | `cascade-fanout` | error | 36.0000 | cascadeFanout p95 36 exceeds 30 |
| `hover-card/basic` | HoverCard | `cascade-fanout` | error | 36.0000 | cascadeFanout p95 36 exceeds 30 |
| `editable-table/basic` | EditableTable | `cascade-fanout` | error | 35.0000 | cascadeFanout p95 35 exceeds 30 |
| `queue-lane/basic` | QueueLane | `cascade-fanout` | error | 35.0000 | cascadeFanout p95 35 exceeds 30 |
| `login-form/basic` | LoginForm | `cascade-fanout` | error | 33.0000 | cascadeFanout p95 33 exceeds 30 |
| `button-group/basic` | ButtonGroup | `cascade-fanout` | error | 32.0000 | cascadeFanout p95 32 exceeds 30 |
| `color-swatch-picker/basic` | ColorSwatchPicker | `cascade-fanout` | error | 32.0000 | cascadeFanout p95 32 exceeds 30 |
| `steps-form/basic` | StepsForm | `cascade-fanout` | error | 32.0000 | cascadeFanout p95 32 exceeds 30 |
| `contribution-graph/basic` | ContributionGraph | `cascade-fanout` | error | 31.0000 | cascadeFanout p95 31 exceeds 30 |
| `circular-gallery/frame-budget` | CircularGallery | `dropped-frames` | error | 0.6649 | droppedFrameRatio p95 0.6649214659685864 exceeds 0.1 |
| `galaxy/frame-budget` | Galaxy | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `light-pillar/frame-budget` | LightPillar | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `liquid-chrome/frame-budget` | LiquidChrome | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `pixel-snow/frame-budget` | PixelSnow | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `prism/frame-budget` | Prism | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `prismatic-burst/frame-budget` | PrismaticBurst | `dropped-frames` | error | 0.6615 | droppedFrameRatio p95 0.6614583333333334 exceeds 0.1 |
| `threads/frame-budget` | Threads | `dropped-frames` | error | 0.6218 | droppedFrameRatio p95 0.6217616580310881 exceeds 0.1 |
| `laser-flow/frame-budget` | LaserFlow | `dropped-frames` | error | 0.5417 | droppedFrameRatio p95 0.5416666666666666 exceeds 0.1 |
| `faulty-terminal/frame-budget` | FaultyTerminal | `dropped-frames` | error | 0.4479 | droppedFrameRatio p95 0.4479166666666667 exceeds 0.1 |
| `plasma/frame-budget` | Plasma | `dropped-frames` | error | 0.1979 | droppedFrameRatio p95 0.19791666666666666 exceeds 0.1 |
| `floating-lines/frame-budget` | FloatingLines | `dropped-frames` | error | 0.1927 | droppedFrameRatio p95 0.19270833333333334 exceeds 0.1 |
| `color-bends/frame-budget` | ColorBends | `dropped-frames` | error | 0.1823 | droppedFrameRatio p95 0.18229166666666666 exceeds 0.1 |
| `faulty-terminal/frame-budget` | FaultyTerminal | `long-task` | error | 1949.0000 | longTaskMs p95 1949 exceeds 100 |
| `gradient-blinds/frame-budget` | GradientBlinds | `long-task` | error | 443.0000 | longTaskMs p95 443 exceeds 100 |
| `dark-veil/frame-budget` | DarkVeil | `long-task` | error | 348.0000 | longTaskMs p95 348 exceeds 100 |
| `circular-gallery/frame-budget` | CircularGallery | `long-task` | error | 301.0000 | longTaskMs p95 301 exceeds 100 |
| `color-bends/frame-budget` | ColorBends | `long-task` | error | 293.0000 | longTaskMs p95 293 exceeds 100 |
| `floating-lines/frame-budget` | FloatingLines | `long-task` | error | 216.0000 | longTaskMs p95 216 exceeds 100 |
| `ferrofluid/frame-budget` | Ferrofluid | `long-task` | error | 192.0000 | longTaskMs p95 192 exceeds 100 |
| `grid-scan/frame-budget` | GridScan | `long-task` | error | 176.0000 | longTaskMs p95 176 exceeds 100 |
| `lightfall/frame-budget` | Lightfall | `long-task` | error | 156.0000 | longTaskMs p95 156 exceeds 100 |
| `liquid-ether/frame-budget` | LiquidEther | `long-task` | error | 147.0000 | longTaskMs p95 147 exceeds 100 |
| `grainient/frame-budget` | Grainient | `long-task` | error | 134.0000 | longTaskMs p95 134 exceeds 100 |
| `laser-flow/frame-budget` | LaserFlow | `long-task` | error | 130.0000 | longTaskMs p95 130 exceeds 100 |
| `soft-aurora/frame-budget` | SoftAurora | `long-task` | error | 119.0000 | longTaskMs p95 119 exceeds 100 |
| `ribbons/frame-budget` | Ribbons | `long-task` | error | 118.0000 | longTaskMs p95 118 exceeds 100 |
| `galaxy/frame-budget` | Galaxy | `long-task` | error | 113.0000 | longTaskMs p95 113 exceeds 100 |
| `flying-posters/frame-budget` | FlyingPosters | `long-task` | error | 103.0000 | longTaskMs p95 103 exceeds 100 |

## 基础设施失败

无。372 个 packed 测量场景与 190 个诊断场景均无运行错误。

## 全部场景附录（不截断）

数值格式为 `commit median / cascade p95 / long-task p95 / dropped-frame p95`。

| 场景 | 组件 | 类别 | Workspace | Packed | Packed finding rules |
| --- | --- | --- | ---: | ---: | --- |
| `accordion/basic` | Accordion | standard | 4.10ms / 36 / 0.00ms / 0.0000 | 3.90ms / 41 / 0.00ms / 0.0000 | `cascade-fanout` |
| `action-sheet/basic` | ActionSheet | standard | 4.10ms / 24 / 0.00ms / 0.0000 | 4.00ms / 26 / 0.00ms / 0.0000 | — |
| `admin-layout/basic` | AdminLayout | standard | 6.50ms / 65 / 0.00ms / 0.0000 | 6.00ms / 64 / 0.00ms / 0.0000 | `cascade-fanout` |
| `affix/basic` | Affix | standard | 1.10ms / 11 / 0.00ms / 0.0000 | 1.40ms / 11 / 0.00ms / 0.0000 | — |
| `agent-plan/basic` | AgentPlan | standard | 1.40ms / 18 / 0.00ms / 0.0000 | 1.40ms / 16 / 0.00ms / 0.0000 | `avoidable-render` |
| `alert-dialog/basic` | AlertDialog | standard | 4.30ms / 25 / 0.00ms / 0.0000 | 3.40ms / 24 / 0.00ms / 0.0000 | — |
| `alert/basic` | Alert | standard | 1.20ms / 13 / 0.00ms / 0.0000 | 1.20ms / 14 / 0.00ms / 0.0000 | `avoidable-render` |
| `anchor/basic` | Anchor | standard | 1.80ms / 17 / 0.00ms / 0.0000 | 1.70ms / 16 / 0.00ms / 0.0000 | — |
| `android/basic` | Android | standard | 1.10ms / 10 / 0.00ms / 0.0000 | 0.60ms / 10 / 0.00ms / 0.0000 | — |
| `animated-beam/frame-budget` | AnimatedBeam | animation | 1.30ms / 46 / 0.00ms / 0.0000 | 1.00ms / 38 / 0.00ms / 0.0000 | — |
| `animated-gradient-text/frame-budget` | AnimatedGradientText | animation | 0.20ms / 6 / 0.00ms / 0.0000 | 0.20ms / 6 / 0.00ms / 0.0000 | — |
| `animated-list/frame-budget` | AnimatedList | animation | 0.50ms / 25 / 0.00ms / 0.0000 | 0.60ms / 17 / 0.00ms / 0.0000 | — |
| `animated-shiny-text/frame-budget` | AnimatedShinyText | animation | 0.10ms / 7 / 0.00ms / 0.0000 | 0.30ms / 7 / 0.00ms / 0.0000 | — |
| `animated-theme-toggler/frame-budget` | AnimatedThemeToggler | animation | 0.40ms / 9 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `annotation/basic` | Annotation | standard | 1.30ms / 11 / 0.00ms / 0.0000 | 1.10ms / 10 / 0.00ms / 0.0000 | — |
| `antigravity/frame-budget` | Antigravity | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `app-launcher/basic` | AppLauncher | standard | 2.60ms / 26 / 0.00ms / 0.0000 | 2.00ms / 24 / 0.00ms / 0.0000 | — |
| `artifact/basic` | Artifact | standard | 2.00ms / 18 / 0.00ms / 0.0000 | 2.10ms / 20 / 0.00ms / 0.0000 | — |
| `ascii-text/frame-budget` | ASCIIText | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `aspect-ratio/basic` | AspectRatio | standard | 0.90ms / 9 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `aurora-text/frame-budget` | AuroraText | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `aurora/frame-budget` | Aurora | animation | 0.20ms / 10 / 0.00ms / 0.0000 | 0.10ms / 10 / 0.00ms / 0.0000 | — |
| `avatar-circles/basic` | AvatarCircles | standard | 0.70ms / 9 / 0.00ms / 0.0000 | 1.00ms / 9 / 0.00ms / 0.0000 | — |
| `avatar/basic` | Avatar | standard | 1.70ms / 10 / 0.00ms / 0.0000 | 1.50ms / 11 / 0.00ms / 0.0000 | `avoidable-render` |
| `award-badge/basic` | AwardBadge | standard | 1.30ms / 15 / 0.00ms / 0.0000 | 1.50ms / 14 / 0.00ms / 0.0000 | `avoidable-render` |
| `back-top/basic` | BackTop | standard | 1.60ms / 15 / 0.00ms / 0.0000 | 1.50ms / 15 / 0.00ms / 0.0000 | — |
| `badge/basic` | Badge | standard | 1.00ms / 9 / 0.00ms / 0.0000 | 0.90ms / 10 / 0.00ms / 0.0000 | — |
| `balatro/frame-budget` | Balatro | animation | 0.20ms / 8 / 172.00ms / 0.0733 | 0.30ms / 8 / 86.00ms / 0.0366 | — |
| `ballpit/frame-budget` | Ballpit | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `banner/basic` | Banner | standard | 1.60ms / 12 / 0.00ms / 0.0000 | 1.70ms / 12 / 0.00ms / 0.0000 | — |
| `beams/frame-budget` | Beams | animation | 0.20ms / 7 / 483.00ms / 0.0628 | 0.30ms / 8 / 78.00ms / 0.0053 | — |
| `beian-footer/basic` | BeianFooter | standard | 0.70ms / 9 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `bento-grid/basic` | BentoGrid | standard | 1.40ms / 19 / 0.00ms / 0.0000 | 1.60ms / 19 / 0.00ms / 0.0000 | — |
| `blob-cursor/frame-budget` | BlobCursor | animation | 0.70ms / 23 / 0.00ms / 0.0000 | 0.60ms / 20 / 0.00ms / 0.0000 | — |
| `blur-text/frame-budget` | BlurText | animation | 0.60ms / 13 / 0.00ms / 0.0000 | 0.60ms / 15 / 0.00ms / 0.0000 | — |
| `book-3d/frame-budget` | Book3D | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 11 / 0.00ms / 0.0000 | — |
| `border-beam/frame-budget` | BorderBeam | animation | 0.40ms / 14 / 0.00ms / 0.0000 | 0.30ms / 15 / 0.00ms / 0.0000 | — |
| `border-glow/frame-budget` | BorderGlow | animation | 0.30ms / 13 / 0.00ms / 0.0000 | 0.30ms / 13 / 0.00ms / 0.0000 | — |
| `bounce-cards/frame-budget` | BounceCards | animation | 0.70ms / 23 / 0.00ms / 0.0000 | 0.80ms / 25 / 0.00ms / 0.0000 | — |
| `brand/basic` | Brand | standard | 0.80ms / 9 / 0.00ms / 0.0000 | 0.90ms / 11 / 0.00ms / 0.0000 | — |
| `breadcrumb/basic` | Breadcrumb | standard | 1.20ms / 14 / 0.00ms / 0.0000 | 1.00ms / 12 / 0.00ms / 0.0000 | — |
| `bubble-menu/frame-budget` | BubbleMenu | animation | 0.20ms / 13 / 0.00ms / 0.0000 | 0.20ms / 14 / 0.00ms / 0.0000 | — |
| `button-group/basic` | ButtonGroup | standard | 2.40ms / 27 / 0.00ms / 0.0000 | 2.20ms / 32 / 0.00ms / 0.0000 | `cascade-fanout` |
| `button/basic` | Button | core | 2.10ms / 18 / 0.00ms / 0.0000 | 1.70ms / 18 / 0.00ms / 0.0000 | `avoidable-render` |
| `calendar/basic` | Calendar | standard | 3.80ms / 18 / 0.00ms / 0.0000 | 3.10ms / 16 / 0.00ms / 0.0000 | `avoidable-render` |
| `callout/basic` | Callout | standard | 1.00ms / 8 / 0.00ms / 0.0000 | 0.70ms / 8 / 0.00ms / 0.0000 | — |
| `card-nav/frame-budget` | CardNav | animation | 0.50ms / 17 / 0.00ms / 0.0000 | 0.40ms / 17 / 0.00ms / 0.0000 | — |
| `card-spotlight/frame-budget` | CardSpotlight | animation | 0.70ms / 10 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `card-swap/frame-budget` | CardSwap | animation | 0.60ms / 16 / 0.00ms / 0.0000 | 0.30ms / 14 / 0.00ms / 0.0000 | — |
| `card/basic` | Card | standard | 0.80ms / 9 / 0.00ms / 0.0000 | 0.90ms / 9 / 0.00ms / 0.0000 | — |
| `carousel/basic` | Carousel | standard | 2.10ms / 19 / 0.00ms / 0.0000 | 1.70ms / 17 / 0.00ms / 0.0000 | — |
| `cascader/basic` | Cascader | standard | 6.30ms / 39 / 0.00ms / 0.0000 | 5.00ms / 40 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `chart/stress` | AreaChart | heavy | 25.40ms / 143 / 0.00ms / 0.0000 | 23.90ms / 146 / 0.00ms / 0.0000 | — |
| `chat-message/basic` | ChatMessage | standard | 1.20ms / 14 / 0.00ms / 0.0000 | 1.50ms / 18 / 0.00ms / 0.0000 | `avoidable-render` |
| `checkbox-group/basic` | CheckboxGroup | standard | 4.10ms / 27 / 0.00ms / 0.0000 | 3.10ms / 24 / 0.00ms / 0.0000 | — |
| `checkbox/basic` | Checkbox | standard | 4.10ms / 16 / 0.00ms / 0.0000 | 3.80ms / 17 / 0.00ms / 0.0000 | `avoidable-render` |
| `chip/basic` | Chip | standard | 1.70ms / 10 / 0.00ms / 0.0000 | 1.40ms / 10 / 0.00ms / 0.0000 | — |
| `choicebox/basic` | ChoiceboxGroup | standard | 1.80ms / 20 / 0.00ms / 0.0000 | 1.60ms / 19 / 0.00ms / 0.0000 | — |
| `chroma-grid/frame-budget` | ChromaGrid | animation | 0.40ms / 16 / 0.00ms / 0.0000 | 0.50ms / 17 / 0.00ms / 0.0000 | — |
| `chrome/basic` | Chrome | standard | 1.10ms / 13 / 0.00ms / 0.0000 | 0.80ms / 9 / 0.00ms / 0.0000 | — |
| `circular-gallery/frame-budget` | CircularGallery | animation | 0.20ms / 8 / 295.00ms / 0.6615 | 0.20ms / 7 / 301.00ms / 0.6649 | `long-task`, `dropped-frames` |
| `circular-text/frame-budget` | CircularText | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.30ms / 8 / 0.00ms / 0.0000 | — |
| `citation/basic` | Citation | standard | 0.70ms / 8 / 0.00ms / 0.0000 | 0.60ms / 7 / 0.00ms / 0.0000 | — |
| `click-captcha/basic` | ClickCaptcha | standard | 2.70ms / 24 / 0.00ms / 0.0000 | 3.10ms / 25 / 0.00ms / 0.0000 | — |
| `click-spark/frame-budget` | ClickSpark | animation | 0.20ms / 11 / 0.00ms / 0.0000 | 0.30ms / 8 / 0.00ms / 0.0000 | — |
| `code-block/basic` | CodeBlock | standard | 1.70ms / 12 / 0.00ms / 0.0000 | 1.80ms / 12 / 0.00ms / 0.0000 | — |
| `code-diff/basic` | CodeDiff | standard | 2.00ms / 18 / 0.00ms / 0.0000 | 2.40ms / 20 / 0.00ms / 0.0000 | `avoidable-render` |
| `code-review-thread/basic` | CodeReviewThread | standard | 3.30ms / 38 / 0.00ms / 0.0000 | 3.30ms / 36 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `code/basic` | Code | standard | 0.60ms / 7 / 0.00ms / 0.0000 | 0.90ms / 7 / 0.00ms / 0.0000 | — |
| `collapsible/basic` | Collapsible | standard | 2.40ms / 18 / 0.00ms / 0.0000 | 2.40ms / 17 / 0.00ms / 0.0000 | — |
| `color-bends/frame-budget` | ColorBends | animation | 0.20ms / 8 / 91.00ms / 0.0262 | 0.30ms / 8 / 293.00ms / 0.1823 | `long-task`, `dropped-frames` |
| `color-field/basic` | ColorField | standard | 1.20ms / 11 / 0.00ms / 0.0000 | 1.20ms / 11 / 0.00ms / 0.0000 | `avoidable-render` |
| `color-swatch-picker/basic` | ColorSwatchPicker | standard | 5.30ms / 35 / 0.00ms / 0.0000 | 4.70ms / 32 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `colorpicker/basic` | ColorPicker | standard | 1.80ms / 21 / 0.00ms / 0.0000 | 2.10ms / 23 / 0.00ms / 0.0000 | — |
| `combobox/basic` | Combobox | standard | 8.60ms / 52 / 0.00ms / 0.0000 | 8.90ms / 52 / 0.00ms / 0.0000 | `cascade-fanout` |
| `command/basic` | Command | standard | 5.30ms / 57 / 0.00ms / 0.0000 | 5.20ms / 49 / 0.00ms / 0.0000 | `cascade-fanout` |
| `comment/basic` | Comment | standard | 2.30ms / 24 / 0.00ms / 0.0000 | 2.10ms / 24 / 0.00ms / 0.0000 | — |
| `confirm-card/basic` | ConfirmCard | standard | 2.10ms / 18 / 0.00ms / 0.0000 | 2.10ms / 19 / 0.00ms / 0.0000 | — |
| `container/basic` | Container | standard | 0.90ms / 9 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `context-menu/basic` | ContextMenu | standard | 2.50ms / 15 / 0.00ms / 0.0000 | 2.30ms / 15 / 0.00ms / 0.0000 | — |
| `contribution-graph/basic` | ContributionGraph | standard | 16.20ms / 27 / 0.00ms / 0.0000 | 16.40ms / 31 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `conversation/basic` | Conversation | standard | 1.90ms / 23 / 0.00ms / 0.0000 | 1.90ms / 26 / 0.00ms / 0.0000 | — |
| `country-select/basic` | CountrySelect | standard | 48.60ms / 234 / 0.00ms / 0.0000 | 46.20ms / 287 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `coupon/basic` | Coupon | standard | 1.00ms / 14 / 0.00ms / 0.0000 | 1.10ms / 16 / 0.00ms / 0.0000 | — |
| `credit-card/basic` | CreditCard | standard | 1.30ms / 13 / 0.00ms / 0.0000 | 1.30ms / 10 / 0.00ms / 0.0000 | `avoidable-render` |
| `crosshair/frame-budget` | Crosshair | animation | 0.40ms / 10 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `cubes/frame-budget` | Cubes | animation | 2.30ms / 58 / 0.00ms / 0.0000 | 2.20ms / 57 / 0.00ms / 0.0000 | — |
| `curved-loop/frame-budget` | CurvedLoop | animation | 7.20ms / 11 / 0.00ms / 0.0000 | 6.10ms / 11 / 0.00ms / 0.0000 | — |
| `danmaku/frame-budget` | Danmaku | animation | 0.50ms / 10 / 0.00ms / 0.0000 | 0.30ms / 11 / 0.00ms / 0.0000 | — |
| `dark-veil/frame-budget` | DarkVeil | animation | 0.20ms / 8 / 1174.00ms / 0.0157 | 0.30ms / 8 / 348.00ms / 0.0419 | `long-task` |
| `date-picker/basic` | DatePicker | standard | 7.20ms / 40 / 0.00ms / 0.0000 | 7.40ms / 36 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `date-range-picker/basic` | DateRangePicker | standard | 12.00ms / 47 / 0.00ms / 0.0000 | 11.00ms / 47 / 0.00ms / 0.0000 | `cascade-fanout` |
| `date-time-picker/basic` | DateTimePicker | standard | 12.10ms / 57 / 0.00ms / 0.0000 | 10.60ms / 56 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `decay-card/frame-budget` | DecayCard | animation | 0.40ms / 13 / 0.00ms / 0.0000 | 0.50ms / 13 / 0.00ms / 0.0000 | — |
| `decrypted-text/frame-budget` | DecryptedText | animation | 1.10ms / 7 / 0.00ms / 0.0000 | 1.20ms / 7 / 0.00ms / 0.0000 | — |
| `deploy-status/basic` | DeployStatus | standard | 1.60ms / 12 / 0.00ms / 0.0000 | 1.60ms / 14 / 0.00ms / 0.0000 | `avoidable-render` |
| `descriptions/basic` | Descriptions | standard | 1.00ms / 9 / 0.00ms / 0.0000 | 1.00ms / 10 / 0.00ms / 0.0000 | — |
| `dialog/cycles` | Dialog | core | 6.40ms / 23 / 0.00ms / 0.0000 | 6.70ms / 23 / 0.00ms / 0.0000 | — |
| `diff-stat/basic` | DiffStat | standard | 1.30ms / 9 / 0.00ms / 0.0000 | 1.00ms / 9 / 0.00ms / 0.0000 | `avoidable-render` |
| `dither/frame-budget` | Dither | animation | 0.30ms / 8 / 68.00ms / 0.0052 | 0.30ms / 8 / 87.00ms / 0.0681 | — |
| `divider/basic` | Divider | standard | 0.90ms / 8 / 0.00ms / 0.0000 | 1.00ms / 8 / 0.00ms / 0.0000 | — |
| `dock/basic` | Dock | standard | 3.20ms / 44 / 0.00ms / 0.0000 | 3.50ms / 45 / 0.00ms / 0.0000 | `cascade-fanout` |
| `document-sheet/basic` | DocumentSheet | standard | 2.60ms / 18 / 0.00ms / 0.0000 | 2.90ms / 20 / 0.00ms / 0.0000 | — |
| `dome-gallery/frame-budget` | DomeGallery | animation | 1.60ms / 31 / 0.00ms / 0.0000 | 1.70ms / 30 / 0.00ms / 0.0000 | — |
| `dossier/basic` | Dossier | standard | 1.60ms / 17 / 0.00ms / 0.0000 | 1.50ms / 20 / 0.00ms / 0.0000 | `avoidable-render` |
| `dot-field/frame-budget` | DotField | animation | 0.30ms / 9 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `dot-pattern/basic` | DotPattern | standard | 1.00ms / 11 / 0.00ms / 0.0000 | 1.10ms / 11 / 0.00ms / 0.0000 | — |
| `dot/basic` | Dot | standard | 1.10ms / 7 / 0.00ms / 0.0000 | 0.90ms / 7 / 0.00ms / 0.0000 | — |
| `drawer/basic` | Drawer | standard | 6.00ms / 40 / 0.00ms / 0.0000 | 6.60ms / 40 / 0.00ms / 0.0000 | `cascade-fanout` |
| `editable-table/basic` | EditableTable | standard | 5.20ms / 47 / 0.00ms / 0.0000 | 4.40ms / 35 / 0.00ms / 0.0000 | `cascade-fanout` |
| `elastic-slider/frame-budget` | ElasticSlider | animation | 0.90ms / 30 / 0.00ms / 0.0000 | 0.80ms / 26 / 0.00ms / 0.0000 | — |
| `electric-border/frame-budget` | ElectricBorder | animation | 0.70ms / 15 / 0.00ms / 0.0000 | 0.30ms / 13 / 0.00ms / 0.0000 | — |
| `emoji-picker/basic` | EmojiPicker | standard | 2.40ms / 20 / 0.00ms / 0.0000 | 2.20ms / 17 / 0.00ms / 0.0000 | — |
| `empty/basic` | Empty | standard | 0.90ms / 11 / 0.00ms / 0.0000 | 0.70ms / 10 / 0.00ms / 0.0000 | — |
| `event-stream/basic` | EventStream | standard | 1.80ms / 14 / 0.00ms / 0.0000 | 1.60ms / 15 / 0.00ms / 0.0000 | `avoidable-render` |
| `evil-eye/frame-budget` | EvilEye | animation | 0.20ms / 7 / 106.00ms / 0.0104 | 0.30ms / 7 / 93.00ms / 0.0209 | — |
| `fab/basic` | Fab | standard | 1.00ms / 13 / 0.00ms / 0.0000 | 1.10ms / 12 / 0.00ms / 0.0000 | — |
| `falling-text/frame-budget` | FallingText | animation | 0.30ms / 10 / 0.00ms / 0.0000 | 0.30ms / 10 / 0.00ms / 0.0000 | — |
| `faulty-terminal/frame-budget` | FaultyTerminal | animation | 0.20ms / 8 / 2622.00ms / 0.6615 | 0.20ms / 8 / 1949.00ms / 0.4479 | `long-task`, `dropped-frames` |
| `ferrofluid/frame-budget` | Ferrofluid | animation | 0.20ms / 8 / 357.00ms / 0.0419 | 0.20ms / 8 / 192.00ms / 0.0365 | `long-task` |
| `field/basic` | Field | standard | 2.60ms / 18 / 0.00ms / 0.0000 | 2.40ms / 16 / 0.00ms / 0.0000 | — |
| `file-tree/basic` | FileTree | standard | 1.50ms / 27 / 0.00ms / 0.0000 | 1.50ms / 20 / 0.00ms / 0.0000 | `avoidable-render` |
| `fit-screen/basic` | FitScreen | standard | 1.40ms / 12 / 0.00ms / 0.0000 | 1.00ms / 12 / 0.00ms / 0.0000 | — |
| `flickering-grid/frame-budget` | FlickeringGrid | animation | 0.30ms / 9 / 0.00ms / 0.0000 | 0.30ms / 9 / 0.00ms / 0.0000 | — |
| `floating-lines/frame-budget` | FloatingLines | animation | 0.30ms / 8 / 406.00ms / 0.6615 | 0.20ms / 8 / 216.00ms / 0.1927 | `long-task`, `dropped-frames` |
| `floating-reactions/frame-budget` | FloatingReactions | animation | 0.40ms / 9 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `flow/basic` | Flow | standard | 3.00ms / 25 / 0.00ms / 0.0000 | 2.50ms / 20 / 0.00ms / 0.0000 | — |
| `flowing-menu/frame-budget` | FlowingMenu | animation | 0.80ms / 37 / 0.00ms / 0.0000 | 0.50ms / 38 / 0.00ms / 0.0000 | — |
| `fluid-glass/frame-budget` | FluidGlass | animation | 0.20ms / 10 / 120.00ms / 0.0157 | 0.10ms / 10 / 51.00ms / 0.0053 | — |
| `flying-posters/frame-budget` | FlyingPosters | animation | 0.20ms / 8 / 233.00ms / 0.2147 | 0.20ms / 7 / 103.00ms / 0.0052 | `long-task` |
| `folder/frame-budget` | Folder | animation | 0.20ms / 12 / 0.00ms / 0.0000 | 0.20ms / 11 / 0.00ms / 0.0000 | — |
| `form-dialog/basic` | ModalForm | standard | 6.40ms / 51 / 0.00ms / 0.0000 | 5.50ms / 44 / 0.00ms / 0.0000 | `cascade-fanout` |
| `form/validation` | Form | core | 4.90ms / 87 / 0.00ms / 0.0000 | 4.40ms / 77 / 0.00ms / 0.0000 | `cascade-fanout` |
| `funnel/basic` | Funnel | standard | 2.10ms / 15 / 0.00ms / 0.0000 | 1.90ms / 13 / 0.00ms / 0.0000 | — |
| `fuzzy-text/frame-budget` | FuzzyText | animation | 0.30ms / 8 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `galaxy/frame-budget` | Galaxy | animation | 0.50ms / 8 / 404.00ms / 0.6615 | 0.30ms / 8 / 113.00ms / 0.6615 | `long-task`, `dropped-frames` |
| `gantt/basic` | Gantt | standard | 2.90ms / 23 / 0.00ms / 0.0000 | 2.40ms / 22 / 0.00ms / 0.0000 | `avoidable-render` |
| `ghost-cursor/frame-budget` | GhostCursor | animation | 0.20ms / 8 / 91.00ms / 0.0052 | 0.20ms / 8 / 82.00ms / 0.0052 | — |
| `gift-feed/frame-budget` | GiftFeed | animation | 0.40ms / 17 / 0.00ms / 0.0000 | 0.50ms / 14 / 0.00ms / 0.0000 | — |
| `git-commit/basic` | GitCommit | standard | 2.50ms / 14 / 0.00ms / 0.0000 | 2.20ms / 15 / 0.00ms / 0.0000 | `avoidable-render` |
| `glare-hover/frame-budget` | GlareHover | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.10ms / 6 / 0.00ms / 0.0000 | — |
| `glass-icons/frame-budget` | GlassIcons | animation | 0.60ms / 23 / 0.00ms / 0.0000 | 0.40ms / 23 / 0.00ms / 0.0000 | — |
| `glass-surface/frame-budget` | GlassSurface | animation | 0.50ms / 7 / 0.00ms / 0.0000 | 0.40ms / 12 / 0.00ms / 0.0000 | — |
| `glimpse/basic` | Glimpse | standard | 7.50ms / 38 / 0.00ms / 0.0000 | 7.00ms / 36 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `glitch-text/frame-budget` | GlitchText | animation | 0.20ms / 6 / 0.00ms / 0.0000 | 0.10ms / 6 / 0.00ms / 0.0000 | — |
| `gooey-nav/frame-budget` | GooeyNav | animation | 0.60ms / 16 / 0.00ms / 0.0000 | 0.50ms / 16 / 0.00ms / 0.0000 | — |
| `gradient-blinds/frame-budget` | GradientBlinds | animation | 0.20ms / 8 / 194.00ms / 0.0052 | 0.10ms / 8 / 443.00ms / 0.0579 | `long-task` |
| `gradual-blur/frame-budget` | GradualBlur | animation | 0.50ms / 12 / 0.00ms / 0.0000 | 0.40ms / 11 / 0.00ms / 0.0000 | — |
| `grainient/frame-budget` | Grainient | animation | 0.30ms / 8 / 72.00ms / 0.0052 | 0.10ms / 8 / 134.00ms / 0.0209 | `long-task` |
| `grid-distortion/frame-budget` | GridDistortion | animation | 0.10ms / 8 / 57.00ms / 0.0052 | 0.40ms / 8 / 58.00ms / 0.0053 | — |
| `grid-motion/frame-budget` | GridMotion | animation | 0.80ms / 30 / 0.00ms / 0.0000 | 0.70ms / 40 / 0.00ms / 0.0000 | — |
| `grid-pattern/basic` | GridPattern | standard | 0.90ms / 10 / 0.00ms / 0.0000 | 1.00ms / 11 / 0.00ms / 0.0000 | — |
| `grid-scan/frame-budget` | GridScan | animation | 0.20ms / 7 / 612.00ms / 0.0052 | 0.20ms / 10 / 176.00ms / 0.0052 | `long-task` |
| `grid/basic` | Grid | standard | 1.20ms / 8 / 0.00ms / 0.0000 | 1.20ms / 8 / 0.00ms / 0.0000 | — |
| `heading/basic` | Heading | standard | 0.90ms / 6 / 0.00ms / 0.0000 | 0.90ms / 7 / 0.00ms / 0.0000 | — |
| `heatmap/basic` | Heatmap | standard | 2.20ms / 17 / 0.00ms / 0.0000 | 1.70ms / 17 / 0.00ms / 0.0000 | `avoidable-render` |
| `hero-video-dialog/basic` | HeroVideoDialog | standard | 1.60ms / 12 / 0.00ms / 0.0000 | 1.40ms / 10 / 0.00ms / 0.0000 | — |
| `hover-card/basic` | HoverCard | standard | 6.60ms / 35 / 0.00ms / 0.0000 | 6.70ms / 36 / 0.00ms / 0.0000 | `cascade-fanout` |
| `hyperspeed/frame-budget` | Hyperspeed | animation | 0.20ms / 8 / 101.00ms / 0.0211 | 0.20ms / 8 / 60.00ms / 0.0053 | — |
| `icon-picker/basic` | IconPicker | standard | 2.90ms / 25 / 0.00ms / 0.0000 | 2.80ms / 24 / 0.00ms / 0.0000 | `avoidable-render` |
| `image-cropper/basic` | ImageCropper | standard | 7.30ms / 28 / 0.00ms / 0.0000 | 6.00ms / 30 / 0.00ms / 0.0000 | — |
| `image-trail/frame-budget` | ImageTrail | animation | 0.30ms / 11 / 0.00ms / 0.0000 | 0.30ms / 10 / 0.00ms / 0.0000 | — |
| `image-viewer/basic` | ImageViewer | standard | 0.70ms / 5 / 0.00ms / 0.0000 | 0.60ms / 5 / 0.00ms / 0.0000 | — |
| `image/basic` | Image | standard | 0.80ms / 7 / 0.00ms / 0.0000 | 0.80ms / 7 / 0.00ms / 0.0000 | — |
| `infinite-menu/frame-budget` | InfiniteMenu | animation | 15.20ms / 18 / 0.00ms / 0.0000 | 11.40ms / 15 / 0.00ms / 0.0000 | — |
| `infinite-scroll/basic` | InfiniteScroll | standard | 1.10ms / 11 / 0.00ms / 0.0000 | 0.70ms / 11 / 0.00ms / 0.0000 | — |
| `input-otp/basic` | InputOTP | standard | 1.50ms / 11 / 0.00ms / 0.0000 | 1.40ms / 10 / 0.00ms / 0.0000 | — |
| `input/basic` | Input | core | 1.60ms / 9 / 0.00ms / 0.0000 | 1.30ms / 9 / 0.00ms / 0.0000 | — |
| `intercept-card/basic` | InterceptCard | standard | 1.20ms / 10 / 0.00ms / 0.0000 | 1.20ms / 10 / 0.00ms / 0.0000 | `avoidable-render` |
| `iphone/basic` | IPhone | standard | 0.90ms / 9 / 0.00ms / 0.0000 | 0.70ms / 10 / 0.00ms / 0.0000 | — |
| `iridescence/frame-budget` | Iridescence | animation | 0.30ms / 8 / 115.00ms / 0.0417 | 0.10ms / 7 / 0.00ms / 0.0052 | — |
| `json-viewer/basic` | JsonViewer | standard | 1.80ms / 26 / 0.00ms / 0.0000 | 1.60ms / 24 / 0.00ms / 0.0000 | `avoidable-render` |
| `kanban/basic` | Kanban | standard | 3.40ms / 27 / 0.00ms / 0.0000 | 3.10ms / 27 / 0.00ms / 0.0000 | — |
| `kbd/basic` | Kbd | standard | 0.70ms / 6 / 0.00ms / 0.0000 | 0.40ms / 6 / 0.00ms / 0.0000 | `avoidable-render` |
| `lanyard/frame-budget` | Lanyard | animation | 0.30ms / 13 / 0.00ms / 0.0000 | 0.30ms / 10 / 0.00ms / 0.0000 | — |
| `laser-flow/frame-budget` | LaserFlow | animation | 0.40ms / 8 / 552.00ms / 0.6615 | 0.30ms / 8 / 130.00ms / 0.5417 | `long-task`, `dropped-frames` |
| `layout/basic` | Layout | standard | 4.40ms / 45 / 0.00ms / 0.0000 | 4.10ms / 43 / 0.00ms / 0.0000 | `cascade-fanout` |
| `legend/basic` | Legend | standard | 1.20ms / 12 / 0.00ms / 0.0000 | 0.90ms / 10 / 0.00ms / 0.0000 | — |
| `lens/frame-budget` | Lens | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `letter-glitch/frame-budget` | LetterGlitch | animation | 0.30ms / 9 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `light-pillar/frame-budget` | LightPillar | animation | 0.30ms / 9 / 132.00ms / 0.6615 | 0.20ms / 7 / 68.00ms / 0.6615 | `dropped-frames` |
| `light-rays/frame-budget` | LightRays | animation | 0.30ms / 8 / 64.00ms / 0.0052 | 0.20ms / 7 / 55.00ms / 0.0053 | — |
| `lightfall/frame-budget` | Lightfall | animation | 0.30ms / 7 / 164.00ms / 0.2552 | 0.20ms / 8 / 156.00ms / 0.0365 | `long-task` |
| `lightning/frame-budget` | Lightning | animation | 0.20ms / 8 / 0.00ms / 0.0052 | 0.30ms / 9 / 0.00ms / 0.0053 | — |
| `line-waves/frame-budget` | LineWaves | animation | 0.30ms / 7 / 68.00ms / 0.0052 | 0.20ms / 8 / 57.00ms / 0.0052 | — |
| `link/basic` | Link | standard | 0.90ms / 7 / 0.00ms / 0.0000 | 0.80ms / 7 / 0.00ms / 0.0000 | — |
| `liquid-chrome/frame-budget` | LiquidChrome | animation | 0.20ms / 7 / 98.00ms / 0.6615 | 0.20ms / 8 / 72.00ms / 0.6615 | `dropped-frames` |
| `liquid-ether/frame-budget` | LiquidEther | animation | 0.20ms / 8 / 64.00ms / 0.0052 | 0.20ms / 8 / 147.00ms / 0.0052 | `long-task` |
| `list/basic` | List | standard | 3.20ms / 46 / 0.00ms / 0.0000 | 3.20ms / 48 / 0.00ms / 0.0000 | `cascade-fanout` |
| `listbox/basic` | Listbox | standard | 1.80ms / 19 / 0.00ms / 0.0000 | 1.50ms / 20 / 0.00ms / 0.0000 | — |
| `live-chat/basic` | LiveChat | standard | 1.20ms / 13 / 0.00ms / 0.0000 | 1.30ms / 15 / 0.00ms / 0.0000 | — |
| `live-player/basic` | LivePlayer | standard | 2.00ms / 16 / 0.00ms / 0.0000 | 1.60ms / 15 / 0.00ms / 0.0000 | `avoidable-render` |
| `live-product-card/basic` | LiveProductCard | standard | 0.90ms / 15 / 0.00ms / 0.0000 | 0.90ms / 13 / 0.00ms / 0.0000 | `avoidable-render` |
| `log-viewer/basic` | LogViewer | standard | 0.80ms / 8 / 0.00ms / 0.0000 | 0.80ms / 8 / 0.00ms / 0.0000 | — |
| `login-form/basic` | LoginForm | standard | 4.10ms / 47 / 0.00ms / 0.0000 | 3.50ms / 33 / 0.00ms / 0.0000 | `cascade-fanout` |
| `logo-loop/frame-budget` | LogoLoop | animation | 1.20ms / 39 / 0.00ms / 0.0000 | 1.10ms / 34 / 0.00ms / 0.0000 | — |
| `magic-bento/frame-budget` | MagicBento | animation | 0.40ms / 15 / 0.00ms / 0.0000 | 0.30ms / 17 / 0.00ms / 0.0000 | — |
| `magic-card/frame-budget` | MagicCard | animation | 0.50ms / 12 / 0.00ms / 0.0000 | 0.40ms / 13 / 0.00ms / 0.0000 | — |
| `magic-rings/frame-budget` | MagicRings | animation | 0.20ms / 8 / 83.00ms / 0.0785 | 0.20ms / 7 / 66.00ms / 0.0052 | — |
| `magnet-lines/frame-budget` | MagnetLines | animation | 0.50ms / 11 / 0.00ms / 0.0000 | 0.50ms / 11 / 0.00ms / 0.0000 | — |
| `magnet/frame-budget` | Magnet | animation | 0.30ms / 11 / 0.00ms / 0.0000 | 0.20ms / 11 / 0.00ms / 0.0000 | — |
| `markdown-editor/stress` | MarkdownEditor | heavy | 2.10ms / 44 / 0.00ms / 0.0000 | 2.10ms / 55 / 0.00ms / 0.0000 | — |
| `markdown/basic` | Markdown | standard | 2.50ms / 22 / 0.00ms / 0.0000 | 2.40ms / 18 / 0.00ms / 0.0000 | `avoidable-render` |
| `marquee/frame-budget` | Marquee | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `masonry/basic` | Masonry | standard | 2.60ms / 16 / 0.00ms / 0.0000 | 2.40ms / 16 / 0.00ms / 0.0000 | — |
| `math-text/basic` | MathText | standard | 1.10ms / 10 / 0.00ms / 0.0000 | 1.20ms / 13 / 0.00ms / 0.0000 | — |
| `mentions/basic` | Mentions | standard | 1.10ms / 9 / 0.00ms / 0.0000 | 1.00ms / 9 / 0.00ms / 0.0000 | — |
| `menu/basic` | Menu | standard | 10.40ms / 40 / 0.00ms / 0.0000 | 8.90ms / 39 / 0.00ms / 0.0000 | `cascade-fanout` |
| `menubar/basic` | Menubar | standard | 12.20ms / 52 / 0.00ms / 0.0000 | 11.00ms / 51 / 0.00ms / 0.0000 | `cascade-fanout` |
| `message-actions/basic` | MessageActions | standard | 1.40ms / 16 / 0.00ms / 0.0000 | 1.30ms / 16 / 0.00ms / 0.0000 | — |
| `meta-balls/frame-budget` | MetaBalls | animation | 0.30ms / 8 / 51.00ms / 0.0053 | 0.20ms / 8 / 0.00ms / 0.0052 | — |
| `metallic-paint/frame-budget` | MetallicPaint | animation | 0.30ms / 7 / 96.00ms / 0.0053 | 0.10ms / 8 / 87.00ms / 0.0053 | — |
| `meteors/frame-budget` | Meteors | animation | 0.40ms / 9 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `meter/basic` | Meter | standard | 1.90ms / 14 / 0.00ms / 0.0000 | 1.60ms / 15 / 0.00ms / 0.0000 | `avoidable-render` |
| `modal/basic` | modal | standard | 1.80ms / 13 / 0.00ms / 0.0000 | 1.50ms / 13 / 0.00ms / 0.0000 | — |
| `model-viewer/frame-budget` | ModelViewer | animation | 0.40ms / 20 / 0.00ms / 0.0000 | 0.40ms / 17 / 0.00ms / 0.0000 | — |
| `nav-menu/basic` | NavMenu | standard | 5.10ms / 32 / 0.00ms / 0.0000 | 5.00ms / 30 / 0.00ms / 0.0000 | — |
| `navbar/basic` | Navbar | standard | 1.60ms / 15 / 0.00ms / 0.0000 | 1.40ms / 17 / 0.00ms / 0.0000 | — |
| `navigation-menu/basic` | NavigationMenu | standard | 7.20ms / 56 / 0.00ms / 0.0000 | 7.00ms / 57 / 0.00ms / 0.0000 | `cascade-fanout` |
| `notification/basic` | notification | standard | 1.70ms / 16 / 0.00ms / 0.0000 | 1.70ms / 18 / 0.00ms / 0.0000 | — |
| `number-field/basic` | NumberField | standard | 2.80ms / 19 / 0.00ms / 0.0000 | 2.80ms / 21 / 0.00ms / 0.0000 | `avoidable-render` |
| `number-ticker/frame-budget` | NumberTicker | animation | 0.30ms / 6 / 0.00ms / 0.0000 | 0.40ms / 6 / 0.00ms / 0.0000 | — |
| `orb/frame-budget` | Orb | animation | 0.30ms / 8 / 55.00ms / 0.0052 | 0.10ms / 8 / 51.00ms / 0.0052 | — |
| `orbit-images/frame-budget` | OrbitImages | animation | 0.40ms / 14 / 0.00ms / 0.0000 | 0.50ms / 13 / 0.00ms / 0.0000 | — |
| `orbiting-circles/frame-budget` | OrbitingCircles | animation | 0.30ms / 11 / 0.00ms / 0.0000 | 0.40ms / 11 / 0.00ms / 0.0000 | — |
| `page-header/basic` | PageHeader | standard | 3.40ms / 41 / 0.00ms / 0.0000 | 2.80ms / 42 / 0.00ms / 0.0000 | `cascade-fanout` |
| `pagination/basic` | Pagination | standard | 3.70ms / 13 / 0.00ms / 0.0000 | 3.30ms / 15 / 0.00ms / 0.0000 | — |
| `particles/frame-budget` | Particles | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.10ms / 9 / 0.00ms / 0.0000 | — |
| `password-generator/basic` | PasswordGenerator | standard | 8.40ms / 48 / 0.00ms / 0.0000 | 7.30ms / 46 / 0.00ms / 0.0000 | `cascade-fanout` |
| `picker/basic` | Picker | standard | 0.90ms / 13 / 0.00ms / 0.0000 | 0.90ms / 14 / 0.00ms / 0.0000 | — |
| `pill-nav/frame-budget` | PillNav | animation | 0.20ms / 16 / 0.00ms / 0.0000 | 0.20ms / 14 / 0.00ms / 0.0000 | — |
| `pixel-blast/frame-budget` | PixelBlast | animation | 0.20ms / 8 / 60.00ms / 0.0052 | 0.20ms / 8 / 54.00ms / 0.0053 | — |
| `pixel-card/frame-budget` | PixelCard | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.20ms / 10 / 0.00ms / 0.0000 | — |
| `pixel-snow/frame-budget` | PixelSnow | animation | 0.30ms / 8 / 85.00ms / 0.6615 | 0.20ms / 8 / 77.00ms / 0.6615 | `dropped-frames` |
| `pixel-trail/frame-budget` | PixelTrail | animation | 0.20ms / 9 / 96.00ms / 0.0157 | 0.20ms / 7 / 0.00ms / 0.0052 | — |
| `pixel-transition/frame-budget` | PixelTransition | animation | 0.60ms / 17 / 0.00ms / 0.0000 | 0.60ms / 16 / 0.00ms / 0.0000 | — |
| `plasma-wave/frame-budget` | PlasmaWave | animation | 0.20ms / 8 / 104.00ms / 0.0314 | 0.20ms / 8 / 0.00ms / 0.0053 | — |
| `plasma/frame-budget` | Plasma | animation | 0.20ms / 8 / 57.00ms / 0.4167 | 0.30ms / 8 / 52.00ms / 0.1979 | `dropped-frames` |
| `popconfirm/basic` | Popconfirm | standard | 7.60ms / 44 / 0.00ms / 0.0000 | 7.20ms / 42 / 0.00ms / 0.0000 | `cascade-fanout` |
| `popover/basic` | Popover | standard | 7.60ms / 46 / 0.00ms / 0.0000 | 6.70ms / 45 / 0.00ms / 0.0000 | `cascade-fanout` |
| `pricing-table/basic` | PricingTable | standard | 2.30ms / 21 / 0.00ms / 0.0000 | 2.40ms / 21 / 0.00ms / 0.0000 | `avoidable-render` |
| `prism/frame-budget` | Prism | animation | 0.20ms / 8 / 73.00ms / 0.6615 | 0.20ms / 7 / 66.00ms / 0.6615 | `dropped-frames` |
| `prismatic-burst/frame-budget` | PrismaticBurst | animation | 0.20ms / 8 / 100.00ms / 0.6615 | 0.20ms / 8 / 91.00ms / 0.6615 | `dropped-frames` |
| `pro-form/basic` | ProForm | standard | 3.10ms / 30 / 0.00ms / 0.0000 | 3.00ms / 37 / 0.00ms / 0.0000 | `cascade-fanout` |
| `pro-table/stress` | ProTable | heavy | 13.40ms / 80 / 0.00ms / 0.0000 | 13.70ms / 89 / 0.00ms / 0.0000 | — |
| `profile-card/frame-budget` | ProfileCard | animation | 0.30ms / 13 / 0.00ms / 0.0000 | 0.50ms / 13 / 0.00ms / 0.0000 | — |
| `progress/basic` | Progress | standard | 0.80ms / 8 / 0.00ms / 0.0000 | 0.50ms / 8 / 0.00ms / 0.0000 | — |
| `progressive-blur/basic` | ProgressiveBlur | standard | 1.40ms / 10 / 0.00ms / 0.0000 | 0.90ms / 10 / 0.00ms / 0.0000 | — |
| `prompt-input/basic` | PromptInput | standard | 2.80ms / 22 / 0.00ms / 0.0000 | 2.60ms / 23 / 0.00ms / 0.0000 | — |
| `prompt-suggestions/basic` | PromptSuggestions | standard | 0.90ms / 9 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `prose/basic` | Prose | standard | 1.10ms / 10 / 0.00ms / 0.0000 | 0.90ms / 9 / 0.00ms / 0.0000 | — |
| `pull-to-refresh/basic` | PullToRefresh | standard | 1.40ms / 13 / 0.00ms / 0.0000 | 1.20ms / 14 / 0.00ms / 0.0000 | — |
| `pulsating-button/frame-budget` | PulsatingButton | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `qrcode/basic` | QRCode | standard | 19.30ms / 7 / 0.00ms / 0.0000 | 19.10ms / 7 / 0.00ms / 0.0000 | `avoidable-render` |
| `question-card/basic` | QuestionCard | standard | 2.00ms / 27 / 0.00ms / 0.0000 | 1.80ms / 25 / 0.00ms / 0.0000 | — |
| `queue-lane/basic` | QueueLane | standard | 3.70ms / 33 / 0.00ms / 0.0000 | 3.70ms / 35 / 0.00ms / 0.0000 | `cascade-fanout` |
| `radar/frame-budget` | Radar | animation | 0.30ms / 8 / 62.00ms / 0.0053 | 0.20ms / 8 / 57.00ms / 0.0052 | — |
| `radio/basic` | RadioGroup | standard | 3.60ms / 31 / 0.00ms / 0.0000 | 3.20ms / 27 / 0.00ms / 0.0000 | — |
| `rainbow-button/frame-budget` | RainbowButton | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `rating/basic` | Rating | standard | 1.50ms / 13 / 0.00ms / 0.0000 | 1.60ms / 12 / 0.00ms / 0.0000 | `avoidable-render` |
| `reflective-card/frame-budget` | ReflectiveCard | animation | 0.60ms / 19 / 0.00ms / 0.0000 | 0.40ms / 20 / 0.00ms / 0.0000 | — |
| `region-cascader/basic` | RegionCascader | standard | 11.70ms / 48 / 0.00ms / 0.0000 | 9.30ms / 47 / 0.00ms / 0.0000 | `cascade-fanout` |
| `region-select/basic` | RegionSelect | standard | 1.50ms / 12 / 0.00ms / 0.0000 | 1.00ms / 12 / 0.00ms / 0.0000 | — |
| `relative-time/basic` | RelativeTime | standard | 0.70ms / 6 / 0.00ms / 0.0000 | 0.80ms / 6 / 0.00ms / 0.0000 | — |
| `remote-select/basic` | RemoteSelect | standard | 4.00ms / 27 / 0.00ms / 0.0000 | 3.70ms / 26 / 0.00ms / 0.0000 | — |
| `resizable/basic` | ResizablePanelGroup | standard | 2.20ms / 21 / 0.00ms / 0.0000 | 2.30ms / 21 / 0.00ms / 0.0000 | — |
| `result/basic` | Result | standard | 1.30ms / 17 / 0.00ms / 0.0000 | 1.10ms / 17 / 0.00ms / 0.0000 | — |
| `retro-grid/frame-budget` | RetroGrid | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `reveal/frame-budget` | Reveal | animation | 0.40ms / 11 / 0.00ms / 0.0000 | 0.40ms / 13 / 0.00ms / 0.0000 | — |
| `ribbons/frame-budget` | Ribbons | animation | 0.20ms / 8 / 128.00ms / 0.0052 | 0.30ms / 8 / 118.00ms / 0.0052 | `long-task` |
| `ripple-button/frame-budget` | RippleButton | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.30ms / 7 / 0.00ms / 0.0000 | — |
| `ripple-grid/frame-budget` | RippleGrid | animation | 0.20ms / 8 / 62.00ms / 0.0052 | 0.30ms / 9 / 58.00ms / 0.0053 | — |
| `ripple/frame-budget` | Ripple | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 10 / 0.00ms / 0.0000 | — |
| `route-tabs/basic` | RouteTabs | standard | 4.90ms / 55 / 0.00ms / 0.0000 | 4.70ms / 56 / 0.00ms / 0.0000 | `cascade-fanout` |
| `safari/basic` | Safari | standard | 0.80ms / 9 / 0.00ms / 0.0000 | 0.80ms / 9 / 0.00ms / 0.0000 | — |
| `safe-area/basic` | SafeArea | standard | 0.90ms / 9 / 0.00ms / 0.0000 | 0.80ms / 9 / 0.00ms / 0.0000 | — |
| `sankey/basic` | Sankey | standard | 2.00ms / 14 / 0.00ms / 0.0000 | 2.10ms / 16 / 0.00ms / 0.0000 | — |
| `scheduler/basic` | Scheduler | standard | 5.30ms / 34 / 0.00ms / 0.0000 | 5.10ms / 29 / 0.00ms / 0.0000 | `avoidable-render` |
| `scope-matrix/basic` | ScopeMatrix | standard | 1.80ms / 18 / 0.00ms / 0.0000 | 1.80ms / 18 / 0.00ms / 0.0000 | `avoidable-render` |
| `score-ring/basic` | ScoreRing | standard | 0.70ms / 9 / 0.00ms / 0.0000 | 0.90ms / 9 / 0.00ms / 0.0000 | — |
| `scrambled-text/frame-budget` | ScrambledText | animation | 0.30ms / 11 / 0.00ms / 0.0000 | 0.30ms / 10 / 0.00ms / 0.0000 | — |
| `scroll-area/basic` | ScrollArea | standard | 4.30ms / 19 / 0.00ms / 0.0000 | 3.60ms / 20 / 0.00ms / 0.0000 | — |
| `scroll-float/frame-budget` | ScrollFloat | animation | 1.00ms / 19 / 0.00ms / 0.0000 | 1.20ms / 20 / 0.00ms / 0.0000 | — |
| `scroll-reveal/frame-budget` | ScrollReveal | animation | 1.00ms / 24 / 0.00ms / 0.0000 | 0.90ms / 23 / 0.00ms / 0.0000 | — |
| `scroll-stack/frame-budget` | ScrollStack | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.30ms / 19 / 0.00ms / 0.0000 | — |
| `scroll-velocity/frame-budget` | ScrollVelocity | animation | 0.60ms / 17 / 0.00ms / 0.0000 | 0.40ms / 17 / 0.00ms / 0.0000 | — |
| `search-form/basic` | SearchForm | standard | 8.20ms / 71 / 0.00ms / 0.0000 | 7.00ms / 61 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `secret-field/basic` | SecretField | standard | 1.30ms / 12 / 0.00ms / 0.0000 | 1.00ms / 12 / 0.00ms / 0.0000 | `avoidable-render` |
| `segmented/basic` | Segmented | standard | 1.40ms / 9 / 0.00ms / 0.0000 | 1.50ms / 9 / 0.00ms / 0.0000 | — |
| `select/stress` | Select | heavy | 75.30ms / 587 / 68.00ms / 0.0000 | 72.70ms / 567 / 64.00ms / 0.0000 | `cascade-fanout` |
| `separator/basic` | Separator | standard | 1.40ms / 9 / 0.00ms / 0.0000 | 1.10ms / 9 / 0.00ms / 0.0000 | `avoidable-render` |
| `service-message/basic` | ServiceMessage | standard | 2.10ms / 24 / 0.00ms / 0.0000 | 1.80ms / 25 / 0.00ms / 0.0000 | — |
| `shape-blur/frame-budget` | ShapeBlur | animation | 0.30ms / 8 / 0.00ms / 0.0052 | 0.20ms / 7 / 0.00ms / 0.0052 | — |
| `shape-grid/frame-budget` | ShapeGrid | animation | 0.30ms / 8 / 0.00ms / 0.0000 | 0.30ms / 7 / 0.00ms / 0.0000 | — |
| `shield-badge/basic` | ShieldBadge | standard | 0.90ms / 16 / 0.00ms / 0.0000 | 1.20ms / 12 / 0.00ms / 0.0000 | — |
| `shimmer-button/frame-budget` | ShimmerButton | animation | 0.10ms / 5 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `shine-border/frame-budget` | ShineBorder | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `shuffle/frame-budget` | Shuffle | animation | 4.40ms / 9 / 0.00ms / 0.0000 | 3.50ms / 9 / 0.00ms / 0.0000 | — |
| `side-rays/frame-budget` | SideRays | animation | 0.20ms / 8 / 53.00ms / 0.0052 | 0.30ms / 8 / 51.00ms / 0.0052 | — |
| `silk/frame-budget` | Silk | animation | 0.20ms / 8 / 0.00ms / 0.0052 | 0.20ms / 8 / 0.00ms / 0.0052 | — |
| `skeleton/basic` | Skeleton | standard | 1.70ms / 16 / 0.00ms / 0.0000 | 1.70ms / 19 / 0.00ms / 0.0000 | — |
| `slider/basic` | Slider | standard | 3.00ms / 19 / 0.00ms / 0.0000 | 2.30ms / 19 / 0.00ms / 0.0000 | `avoidable-render` |
| `snippet/basic` | Snippet | standard | 1.30ms / 13 / 0.00ms / 0.0000 | 1.30ms / 11 / 0.00ms / 0.0000 | `avoidable-render` |
| `social-button/basic` | SocialButton | standard | 0.80ms / 9 / 0.00ms / 0.0000 | 0.90ms / 9 / 0.00ms / 0.0000 | — |
| `soft-aurora/frame-budget` | SoftAurora | animation | 0.30ms / 7 / 130.00ms / 0.0052 | 0.30ms / 7 / 119.00ms / 0.0105 | `long-task` |
| `sortable/basic` | Sortable | standard | 5.40ms / 37 / 0.00ms / 0.0000 | 4.70ms / 40 / 0.00ms / 0.0000 | `cascade-fanout` |
| `spacer/basic` | Spacer | standard | 0.80ms / 7 / 0.00ms / 0.0000 | 0.80ms / 9 / 0.00ms / 0.0000 | — |
| `sparkles-text/frame-budget` | SparklesText | animation | 0.70ms / 18 / 0.00ms / 0.0000 | 0.60ms / 16 / 0.00ms / 0.0000 | — |
| `sparkline/basic` | Sparkline | standard | 1.50ms / 9 / 0.00ms / 0.0000 | 1.30ms / 9 / 0.00ms / 0.0000 | — |
| `spin/basic` | Spin | standard | 1.30ms / 12 / 0.00ms / 0.0000 | 1.30ms / 12 / 0.00ms / 0.0000 | — |
| `spinner/basic` | Spinner | standard | 0.80ms / 8 / 0.00ms / 0.0000 | 0.60ms / 9 / 0.00ms / 0.0000 | `avoidable-render` |
| `splash-cursor/frame-budget` | SplashCursor | animation | 0.30ms / 9 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `split-text/frame-budget` | SplitText | animation | 0.70ms / 15 / 0.00ms / 0.0000 | 0.70ms / 15 / 0.00ms / 0.0000 | — |
| `spotlight/basic` | Spotlight | standard | 0.80ms / 8 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `stack/basic` | Stack | standard | 0.70ms / 8 / 0.00ms / 0.0000 | 0.70ms / 8 / 0.00ms / 0.0000 | — |
| `staggered-menu/frame-budget` | StaggeredMenu | animation | 0.40ms / 15 / 0.00ms / 0.0000 | 0.30ms / 16 / 0.00ms / 0.0000 | — |
| `star-border/frame-budget` | StarBorder | animation | 0.30ms / 9 / 0.00ms / 0.0000 | 0.30ms / 9 / 0.00ms / 0.0000 | — |
| `stat/basic` | Stat | standard | 1.10ms / 11 / 0.00ms / 0.0000 | 1.20ms / 11 / 0.00ms / 0.0000 | — |
| `statistic/basic` | Statistic | standard | 1.90ms / 8 / 0.00ms / 0.0000 | 1.80ms / 8 / 0.00ms / 0.0000 | `avoidable-render` |
| `status-dot/basic` | StatusDot | standard | 1.20ms / 10 / 0.00ms / 0.0000 | 0.90ms / 10 / 0.00ms / 0.0000 | `avoidable-render` |
| `stepper/basic` | Stepper | standard | 1.20ms / 12 / 0.00ms / 0.0000 | 1.40ms / 12 / 0.00ms / 0.0000 | `avoidable-render` |
| `steps-form/basic` | StepsForm | standard | 3.10ms / 40 / 0.00ms / 0.0000 | 2.80ms / 32 / 0.00ms / 0.0000 | `cascade-fanout` |
| `steps/basic` | Steps | standard | 1.80ms / 24 / 0.00ms / 0.0000 | 1.60ms / 22 / 0.00ms / 0.0000 | `avoidable-render` |
| `sticker-peel/frame-budget` | StickerPeel | animation | 0.40ms / 14 / 0.00ms / 0.0000 | 0.40ms / 15 / 0.00ms / 0.0000 | — |
| `streaming-text/frame-budget` | StreamingText | animation | 0.20ms / 8 / 0.00ms / 0.0000 | 0.20ms / 8 / 0.00ms / 0.0000 | — |
| `striped-pattern/basic` | StripedPattern | standard | 0.90ms / 8 / 0.00ms / 0.0000 | 0.60ms / 8 / 0.00ms / 0.0000 | — |
| `swipe-action/basic` | SwipeAction | standard | 0.90ms / 10 / 0.00ms / 0.0000 | 0.70ms / 9 / 0.00ms / 0.0000 | — |
| `switch/basic` | Switch | standard | 2.00ms / 11 / 0.00ms / 0.0000 | 1.90ms / 11 / 0.00ms / 0.0000 | `avoidable-render` |
| `tab-bar/basic` | TabBar | standard | 1.00ms / 20 / 0.00ms / 0.0000 | 1.10ms / 15 / 0.00ms / 0.0000 | — |
| `table/stress` | Table | heavy | 12.80ms / 87 / 0.00ms / 0.0000 | 13.10ms / 89 / 0.00ms / 0.0000 | — |
| `tablet/basic` | Tablet | standard | 0.70ms / 10 / 0.00ms / 0.0000 | 0.80ms / 10 / 0.00ms / 0.0000 | — |
| `tabs/basic` | Tabs | standard | 4.40ms / 28 / 0.00ms / 0.0000 | 4.30ms / 27 / 0.00ms / 0.0000 | — |
| `tag/basic` | Tag | standard | 1.20ms / 8 / 0.00ms / 0.0000 | 1.00ms / 8 / 0.00ms / 0.0000 | `avoidable-render` |
| `target-cursor/frame-budget` | TargetCursor | animation | 0.30ms / 10 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `task-runner/basic` | TaskRunner | standard | 2.00ms / 21 / 0.00ms / 0.0000 | 1.80ms / 30 / 0.00ms / 0.0000 | — |
| `terminal/frame-budget` | Terminal | animation | 0.50ms / 19 / 0.00ms / 0.0000 | 0.40ms / 16 / 0.00ms / 0.0000 | — |
| `text-cursor/frame-budget` | TextCursor | animation | 0.20ms / 13 / 0.00ms / 0.0000 | 0.20ms / 15 / 0.00ms / 0.0000 | — |
| `text-pressure/frame-budget` | TextPressure | animation | 0.50ms / 10 / 0.00ms / 0.0000 | 0.40ms / 10 / 0.00ms / 0.0000 | — |
| `text/basic` | Text | standard | 0.50ms / 7 / 0.00ms / 0.0000 | 0.70ms / 7 / 0.00ms / 0.0000 | — |
| `textarea/basic` | Textarea | standard | 1.40ms / 7 / 0.00ms / 0.0000 | 1.30ms / 7 / 0.00ms / 0.0000 | — |
| `thinking-block/frame-budget` | ThinkingBlock | animation | 0.40ms / 17 / 0.00ms / 0.0000 | 0.40ms / 17 / 0.00ms / 0.0000 | — |
| `thread-list/basic` | ThreadList | standard | 0.80ms / 13 / 0.00ms / 0.0000 | 0.80ms / 12 / 0.00ms / 0.0000 | — |
| `threads/frame-budget` | Threads | animation | 0.20ms / 8 / 87.00ms / 0.6615 | 0.10ms / 8 / 54.00ms / 0.6218 | `dropped-frames` |
| `tilt/basic` | Tilt | standard | 1.10ms / 10 / 0.00ms / 0.0000 | 0.90ms / 10 / 0.00ms / 0.0000 | — |
| `tilted-card/frame-budget` | TiltedCard | animation | 0.40ms / 18 / 0.00ms / 0.0000 | 0.50ms / 17 / 0.00ms / 0.0000 | — |
| `time-field/basic` | TimeField | standard | 1.70ms / 12 / 0.00ms / 0.0000 | 1.30ms / 12 / 0.00ms / 0.0000 | — |
| `time-picker/basic` | TimePicker | standard | 8.60ms / 41 / 0.00ms / 0.0000 | 8.50ms / 43 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `timeline/basic` | Timeline | standard | 1.90ms / 18 / 0.00ms / 0.0000 | 1.70ms / 17 / 0.00ms / 0.0000 | — |
| `toast/basic` | toast | standard | 1.60ms / 11 / 0.00ms / 0.0000 | 1.20ms / 12 / 0.00ms / 0.0000 | — |
| `toggle/basic` | Toggle | standard | 2.00ms / 14 / 0.00ms / 0.0000 | 1.70ms / 16 / 0.00ms / 0.0000 | — |
| `tool-call/basic` | ToolCall | standard | 3.00ms / 24 / 0.00ms / 0.0000 | 2.50ms / 27 / 0.00ms / 0.0000 | — |
| `toolbar/basic` | Toolbar | standard | 2.20ms / 20 / 0.00ms / 0.0000 | 1.80ms / 20 / 0.00ms / 0.0000 | — |
| `tooltip/basic` | Tooltip | standard | 2.80ms / 22 / 0.00ms / 0.0000 | 2.60ms / 22 / 0.00ms / 0.0000 | — |
| `tour/basic` | Tour | standard | 2.00ms / 15 / 0.00ms / 0.0000 | 1.70ms / 15 / 0.00ms / 0.0000 | — |
| `transfer/basic` | Transfer | standard | 2.80ms / 21 / 0.00ms / 0.0000 | 2.40ms / 20 / 0.00ms / 0.0000 | — |
| `tree-select/basic` | TreeSelect | standard | 6.70ms / 120 / 0.00ms / 0.0000 | 6.30ms / 110 / 0.00ms / 0.0000 | `avoidable-render`, `cascade-fanout` |
| `tree/stress` | Tree | heavy | 1.70ms / 18 / 0.00ms / 0.0000 | 1.80ms / 18 / 0.00ms / 0.0000 | — |
| `true-focus/frame-budget` | TrueFocus | animation | 0.60ms / 18 / 0.00ms / 0.0000 | 0.50ms / 14 / 0.00ms / 0.0000 | — |
| `typing-animation/frame-budget` | TypingAnimation | animation | 0.90ms / 7 / 0.00ms / 0.0000 | 0.80ms / 7 / 0.00ms / 0.0000 | — |
| `typing-dots/frame-budget` | TypingDots | animation | 0.20ms / 7 / 0.00ms / 0.0000 | 0.20ms / 7 / 0.00ms / 0.0000 | — |
| `upload/basic` | Upload | standard | 1.70ms / 9 / 0.00ms / 0.0000 | 1.70ms / 9 / 0.00ms / 0.0000 | — |
| `user/basic` | User | standard | 1.40ms / 12 / 0.00ms / 0.0000 | 1.00ms / 13 / 0.00ms / 0.0000 | — |
| `variable-proximity/frame-budget` | VariableProximity | animation | 0.30ms / 13 / 0.00ms / 0.0000 | 0.30ms / 15 / 0.00ms / 0.0000 | — |
| `video/basic` | Video | standard | 6.60ms / 81 / 0.00ms / 0.0000 | 5.60ms / 86 / 0.00ms / 0.0000 | `cascade-fanout` |
| `viewport/basic` | Viewport | standard | 1.40ms / 12 / 0.00ms / 0.0000 | 1.10ms / 12 / 0.00ms / 0.0000 | — |
| `virtual-list/scroll` | VirtualList | heavy | 0.90ms / 11 / 0.00ms / 0.0000 | 1.10ms / 11 / 0.00ms / 0.0000 | — |
| `voice-record/basic` | VoiceRecord | standard | 1.80ms / 12 / 0.00ms / 0.0000 | 1.50ms / 12 / 0.00ms / 0.0000 | — |
| `watch/basic` | Watch | standard | 0.70ms / 10 / 0.00ms / 0.0000 | 0.60ms / 10 / 0.00ms / 0.0000 | — |
| `watermark/basic` | Watermark | standard | 1.00ms / 9 / 0.00ms / 0.0000 | 0.60ms / 9 / 0.00ms / 0.0000 | — |
| `wavy-background/frame-budget` | WavyBackground | animation | 0.20ms / 9 / 0.00ms / 0.0000 | 0.20ms / 9 / 0.00ms / 0.0000 | — |
| `word-rotate/frame-budget` | WordRotate | animation | 0.40ms / 18 / 0.00ms / 0.0000 | 0.40ms / 18 / 0.00ms / 0.0000 | — |
| `world-map/frame-budget` | WorldMap | animation | 2.20ms / 32 / 0.00ms / 0.0000 | 2.80ms / 44 / 0.00ms / 0.0000 | — |

## 原始证据

- Workspace：`.hulian-scan/workspace-initial/{summary.json,findings.json,checkpoint.json,raw/}`
- Packed：`.hulian-scan/packed-initial/{summary.json,findings.json,checkpoint.json,raw/}`
- 完整 inventory：`.hulian-scan/task11-inventory/inventory.json`
- 冻结基线：`scripts/performance-baseline.json`

这些 `.hulian-scan` 原始文件是本机可恢复证据，按设计不提交 Git；本报告与冻结基线是仓库内的可审阅摘要。

## 优化后复验

### 结果

React 19 全量 workspace 与仓库外 tarball 消费态仍覆盖 372/372 场景，均为 0 执行错误、0 缺失 React commit。Workspace 在 revision `d4addfb` 得到 69 条 findings；packed consumer 在同一 revision 得到 75 条，比首次 packed 的 125 条减少 50 条（40%）。

| 指标 | 首次 packed | 优化后 workspace | 优化后 packed |
| --- | ---: | ---: | ---: |
| 场景 | 372/372 | 372/372 | 372/372 |
| 执行错误 / 缺失 commit | 0 / 0 | 0 / 0 | 0 / 0 |
| Findings | 125 | 69 | 75 |
| `avoidable-render` | 55 | 43 | 45 |
| `cascade-fanout` | 41 | 26 | 29 |
| `long-task` | 16 | 0 | 1（随后修复） |
| `dropped-frames` | 13 | 0 | 0 |

全量 packed 之后又完成两项定向修复：

- CircularGallery 在 revision `3244e59` 把占位纹理由 800×600 图片编码/解码改为 64×48 直接 CanvasTexture，把单卡 5000 顶点降为 512 顶点，并共享标题几何体。Apple M1 Pro Metal 的仓库外 tarball 五样本 long task 为 77/71/83/89/76ms，掉帧比约 0.53%，0 findings；因此全量快照中的唯一 106ms `long-task` 已有后续修复证据。
- Button 在 revision `cf87231` 加入稳定 props 的浅比较边界。React 19 workspace 定向扫描为 0 findings，保留 React 18/19 ref 类型兼容。

因此，当前可信硬件 GPU 证据中已经没有超过 100ms 的 long task 或超过 5% 的 dropped frames。剩余全量 findings 是 45 条低耗时稳定父更新与 29 条交互级联；它们没有被写入基线冒充正常，仍是后续结构优化清单。

### 关键慢路径改善

| 场景 | Before packed median | After packed median | 变化 |
| --- | ---: | ---: | ---: |
| `select/stress` | 72.7ms | 36.9ms | -49.2% |
| `country-select/basic` | 46.2ms | 15.5ms | -66.5% |
| `qrcode/basic` | 19.1ms | 2.0ms | -89.5% |
| `scheduler/basic` | 5.1ms | 1.5ms | -70.6% |

Select、Combobox 与 CountrySelect 对大列表启用内部虚拟化；二维码、日程、文件树、播放器、表单/选择与数据展示组件增加了有 Profiler 证据的 memo/派生计算边界。没有加入 JSON stringify 或无界深比较。

### 基线与 React 18 边界

优化后冻结基线只接纳 297 个无硬违规的 React 19 packed-consumer 场景；其余场景继续保持门禁可见。

React 18.3.1 仓库外 tarball smoke 完成 4/4 场景，0 执行错误、0 缺失 commit，组件包完成类型检查与生产 bundle。其唯一 finding 是 `button/basic` 的 4 次 `avoidable-render`：对应 Button Fiber 的 median self duration 为 0ms；同一 revision 的 React 19 定向扫描为 0。React 18 安装同时明确提示扫描器终端依赖 `react-scan -> react-doctor -> ink` 要求 React 19，所以该项记录为 React 18 诊断兼容噪声，不放宽 React 19 正式门禁，也不宣称 React 18 为零 findings。

### 优化后本机证据

- React 19 workspace 全量：`.hulian-scan/global-final-workspace/summary.json`
- React 19 packed 全量：`.hulian-scan/packed-final/summary.json`
- CircularGallery 后续 packed：`.hulian-scan/circular-gallery-geometry-packed/summary.json`
- Button 后续 workspace：`.hulian-scan/button-memo-workspace/summary.json`
- React 18 packed smoke：`.hulian-scan/react18-button-memo/summary.json`

以上 `.hulian-scan` 文件仍是不提交 Git 的本机证据；本节是可审阅、可追溯的仓库摘要。
