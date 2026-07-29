// 瑚琏动效基元 token —— 时长与缓动曲线的唯一真相源。
//
// 同一组曲线要同时喂给两套实现，否则手感会漂移：
//   · JS 侧（motion）：用 number（秒）与 cubic-bezier 数组
//   · CSS 侧（Base UI 的 data-[starting-style]/[ending-style] 过渡、任意裸 CSS）：用字符串镜像
// 因此本文件导出 JS 值 + CSS 字符串两份，调用方按场景取，绝不在别处重抄一遍曲线。

// 时长（秒，motion 口径）。CSS 侧用 motionDurationCss。
export const motionDuration = {
  fast: 0.15, // press 反馈等贴身微交互
  base: 0.2, // 进出场、overlay
  slow: 0.3, // 大块转场
  entrance: 0.6, // 首屏逐级揭示 / 滚动入场（比 slow 长：进场动画 500-800ms 才有从容感）
} as const;

// 时长（毫秒字符串，CSS transitionDuration 口径）。
export const motionDurationCss = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
  entrance: "600ms",
} as const;

// 缓动曲线（motion 口径：4 段 cubic-bezier 控制点）。
// 自然减速，禁用 bounce/elastic（见 frontend-design motion 规范：真实物体平滑减速）。
//
// 第三份镜像在 @hulianui/tokens 的 preset.css @theme：那里把同样的曲线灌进 Tailwind 的
// --ease-out / --ease-in-out / --ease-drawer，覆盖内置弱曲线 —— 于是 `ease-out` 工具类
// 与这里的 motionEase.out 是同一条曲线。改任一处必须同步另一处，否则 JS 驱动的动效
// 和工具类驱动的动效手感会分叉。
export const motionEase = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number], // ease-out-expo 风格
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  // iOS 抽屉曲线（源自 Ionic）：起步果断、尾段极长的减速，专供大面积滑入滑出。
  // 与 out 的区别在尾巴——抽屉整屏位移用 out 会显得"到位太急"。
  drawer: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

// 缓动曲线（CSS transitionTimingFunction 口径，与 motionEase 同曲线）。
export const motionEaseCss = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;
