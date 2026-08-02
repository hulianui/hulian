import qrcode from "qrcode-generator";
import type { QRCodeLevel } from "./qrcode.types";

// 二维码编码内核 —— 组件与「出 SVG 字符串 / 转 PNG」共用同一份，避免两处各编一次码。
//
// qrcode-generator 默认 SJIS 字节编码遇中文会抛错 → 全局覆写 stringToBytes 为 UTF-8
// （ASCII 无损·幂等）。这行必须在任何 addData 之前执行，放模块顶层。
qrcode.stringToBytes = (s: string) => Array.from(new TextEncoder().encode(s));

const LEVELS: QRCodeLevel[] = ["L", "M", "Q", "H"];

export interface QRCodeBuildOptions {
  value: string;
  /** @default "M" */
  level?: QRCodeLevel;
  /** 静默区模块数。@default 2 */
  margin?: number;
  /**
   * 版本下限（1–40）。内容变长会让二维码自动升版本 → 模块变密、视觉尺寸跳变；
   * 钉住下限可让一组码密度一致。内容装不下时自动用更大的版本，不会截断。
   */
  minVersion?: number;
  /**
   * 在**不升版本**的前提下自动提升纠错级别（有余量就白拿鲁棒性）。@default true
   */
  boostLevel?: boolean;
}

export interface QRCodeMatrix {
  /** 模块数（不含静默区）。 */
  count: number;
  /** 含静默区的边长（模块数），即 SVG viewBox 尺寸。 */
  total: number;
  /** 暗块合成的单条 path（配 shapeRendering="crispEdges" 出锐边）。 */
  path: string;
  /** 实际采用的纠错级别（boostLevel 可能把它抬高）。 */
  level: QRCodeLevel;
  /** 实际采用的版本号 1–40。 */
  version: number;
}

const versionOf = (moduleCount: number) => (moduleCount - 17) / 4;

// qrcode-generator 的 TypeNumber 是 0|1|…|40 的字面量联合，运行时算出来的版本号是 number，
// 这里在唯一的入口处收口断言，免得每个调用点各写一次。
type TypeNumber = Parameters<typeof qrcode>[0];

function make(value: string, level: QRCodeLevel, typeNumber: number) {
  const qr = qrcode(typeNumber as TypeNumber, level);
  qr.addData(value);
  qr.make();
  return qr;
}

/** 编码 + 铺路径。纯函数，组件、SVG 字符串、PNG 导出共用。 */
export function buildQRCode({
  value,
  level = "M",
  margin = 2,
  minVersion,
  boostLevel = true,
}: QRCodeBuildOptions): QRCodeMatrix {
  // 先用自动版本编一次，拿到「装得下」的最小版本。
  let qr = make(value, level, 0);
  let version = versionOf(qr.getModuleCount());

  // minVersion 只抬不压：低于内容所需的版本无法容纳数据，硬钉会抛。
  if (minVersion && minVersion > version) {
    const target = Math.min(40, Math.floor(minVersion));
    try {
      qr = make(value, level, target);
      version = target;
    } catch {
      /* 理论上更大的版本一定装得下；真抛了就保持自动版本，不让二维码整个渲染不出来 */
    }
  }

  // 版本定了之后，在同一版本内往上试纠错级别：能编出来就说明有余量。
  let used = level;
  if (boostLevel) {
    for (let i = LEVELS.length - 1; i > LEVELS.indexOf(level); i--) {
      try {
        const boosted = make(value, LEVELS[i], version);
        qr = boosted;
        used = LEVELS[i];
        break;
      } catch {
        /* 这一级装不下，继续往低试 */
      }
    }
  }

  const count = qr.getModuleCount();
  const total = count + margin * 2;
  let path = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }
  return { count, total, path, level: used, version: versionOf(count) };
}

export interface QRCodeSvgStringOptions extends QRCodeBuildOptions {
  /** 输出 SVG 的像素边长。@default 160 */
  size?: number;
  /** 暗块颜色。**导出用途必须给具体色**：currentColor 脱离页面就没有可继承的颜色了。@default "#000000" */
  color?: string;
  /** 背景色。@default "#ffffff"（导出的图要能贴进白底文档/海报） */
  background?: string;
}

/**
 * 出一段独立的 SVG 字符串：下载 .svg、贴进邮件/海报、或喂给 qrCodeToPngDataUrl。
 * 与组件同源同内核，两边的码一定一致。
 */
export function qrCodeSvgString(options: QRCodeSvgStringOptions): string {
  const { size = 160, color = "#000000", background = "#ffffff" } = options;
  const { total, path } = buildQRCode(options);
  const bg = background ? `<rect width="${total}" height="${total}" fill="${background}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `${bg}<path d="${path}" fill="${color}"/></svg>`
  );
}
