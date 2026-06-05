import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { OrbitImagesProps, OrbitShape } from "./orbit-images.types";

// 吸取自 React Bits OrbitImages：用 CSS offset-path（运动路径）把若干子项挂在一条
// 生成的 SVG 路径上，沿轨道（椭圆/圆/星/心/无穷/波浪…）匀速环绕流转，可等距铺满
// 或鱼贯出发，整条轨道可倾斜、中心可叠静态内容。
//
// 瑚琏化要点：
// 1. 去 motion/react 依赖——原版用 useMotionValue + animate 跑 JS 插值驱动 offsetDistance，
//    这里改为纯 CSS @keyframes hulian-orbit-images（0%→100% 扫 offset-distance），
//    fill 分布靠负 animation-delay（index/total × duration）错峰，零运行时、RSC 安全（无 "use client"）。
// 2. 路径几何函数照搬原版（椭圆/圆/方/矩/三角/星/心/无穷/波浪），坐标基于 baseWidth 方画布，
//    容器用 CSS scale 等比铺满父级宽度（aspect-ratio 1/1），无需 ResizeObserver。
// 3. 颜色吃 token——轨道描边默认 var(--color-border) 随主题明暗，替原版写死 rgba(0,0,0,0.1)。
// 4. reduced-motion：motion-reduce:[animation:none] 冻结在初始分布（DOM 两态一致，子项不消失）。
// 5. 关键帧 hulian-orbit-images 落 preset.css。

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

function squarePath(cx: number, cy: number, size: number): string {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
}

function rectanglePath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
}

function trianglePath(cx: number, cy: number, size: number): string {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
}

function starPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number,
): string {
  const step = Math.PI / points;
  let path = "";
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path + " Z";
}

function heartPath(cx: number, cy: number, size: number): string {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
}

function infinityPath(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
}

function wavePath(
  cx: number,
  cy: number,
  w: number,
  amplitude: number,
  waves: number,
): string {
  const pts: string[] = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    const y = cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    const y = cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude;
    pts.push(`L ${x} ${y}`);
  }
  return pts.join(" ") + " Z";
}

function buildPath(
  shape: OrbitShape,
  customPath: string | undefined,
  cx: number,
  cy: number,
  radiusX: number,
  radiusY: number,
  radius: number,
  starPoints: number,
  starInnerRatio: number,
): string {
  switch (shape) {
    case "circle":
      return ellipsePath(cx, cy, radius, radius);
    case "ellipse":
      return ellipsePath(cx, cy, radiusX, radiusY);
    case "square":
      return squarePath(cx, cy, radius * 2);
    case "rectangle":
      return rectanglePath(cx, cy, radiusX * 2, radiusY * 2);
    case "triangle":
      return trianglePath(cx, cy, radius * 2);
    case "star":
      return starPath(cx, cy, radius, radius * starInnerRatio, starPoints);
    case "heart":
      return heartPath(cx, cy, radius * 2);
    case "infinity":
      return infinityPath(cx, cy, radiusX * 2, radiusY * 2);
    case "wave":
      return wavePath(cx, cy, radiusX * 2, radiusY, 3);
    case "custom":
      return customPath || ellipsePath(cx, cy, radius, radius);
    default:
      return ellipsePath(cx, cy, radiusX, radiusY);
  }
}

export function OrbitImages({
  items,
  shape = "ellipse",
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = "normal",
  fill = true,
  showPath = false,
  pathColor = "var(--color-border)",
  pathWidth = 2,
  centerContent,
  className,
  style,
}: OrbitImagesProps) {
  const center = baseWidth / 2;
  const path = buildPath(
    shape,
    customPath,
    center,
    center,
    radiusX,
    radiusY,
    radius,
    starPoints,
    starInnerRatio,
  );

  const total = items.length;
  const animDirection = direction === "reverse" ? "reverse" : "normal";

  return (
    <div
      aria-hidden
      className={cn("relative mx-auto aspect-square w-full", className)}
      style={style}
    >
      {/* 缩放层：把 baseWidth 设计画布等比铺满容器（无需 ResizeObserver） */}
      <div className="absolute inset-0">
        {/* 旋转层：整条轨道倾斜 rotation 度 */}
        <div
          className="absolute inset-0 origin-center"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {showPath && (
            <svg
              className="pointer-events-none absolute inset-0"
              width="100%"
              height="100%"
              viewBox={`0 0 ${baseWidth} ${baseWidth}`}
            >
              <path
                d={path}
                fill="none"
                stroke={pathColor}
                strokeWidth={pathWidth}
              />
            </svg>
          )}

          {items.map((item, index) => {
            // fill：用「负延迟」把每个子项错峰到路径不同百分比位置（index/total 圈）。
            const delaySec = fill ? -(index / total) * duration : 0;
            const itemStyle: CSSProperties = {
              width: itemSize,
              height: itemSize,
              // baseWidth 设计坐标 → 容器百分比：子项中心锚定在路径起点
              left: `calc(${(center / baseWidth) * 100}% - ${itemSize / 2}px)`,
              top: `calc(${(center / baseWidth) * 100}% - ${itemSize / 2}px)`,
              offsetPath: `path("${path}")`,
              offsetAnchor: "center center",
              animationDuration: `${duration}s`,
              animationDirection: animDirection,
              animationDelay: `${delaySec}s`,
              // offsetRotate 不在部分 csstype 版本的强类型表里，用自定义属性式写法注入。
              ["offsetRotate" as string]: "0deg",
            } as CSSProperties;
            return (
              <div
                key={index}
                className={cn(
                  "absolute select-none will-change-[offset-distance]",
                  "[animation:hulian-orbit-images_linear_infinite] motion-reduce:[animation:none]",
                )}
                style={itemStyle}
              >
                {/* 反向自转，抵消轨道倾斜，让子项保持正立 */}
                <div
                  className="h-full w-full"
                  style={{ transform: `rotate(${-rotation}deg)` }}
                >
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {centerContent != null && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {centerContent}
        </div>
      )}
    </div>
  );
}
