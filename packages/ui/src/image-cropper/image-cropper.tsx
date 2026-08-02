"use client";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "../button";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { Slider } from "../slider";
import type { CropArea, CropOutputOptions, ImageCropperProps } from "./image-cropper.types";

// 图片裁剪器：react-easy-crop（MIT·内置触屏双指捏合缩放/拖拽对位/滚轮缩放）+ 库内 Button/Slider chrome。
// 典型场景：证件照固定 5:7 裁剪。组件只管「框选 → 出 Blob」，存储/上传由消费者接管。
// 画布底色用 token 无关的纯黑：照片裁剪的行业惯例底（与 Dialog backdrop bg-black/40 同一豁免类）。

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 同源/blob/data 源不受影响；远程源尽力申请 CORS 以免画布污染
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas 导出失败"))), type, quality);
  });
}

/** 按裁剪区域绘制目标尺寸位图并编码；超 maxBytes 降质（×0.72，下限 0.5）重试一次。 */
export async function cropImageToBlob(
  image: string,
  area: CropArea,
  options: CropOutputOptions,
): Promise<Blob> {
  const img = await loadImageElement(image);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(options.width));
  canvas.height = Math.max(1, Math.round(options.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d 不可用");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const type = options.type ?? "image/jpeg";
  const quality = options.quality ?? 0.9;
  let blob = await canvasToBlob(canvas, type, quality);
  if (options.maxBytes != null && blob.size > options.maxBytes) {
    blob = await canvasToBlob(canvas, type, Math.max(0.5, quality * 0.72));
  }
  return blob;
}

export function ImageCropper({
  image,
  aspect = 5 / 7,
  outputWidth = 413,
  outputType = "image/jpeg",
  quality = 0.9,
  maxBytes,
  maxZoom = 3,
  onCropped,
  onCancel,
  onError,
  confirmLabel,
  cancelLabel,
  cropAreaClassName,
  className,
}: ImageCropperProps) {
  const locale = useComponentLocale().imageCropper ?? {
    confirm: "确认",
    cancel: "取消",
    zoom: "缩放",
  };
  const resolvedConfirmLabel = confirmLabel ?? locale.confirm;
  const resolvedCancelLabel = cancelLabel ?? locale.cancel;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<CropArea | null>(null);
  const [exporting, setExporting] = useState(false);

  const onCropComplete = useCallback((_area: CropArea, pixels: CropArea) => {
    setAreaPixels(pixels);
  }, []);

  const confirm = async () => {
    if (!areaPixels || exporting) return;
    setExporting(true);
    try {
      const blob = await cropImageToBlob(image, areaPixels, {
        width: outputWidth,
        height: Math.round(outputWidth / aspect),
        type: outputType,
        quality,
        maxBytes,
      });
      onCropped(blob);
    } catch (e) {
      onError?.(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 裁剪画布：react-easy-crop 要求定位上下文 + 显式高度；touch-none 防移动端拖动时带滚页面 */}
      <div
        className={cn(
          "relative h-64 w-full touch-none overflow-hidden rounded-[var(--radius)] bg-black sm:h-80",
          cropAreaClassName,
        )}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          maxZoom={maxZoom}
          aspect={aspect}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>
      {/* 缩放滑杆（触屏双指捏合等价的桌面/单指降级） */}
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5 17 17M7 9h4" strokeLinecap="round" />
        </svg>
        <Slider
          aria-label={locale.zoom}
          min={1}
          max={maxZoom}
          step={0.01}
          value={zoom}
          onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
        />
        <svg
          viewBox="0 0 20 20"
          className="size-4 shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M13.5 13.5 17 17M7 9h4M9 7v4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={exporting}>
            {resolvedCancelLabel}
          </Button>
        )}
        <Button onClick={confirm} loading={exporting} disabled={!areaPixels}>
          {resolvedConfirmLabel}
        </Button>
      </div>
    </div>
  );
}
