"use client";
import { useState, type CSSProperties } from "react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { Segmented } from "../segmented";
import type { ViewportDevice, ViewportProps } from "./viewport.types";

// 响应式容器（"use client"）：内部建立一个「容器查询上下文」(`@container` = container-type: inline-size)，
// 内部组件用 Tailwind `@sm/@md/@5xl:` 等容器变体即可按【容器自身宽度】自适应，而非页面视口宽度——
// 同一套布局在 web / 平板 / 手机 预设宽度下自动重排（容器越宽越展开）。可选顶部设备切换器(dogfood Segmented)。
// device 预设宽度（定值·配 maxWidth:100% → 实际取 min(预设, 父可用宽)）：父够宽即设备宽，父窄则截到父宽并重排。
// 用「确定宽度」而非 width:100%/max-width：后者在收缩型 flex 容器(如画廊格子)里会塌成内容 min-content。
// web 取 1280(常见 web 容器上限·父窄自动截) / tablet=768 / phone=390；width 可覆盖为任意值。
const PRESET: Record<ViewportDevice, string> = {
  web: "1280px",
  tablet: "768px",
  phone: "390px",
};

const toCss = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

export function Viewport({
  device,
  defaultDevice = "web",
  onDeviceChange,
  controls = false,
  width,
  name,
  framed = true,
  height,
  children,
  className,
}: ViewportProps) {
  const copy = useComponentLocale().viewport ?? zhCN.components!.viewport!;
  const deviceItems = [
    { value: "web", label: "Web" },
    { value: "tablet", label: copy.tablet },
    { value: "phone", label: copy.phone },
  ];
  const [internal, setInternal] = useState<ViewportDevice>(defaultDevice);
  const current = device ?? internal;

  const setDevice = (d: ViewportDevice) => {
    if (device === undefined) setInternal(d);
    onDeviceChange?.(d);
  };

  const style: CSSProperties = {
    width: width != null ? toCss(width) : PRESET[current],
    maxWidth: "100%",
    height: height != null ? toCss(height) : undefined,
    ...(name ? { containerName: name } : {}),
  };
  const deviceFramed = framed && current !== "web";

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      {controls && (
        <Segmented
          aria-label={copy.devicePresets}
          size="sm"
          items={deviceItems}
          value={current}
          onValueChange={(v) => setDevice(v as ViewportDevice)}
        />
      )}
      <div
        data-device={current}
        style={style}
        className={cn(
          "@container overflow-hidden bg-surface transition-[width] duration-300 ease-out motion-reduce:transition-none",
          deviceFramed
            ? "rounded-[1.75rem] border-[6px] border-foreground/10 shadow-lg"
            : "rounded-[var(--radius)] border border-border",
        )}
      >
        {children}
      </div>
    </div>
  );
}
