"use client";

/**
 * 内联图标集 —— 瑚琏 UI 库自身结构性图标的单一来源。
 *
 * 这些 SVG path 数据原样取自 lucide-react v1.17.0（ISC License），
 * 内联到库内以消除对 lucide-react 的运行时依赖：消费者安装 @hulian/ui
 * 时不再被迫拉入一个图标库，组件外观也不受 lucide 升级影响。
 *
 * 仅收录组件运行时真正需要的图标。装饰性 / 演示用图标请在 showcase 里
 * 直接用 lucide-react（已降为 devDependency）。
 *
 * 新增图标：从 node_modules/lucide-react/dist/esm/icons/<kebab>.mjs 复制
 * 其 __iconNode 数组，按下方格式追加一个具名导出即可。
 */

import * as React from "react";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  /** 图标尺寸（同时设置 width/height，默认 24；通常由 className 如 `size-4` 覆盖） */
  size?: number | string;
}

type IconNode = ReadonlyArray<readonly [tag: string, attrs: Record<string, string | number>]>;

export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

const createIcon = (name: string, node: IconNode): IconComponent => {
  const Comp = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
    { size = 24, strokeWidth = 2, className, children, ...rest },
    ref,
  ) {
    // 与 lucide 行为一致：无 a11y 属性时默认 aria-hidden（装饰性图标）
    const a11y =
      "aria-label" in rest || "aria-labelledby" in rest ? {} : { "aria-hidden": true as const };
    return React.createElement(
      "svg",
      {
        ref,
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className: ["lucide", `lucide-${name}`, className].filter(Boolean).join(" "),
        ...a11y,
        ...rest,
      },
      ...node.map(([tag, attrs]) => React.createElement(tag, attrs)),
      children,
    );
  });
  Comp.displayName = name;
  return Comp;
};

export const ArrowLeft = createIcon("arrow-left", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }],
]);

export const ArrowUp = createIcon("arrow-up", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }],
]);

export const Calendar = createIcon("calendar", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
]);

export const Check = createIcon("check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);

export const ChevronDown = createIcon("chevron-down", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }],
]);

export const ChevronLeft = createIcon("chevron-left", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }],
]);

export const ChevronRight = createIcon("chevron-right", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }],
]);

export const ChevronsLeft = createIcon("chevrons-left", [
  ["path", { d: "m11 17-5-5 5-5", key: "13zhaf" }],
  ["path", { d: "m18 17-5-5 5-5", key: "h8a8et" }],
]);

export const ChevronsRight = createIcon("chevrons-right", [
  ["path", { d: "m6 17 5-5-5-5", key: "xnjwq" }],
  ["path", { d: "m13 17 5-5-5-5", key: "17xmmf" }],
]);

export const ChevronsUpDown = createIcon("chevrons-up-down", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }],
]);

export const ChevronUp = createIcon("chevron-up", [
  ["path", { d: "m18 15-6-6-6 6", key: "153udz" }],
]);

export const CircleCheck = createIcon("circle-check", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }],
]);

export const CircleHelp = createIcon("circle-help", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }],
]);

export const CircleX = createIcon("circle-x", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }],
]);

export const Copy = createIcon("copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }],
]);

export const ExternalLink = createIcon("external-link", [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }],
]);

export const Info = createIcon("info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }],
]);

export const Loader2 = createIcon("loader-2", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }],
]);

export const Menu = createIcon("menu", [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }],
]);

export const Minus = createIcon("minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);

export const Moon = createIcon("moon", [
  [
    "path",
    {
      d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
      key: "kfwtm",
    },
  ],
]);

export const Play = createIcon("play", [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1",
    },
  ],
]);

export const Plus = createIcon("plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }],
]);

export const Search = createIcon("search", [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
]);

export const Sun = createIcon("sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }],
]);

export const TrendingDown = createIcon("trending-down", [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }],
]);

export const TrendingUp = createIcon("trending-up", [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }],
]);

export const TriangleAlert = createIcon("triangle-alert", [
  ["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", key: "wmoenq" }],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }],
]);

export const X = createIcon("x", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
]);
