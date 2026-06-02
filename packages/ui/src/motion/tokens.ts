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
} as const;

// 时长（毫秒字符串，CSS transitionDuration 口径）。
export const motionDurationCss = {
  fast: "150ms",
  base: "200ms",
  slow: "300ms",
} as const;

// 缓动曲线（motion 口径：4 段 cubic-bezier 控制点）。
// 自然减速，禁用 bounce/elastic（见 frontend-design motion 规范：真实物体平滑减速）。
export const motionEase = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number], // ease-out-expo 风格
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
};

// 缓动曲线（CSS transitionTimingFunction 口径，与 motionEase 同曲线）。
export const motionEaseCss = {
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;
