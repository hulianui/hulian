import { qrCodeSvgString, type QRCodeSvgStringOptions } from "./qrcode-core";

// 「二维码怎么下载成 PNG」是每个消费方都要重写一遍的一段：序列化 SVG → 转 data URI →
// 塞进 Image 解码 → 画进 canvas → toDataURL。中间三处坑（下面注释里）值得收进库里一次写对。

export interface QRCodePngOptions extends QRCodeSvgStringOptions {
  /** 输出像素边长（会按 devicePixelRatio 再放大一档，打印/高分屏不糊）。@default 512 */
  pixelSize?: number;
  /** 设备像素比，默认取 window.devicePixelRatio（上限 3）。 */
  scale?: number;
}

/**
 * 出一张 PNG 的 data URL（浏览器端）。
 * 服务端/Node 环境没有 canvas，请改用 `qrCodeSvgString` 直接给 SVG。
 */
export function qrCodeToPngDataUrl(options: QRCodePngOptions): Promise<string> {
  const { pixelSize = 512, scale, ...rest } = options;
  const dpr = scale ?? (typeof window !== "undefined" ? Math.min(3, window.devicePixelRatio || 1) : 1);
  const px = Math.round(pixelSize * dpr);
  // 背景默认给白：PNG 没有「继承页面底色」这回事，透明底打印/贴进白底文档会变成黑块糊成一片。
  const svg = qrCodeSvgString({ ...rest, size: px, background: rest.background ?? "#ffffff" });

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("qrCodeToPngDataUrl 需要浏览器环境（服务端请用 qrCodeSvgString）"));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = px;
      canvas.height = px;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("无法获取 2d 上下文"));
        return;
      }
      ctx.drawImage(img, 0, 0, px, px);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("SVG 解码失败"));
    // 用 encodeURIComponent 而不是 btoa：btoa 遇非 Latin-1 字符（中文 logo 说明、带中文的 title）直接抛。
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
