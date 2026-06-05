"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ASCIITextProps } from "./ascii-text.types";

// 吸取自 React Bits ASCIIText：把文字渲染成 ASCII 字符画 —— 逐像素采样亮度映射到字符坡道，
// 叠加正弦波动位移 + 鼠标驱动的 hue-rotate 色相旋转。
// 瑚琏化：
// 1. 去 three.js / WebGL —— 原作用 PlaneGeometry + ShaderMaterial 投影文字再 asciify，
//    这里改用纯 canvas2d 离屏采样 + requestAnimationFrame 逐帧重排字符，零运行时依赖。
// 2. 波动从顶点着色器搬到 JS：每行字符按 sin(time + 行号) 做整数列偏移，营造飘动。
// 3. 颜色吃 token（textColor 默认 var(--color-foreground)），明暗主题自适配，无写死 hex。
// 4. reduced-motion：useReducedMotion 仍渲染完整字符画（DOM 不变），只冻结波动/色相动画。
// 5. RSC 不安全（用 ref/effect/canvas）→ "use client"；jsdom 下 getContext 可能为 null，已 guard。

const DEFAULT_CHARSET = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export function ASCIIText({
  text = "瑚琏",
  asciiFontSize = 8,
  textFontSize = 160,
  textColor = "var(--color-foreground)",
  enableWaves = true,
  enableHue = true,
  charset = DEFAULT_CHARSET,
  className,
  style,
}: ASCIITextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const reduce = useReducedMotion();

  // 用 ref 锁住最新 props，避免 effect 反复重启 RAF（稳定 handlers + latest ref 模式）。
  const optsRef = useRef({ text, textFontSize, textColor, enableWaves, enableHue, charset, reduce });
  optsRef.current = { text, textFontSize, textColor, enableWaves, enableHue, charset, reduce };

  useEffect(() => {
    const root = rootRef.current;
    const pre = preRef.current;
    if (!root || !pre) return;

    // 离屏 canvas 渲染源文本；jsdom 下 getContext 返回 null → 直接放弃绘制（保留空 pre）。
    const srcCanvas = document.createElement("canvas");
    const sampleCanvas = document.createElement("canvas");
    const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!srcCtx || !sampleCtx) return;

    // hue 平滑跟随的当前角度（指针相对中心）。
    let deg = 0;
    const center = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    // 把源文本画到 srcCanvas，得到位图，供采样。
    const drawSource = () => {
      const { text: t, textFontSize: fs, textColor: color } = optsRef.current;
      const font = `600 ${fs}px 'IBM Plex Mono', ui-monospace, monospace`;
      srcCtx.font = font;
      const metrics = srcCtx.measureText(t);
      const ascent = metrics.actualBoundingBoxAscent || fs * 0.8;
      const descent = metrics.actualBoundingBoxDescent || fs * 0.2;
      const w = Math.max(1, Math.ceil(metrics.width) + 20);
      const h = Math.max(1, Math.ceil(ascent + descent) + 20);
      srcCanvas.width = w;
      srcCanvas.height = h;
      // 重设尺寸会清空 context font，需重设。
      srcCtx.font = font;
      srcCtx.clearRect(0, 0, w, h);
      // 颜色用 var(--color-*) 时 canvas 无法解析 → 读取真实 computed 值兜底。
      let fill = color;
      if (color.includes("var(")) {
        const probe = getComputedStyle(root).color;
        fill = probe || "#fff";
      }
      srcCtx.fillStyle = fill;
      srcCtx.textBaseline = "alphabetic";
      srcCtx.fillText(t, 10, 10 + ascent);
      return { w, h };
    };

    let cols = 0;
    let rows = 0;

    // 根据 asciiFontSize 计算字符网格列/行，并把源位图缩绘到 sampleCanvas（每像素 = 一字符）。
    const layout = () => {
      const { w, h } = drawSource();
      const rootRect = root.getBoundingClientRect();
      const charW = asciiFontSize * 0.6; // 等宽字符近似单元宽
      const charH = asciiFontSize; //                     单元高
      // 列数 = 容器可容纳的字符数（无布局尺寸时回退到源宽推算）。
      const fallbackCols = Math.round(w / charW);
      const maxCols = Math.floor((rootRect.width || 0) / charW);
      cols = Math.max(8, maxCols > 0 ? maxCols : fallbackCols);
      // 保持源宽高比：网格物理宽高 cols·charW / rows·charH = w / h
      // → rows = cols · charW · h / (charH · w)
      rows = Math.max(1, Math.round((cols * charW * h) / (charH * w)));
      // 收敛上限，防止 0 宽容器或超长文本爆内存。
      cols = Math.min(cols, 240);
      rows = Math.min(rows, 160);
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;
      sampleCtx.imageSmoothingEnabled = false;
      sampleCtx.clearRect(0, 0, cols, rows);
      sampleCtx.drawImage(srcCanvas, 0, 0, w, h, 0, 0, cols, rows);
      center.x = rootRect.width / 2;
      center.y = rootRect.height / 2;
    };

    let raf = 0;
    let start = 0;

    const asciify = (time: number) => {
      if (!cols || !rows) return;
      const { enableWaves: waves, charset: cs, reduce: rm } = optsRef.current;
      let data: Uint8ClampedArray;
      try {
        data = sampleCtx.getImageData(0, 0, cols, rows).data;
      } catch {
        return; // 跨域/jsdom 安全兜底
      }
      const t = time * 0.005;
      const len = cs.length;
      let out = "";
      for (let y = 0; y < rows; y++) {
        // 波动：整行按 sin 相位做列偏移（reduced-motion / 关闭波动时为 0）。
        const shift =
          waves && !rm ? Math.round(Math.sin(t + y * 0.5) * 2) : 0;
        for (let x = 0; x < cols; x++) {
          const sx = x - shift;
          if (sx < 0 || sx >= cols) {
            out += " ";
            continue;
          }
          const i = (sx + y * cols) * 4;
          const a = data[i + 3]!;
          if (a === 0) {
            out += " ";
            continue;
          }
          const r = data[i]!;
          const g = data[i + 1]!;
          const b = data[i + 2]!;
          const gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          // 亮度越高 → ramp 越靠后（越"实"），乘以 alpha 让边缘渐隐。
          let idx = Math.floor(gray * (a / 255) * (len - 1));
          if (idx < 0) idx = 0;
          if (idx >= len) idx = len - 1;
          out += cs[idx];
        }
        out += "\n";
      }
      pre.textContent = out;
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const { enableHue: hue, reduce: rm } = optsRef.current;
      asciify(now - start);
      if (hue && !rm) {
        const dx = mouse.x - center.x;
        const dy = mouse.y - center.y;
        const target = (Math.atan2(dy, dx) * 180) / Math.PI;
        deg += (target - deg) * 0.075;
        pre.style.filter = `hue-rotate(${deg.toFixed(1)}deg)`;
      } else {
        pre.style.filter = "";
      }
      raf = requestAnimationFrame(tick);
    };

    layout();
    asciify(0); // 首帧立即出图（即便 RAF 在测试环境不跑）
    raf = requestAnimationFrame(tick);

    // 容器尺寸变化时重排。
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => layout())
        : null;
    ro?.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      ro?.disconnect();
    };
    // asciiFontSize 变化需重建网格 → 进依赖；其余 props 走 latest ref。
  }, [asciiFontSize]);

  return (
    <div
      ref={rootRef}
      aria-label={text}
      role="img"
      className={cn(
        "relative h-full w-full overflow-hidden bg-surface text-foreground",
        className,
      )}
      style={style}
    >
      <pre
        ref={preRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 m-0 p-0 select-none",
          "font-mono leading-none tracking-[0] text-foreground",
          "motion-reduce:[filter:none]",
        )}
        style={
          {
            fontSize: `${asciiFontSize}px`,
            lineHeight: 1,
          } as CSSProperties
        }
      />
    </div>
  );
}
