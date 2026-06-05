"use client";
import { useEffect, useRef, useState } from "react";

/** setup 回调拿到懒加载的 ogl 模块 + helper 本次挂载新建的 canvas，建好场景后返回生命周期钩子。 */
export interface GlHandle {
  /** 每帧调用，t = requestAnimationFrame 时间戳（ms）。 */
  render: (t: number) => void;
  /** 容器尺寸变化时调用（CSS 像素）。 */
  resize?: (width: number, height: number) => void;
  /** 卸载时调用，做 ogl 侧清理（helper 还会兜底 loseContext + 丢弃 canvas）。 */
  dispose?: () => void;
}

export type GlSetup = (ctx: {
  ogl: typeof import("ogl");
  canvas: HTMLCanvasElement;
}) => GlHandle | Promise<GlHandle>;

/**
 * 瑚琏 WebGL 件共享生命周期帮手：
 * ① 懒 `import("ogl")`（代码分割，base bundle 不含，非 WebGL 用户零成本）
 * ② SSR 安全（仅客户端 effect 内建 GL）
 * ③ **每次挂载新建一个 canvas 并挂进 ref 容器** —— 关键：避免复用被 loseContext 毒化的 canvas。
 *    React StrictMode（dev 双挂载）/ 任意 remount 会先 cleanup 再 mount，若复用同一 canvas，
 *    上一轮 cleanup 的 `loseContext()` 已让该 canvas 的 context 永久丢失（一个 canvas 终生只能有
 *    一个 context），下一轮 `new Renderer({canvas})` 拿到的就是死 context → program 链接失败 →
 *    `Program.use` 读 undefined.uniformLocations 崩。新建 canvas 彻底规避。
 * ④ RAF 循环（先排下一帧再渲染，单帧抛错不杀循环）+ render try/catch（持续失败即停渲染，不崩页面）
 * ⑤ IntersectionObserver 离屏暂停 + ResizeObserver 自适应
 * ⑥ 卸载：dispose() + loseContext() 兜底 + 移除 canvas
 * ⑦ reduced-motion → 返回 reduced=true，调用方渲染静态 fallback
 *
 * 返回 { ref, reduced }：**ref 挂到一个容器 `<div>`**（不是 canvas）；reduced 为真时渲染 fallback。
 */
export function useGlCanvas(setup: GlSetup, deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  // 初次客户端探测 reduced-motion（避免 SSR mismatch：服务端恒 false）。
  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  useEffect(() => {
    if (reduced) return; // 降级：调用方渲染静态 fallback，不建 GL
    const container = ref.current;
    if (!container) return;

    // 本次挂载专属的全新 canvas —— 不复用、不被上一轮 loseContext 毒化。
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    let raf = 0;
    let disposed = false;
    let visible = true;
    let errored = false;
    let handle: GlHandle | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;

    (async () => {
      let ogl: typeof import("ogl");
      try {
        ogl = await import("ogl");
      } catch {
        return; // ogl 加载失败（极少）→ 静默，容器留空
      }
      if (disposed) return;
      try {
        handle = await setup({ ogl, canvas });
      } catch {
        return; // 无 WebGL context / 建场景失败 → 静默降级
      }
      if (disposed || !handle) {
        handle?.dispose?.();
        return;
      }
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop); // 先排下一帧：单帧抛错不杀循环
        if (!visible || errored) return;
        try {
          handle!.render(t);
        } catch {
          errored = true; // 渲染持续抛错 → 停止渲染，但不崩页面
        }
      };
      raf = requestAnimationFrame(loop);

      ro = new ResizeObserver(() => {
        handle?.resize?.(container.clientWidth, container.clientHeight);
      });
      ro.observe(container);

      io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      });
      io.observe(container);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      handle?.dispose?.();
      // 兜底释放 GL context（即便 dispose 没处理），随后丢弃 canvas —— 下次挂载全新创建。
      const gl =
        (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
        (canvas.getContext("webgl") as WebGLRenderingContext | null);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);

  return { ref, reduced };
}
