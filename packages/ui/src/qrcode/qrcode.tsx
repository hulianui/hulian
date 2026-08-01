import { cn } from "../lib/cn";
import { buildQRCode } from "./qrcode-core";
import type { QRCodeProps } from "./qrcode.types";

// 二维码（可 RSC·编码内核 qrcode-generator·瑚琏自渲 SVG）：暗块合成单 path（crispEdges 锐边），
// 颜色默认继承 currentColor 吃主题（区别 qrcode.react 写死 #000/#FFF，暗色下要自己改两个色）；
// 可选中心 logo（默认垫底色块抠空）。编码在 qrcode-core 里，与「出 SVG 串 / 转 PNG」共用同一份。

export function QRCode({
  value,
  size = 160,
  level = "M",
  margin = 2,
  minVersion,
  boostLevel = true,
  color,
  background,
  logo,
  "aria-label": ariaLabel,
  className,
}: QRCodeProps) {
  const { total, path } = buildQRCode({ value, level, margin, minVersion, boostLevel });

  const logoUnits = logo ? ((logo.size ?? Math.round(size * 0.22)) / size) * total : 0;
  const logoXY = (total - logoUnits) / 2;
  const excavate = logo?.excavate ?? true;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      role="img"
      aria-label={ariaLabel ?? value}
      shapeRendering="crispEdges"
      className={cn("text-foreground", className)}
    >
      {background && <rect width={total} height={total} fill={background} />}
      <path d={path} fill={color ?? "currentColor"} />
      {logo && (
        <>
          {excavate && (
            <rect
              x={logoXY - 0.4}
              y={logoXY - 0.4}
              width={logoUnits + 0.8}
              height={logoUnits + 0.8}
              rx={0.4}
              fill={background ?? "#ffffff"}
            />
          )}
          <image
            href={logo.src}
            x={logoXY}
            y={logoXY}
            width={logoUnits}
            height={logoUnits}
            opacity={logo.opacity}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      )}
    </svg>
  );
}
