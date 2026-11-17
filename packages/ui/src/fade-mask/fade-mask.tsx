import { cn } from "../lib/cn";
import type { FadeMaskProps } from "./fade-mask.types";

// 渐隐遮罩：把子内容在某一边（或从中心向四周）淡出到透明。
// 出血裁切的展示墙底部淡出、点阵 / 网格纹理的中心聚光、横向滚动条两端的淡出都是它。
// 用 CSS mask 而不是叠一层底色渐变：遮罩不关心下面是什么颜色，放在任何底上都对；
// 叠色渐变要和底色一致，换个底（卡片、暗色段落）就露馅。纯 div，可 RSC。
const LINEAR_TO = { top: "to top", bottom: "to bottom", left: "to left", right: "to right" } as const;

export function FadeMask({
  direction = "bottom",
  start,
  at = "50% 50%",
  size = "50% 50%",
  className,
  style,
  children,
  ...rest
}: FadeMaskProps) {
  const image =
    direction === "radial"
      ? `radial-gradient(${size} at ${at}, black ${start ?? "0%"}, transparent)`
      : `linear-gradient(${LINEAR_TO[direction]}, black ${start ?? "60%"}, transparent)`;
  return (
    <div
      className={cn(className)}
      style={{ maskImage: image, WebkitMaskImage: image, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
