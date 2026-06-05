import qrcode from "qrcode-generator";
import { cn } from "../lib/cn";
import type { QRCodeProps } from "./qrcode.types";

// 二维码（可 RSC·编码内核 qrcode-generator·瑚琏自渲 SVG）：暗块合成单 path（crispEdges 锐边），
// 颜色默认继承 currentColor 吃主题；可选中心 logo（自动垫底色块抠空）。
// qrcode-generator 默认 SJIS 字节编码遇中文会抛错 → 全局覆写 stringToBytes 为 UTF-8（ASCII 无损·幂等）。
qrcode.stringToBytes = (s: string) => Array.from(new TextEncoder().encode(s));

export function QRCode({
  value,
  size = 160,
  level = "M",
  margin = 2,
  color,
  background,
  logo,
  "aria-label": ariaLabel,
  className,
}: QRCodeProps) {
  const qr = qrcode(0, level);
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const total = count + margin * 2;

  let path = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }

  const logoUnits = logo ? ((logo.size ?? Math.round(size * 0.22)) / size) * total : 0;
  const logoXY = (total - logoUnits) / 2;

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
          <rect
            x={logoXY - 0.4}
            y={logoXY - 0.4}
            width={logoUnits + 0.8}
            height={logoUnits + 0.8}
            rx={0.4}
            fill={background ?? "#ffffff"}
          />
          <image
            href={logo.src}
            x={logoXY}
            y={logoXY}
            width={logoUnits}
            height={logoUnits}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      )}
    </svg>
  );
}
