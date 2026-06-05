"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { AntigravityProps } from "./antigravity.types";

// 吸取自 React Bits Antigravity：一片漂浮粒子，光标靠近时被"反重力"吸入环绕光标的
// 轨道，沿环做正弦波动 + 脉冲缩放 + 朝向光标的取向，离开磁吸半径后缓缓漂回原位。
//
// 瑚琏化要点：
// 1. 去依赖：原作基于 three.js + @react-three/fiber 的 instancedMesh（禁用包）。
//    本实现用 canvas2d 重写同一套粒子物理（磁吸 / 环绕 / 波动 / 脉冲 / lerp 回位），
//    零运行时新依赖，bundle 更轻，无 WebGL context 上限顾虑。
// 2. token：默认 color 吃 --color-chart-1，运行时把 CSS 变量解析为真实色值喂给 canvas
//    fillStyle（getComputedStyle 取 --color-chart-1，自动明暗适配）。
// 3. reduced-motion / 无 canvas2d：渲染静态点阵 fallback（吃 chart token），DOM 不卸载内容。
// 4. StrictMode 安全：每次挂载在容器内新建 canvas，卸载时移除；RAF 先排下一帧再渲染，
//    单帧抛错不杀循环；离屏 IntersectionObserver 暂停、ResizeObserver 自适应。
// 5. 运行时 prop 通过 ref 同步给 RAF 闭包，避免每次改参都重建 canvas。
// 6. 根容器 aria-hidden（纯装饰），className/style 透传。

interface Particle {
  hx: number; // 家位 x（漂浮原点）
  hy: number;
  cx: number; // 当前 x
  cy: number;
  t: number; // 个体相位
  speed: number;
  offset: number; // 环半径随机偏移
}

const TWO_PI = Math.PI * 2;

/** 把 "var(--color-chart-1)" 解析为可用于 canvas 的真实色值；非 var() 原样返回。 */
function resolveColor(raw: string, el: HTMLElement): string {
  const m = /^var\((--[\w-]+)\)$/.exec(raw.trim());
  if (!m) return raw;
  const v = getComputedStyle(el).getPropertyValue(m[1]).trim();
  return v || "#7c5cff";
}

export function Antigravity({
  count = 240,
  magnetRadius = 130,
  ringRadius = 56,
  waveSpeed = 0.4,
  waveAmplitude = 10,
  particleSize = 4,
  lerpSpeed = 0.12,
  color = "var(--color-chart-1)",
  autoAnimate = false,
  rotationSpeed = 0,
  pulseSpeed = 3,
  shape = "bar",
  className,
  fallback,
}: AntigravityProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  // 运行时参数挂 ref，供 RAF 闭包读取最新值（不触发 canvas 重建）。
  const cfg = useRef({
    count,
    magnetRadius,
    ringRadius,
    waveSpeed,
    waveAmplitude,
    particleSize,
    lerpSpeed,
    color,
    autoAnimate,
    rotationSpeed,
    pulseSpeed,
    shape,
  });
  cfg.current = {
    count,
    magnetRadius,
    ringRadius,
    waveSpeed,
    waveAmplitude,
    particleSize,
    lerpSpeed,
    color,
    autoAnimate,
    rotationSpeed,
    pulseSpeed,
    shape,
  };

  // SSR 安全：初次客户端探测 reduced-motion。
  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      // jsdom 的 getContext 会抛 "Not implemented"；其余环境无 canvas2d 时返回 null。
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) {
      // 无 canvas2d：静默移除 canvas，留空容器（fallback 已在另一分支）。
      canvas.remove();
      return;
    }
    const c2d = ctx; // 收窄为非空，供闭包使用

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = host.clientWidth || 1;
    let h = host.clientHeight || 1;

    const particles: Particle[] = [];
    const seed = () => {
      particles.length = 0;
      const n = Math.max(1, Math.floor(cfg.current.count));
      for (let i = 0; i < n; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        particles.push({
          hx: x,
          hy: y,
          cx: x,
          cy: y,
          t: Math.random() * 100,
          speed: 0.01 + Math.random() / 200,
          offset: (Math.random() - 0.5) * 2,
        });
      }
    };

    const setSize = (nw: number, nh: number) => {
      w = Math.max(1, nw);
      h = Math.max(1, nh);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize(w, h);
    seed();

    // 指针目标（虚拟光标，缓动跟随真实指针；离开后停在最后位置）。
    let pointerX = -9999;
    let pointerY = -9999;
    let virtX = -9999;
    let virtY = -9999;
    let lastMoveTime = performance.now();

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      lastMoveTime = performance.now();
    };
    const onLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let visible = true;
    let errored = false;
    let resolvedColor = resolveColor(cfg.current.color, host);
    let colorKey = cfg.current.color;
    let start = performance.now();

    const ro = new ResizeObserver(() => {
      setSize(host.clientWidth, host.clientHeight);
    });
    ro.observe(host);

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
    });
    io.observe(host);

    const drawParticle = (
      x: number,
      y: number,
      scale: number,
      angle: number,
      sz: number,
      kind: AntigravityProps["shape"],
    ) => {
      const s = Math.max(0, sz * scale);
      if (s <= 0.1) return;
      if (kind === "dot") {
        c2d.beginPath();
        c2d.arc(x, y, s / 2, 0, TWO_PI);
        c2d.fill();
        return;
      }
      c2d.save();
      c2d.translate(x, y);
      c2d.rotate(angle);
      if (kind === "square") {
        c2d.fillRect(-s / 2, -s / 2, s, s);
      } else {
        // bar：朝向光标的短棒（宽窄比 ~1:3）
        const len = s * 2.2;
        const wdt = Math.max(1, s * 0.7);
        c2d.fillRect(-wdt / 2, -len / 2, wdt, len);
      }
      c2d.restore();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || errored) return;
      try {
        const c = cfg.current;

        // 粒子数变化 → 重新播种
        if (Math.floor(c.count) !== particles.length) seed();

        // 颜色变化 → 重新解析 token
        if (c.color !== colorKey) {
          colorKey = c.color;
          resolvedColor = resolveColor(c.color, host);
        }

        const elapsed = (now - start) / 1000;

        // 目标点：真实指针；静止 >2s 且 autoAnimate → 巡游
        let destX = pointerX;
        let destY = pointerY;
        if (c.autoAnimate && now - lastMoveTime > 2000) {
          destX = w / 2 + Math.sin(elapsed * 0.5) * (w / 4);
          destY = h / 2 + Math.cos(elapsed) * (h / 4);
        }

        // 虚拟光标缓动跟随
        if (destX > -9000) {
          if (virtX < -9000) {
            virtX = destX;
            virtY = destY;
          } else {
            virtX += (destX - virtX) * 0.08;
            virtY += (destY - virtY) * 0.08;
          }
        }
        const hasTarget = destX > -9000 && virtX > -9000;
        const tx = virtX;
        const ty = virtY;

        const globalRot = elapsed * c.rotationSpeed;

        c2d.clearRect(0, 0, w, h);
        c2d.fillStyle = resolvedColor;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.t += p.speed / 2;

          let targetX = p.hx;
          let targetY = p.hy;
          let angle = 0;

          if (hasTarget) {
            const dx = p.hx - tx;
            const dy = p.hy - ty;
            const dist = Math.hypot(dx, dy);
            if (dist < c.magnetRadius) {
              const a = Math.atan2(dy, dx) + globalRot;
              const wave =
                Math.sin(p.t * c.waveSpeed + a) * (0.5 * c.waveAmplitude);
              const dev = p.offset * (c.waveAmplitude * 0.4);
              const r = c.ringRadius + wave + dev;
              targetX = tx + r * Math.cos(a);
              targetY = ty + r * Math.sin(a);
              angle = a + Math.PI / 2; // bar 指向切线/光标
            }
          }

          p.cx += (targetX - p.cx) * c.lerpSpeed;
          p.cy += (targetY - p.cy) * c.lerpSpeed;

          // 命中环 → 放大；远离环 → 缩小（与原作 scaleFactor 同构）
          let scaleFactor = 1;
          if (hasTarget) {
            const dRing = Math.abs(
              Math.hypot(p.cx - tx, p.cy - ty) - c.ringRadius,
            );
            scaleFactor = Math.max(0, Math.min(1, 1 - dRing / 40));
          } else {
            scaleFactor = 0.55; // 漂浮态保持淡淡可见
          }
          const pulse = 0.8 + Math.sin(p.t * c.pulseSpeed) * 0.2;

          drawParticle(
            p.cx,
            p.cy,
            scaleFactor * pulse,
            c.shape === "bar" ? angle : 0,
            c.particleSize,
            c.shape,
          );
        }
      } catch {
        errored = true;
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // reduced-motion / 无 canvas2d：静态点阵 fallback（吃 chart token），内容不卸载。
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "relative block h-full w-full overflow-hidden",
          "[background-image:radial-gradient(var(--color-chart-1)_1px,transparent_1.5px)]",
          "[background-size:18px_18px] opacity-60",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={cn("relative block h-full w-full overflow-hidden", className)}
    >
      {fallback}
    </div>
  );
}
