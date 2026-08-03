"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { RotateCcw } from "lucide-react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { ModelViewerProps } from "./model-viewer.types";

// 吸取自 React Bits ModelViewer：一个交互式 3D 模型查看舞台——拖拽旋转（带惯性缓停）、
// 鼠标视差、悬停倾斜、自动旋转、底部接触阴影、右上角工具按钮。
// 瑚琏化：原组件依赖 three.js / @react-three/fiber / drei 加载 GLTF/FBX/OBJ 模型并 WebGL 渲染，
// 这些均为禁用依赖；故去依赖、去 WebGL，改用纯 CSS 3D（preserve-3d + perspective）把
// 任意 children 当作「模型」施加同款交互（yaw/pitch/视差/悬停/自动旋转/惯性，几何用 RAF 自插值）。
// token 化：边框 border-border、底色 bg-surface、按钮吃 surface/foreground、接触阴影用 var(--color-foreground)。
// 截图按钮（依赖 WebGL drawingBuffer）瑚琏化为「重置视角」按钮。
// reduced-motion：useReducedMotion 关掉 RAF 与所有交互，模型以初始角度静态呈现（DOM 不变）。

const INERTIA = 0.925; // 松手后速度衰减系数
const ROTATE_SPEED = 0.25; // 每像素拖拽 → 角度（°）
const PARALLAX_MAG = 10; // 视差最大位移（px）
const HOVER_MAG = 8; // 悬停倾斜最大角（°）
const EASE = 0.12; // 视差 / 悬停缓动系数

export function ModelViewer({
  children,
  width = "100%",
  height = 360,
  defaultRotationY = -20,
  defaultRotationX = 12,
  perspective = 1000,
  enableManualRotation = true,
  enableMouseParallax = true,
  enableHoverRotation = true,
  autoRotate = false,
  autoRotateSpeed = 24,
  showResetButton = true,
  showContactShadow = true,
  className,
  style,
  ...props
}: ModelViewerProps) {
  const locale = useComponentLocale().modelViewer ?? { reset: "重置视角" };
  // SSR 安全的 reduced-motion 探测：初始 false，客户端首帧 effect 同步真实媒体查询。
  // 不用 motion 的 useReducedMotion——它在 jsdom/测试下不随 matchMedia mock 同步刷新。
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  // 角度 / 速度 / 视差 / 悬停 全用 ref，避免逐帧 setState
  const yaw = useRef(defaultRotationY);
  const pitch = useRef(defaultRotationX);
  const vel = useRef({ x: 0, y: 0 }); // 拖拽惯性（°/frame）
  const tPar = useRef({ x: 0, y: 0 }); // 目标视差
  const cPar = useRef({ x: 0, y: 0 }); // 当前视差
  const tHov = useRef({ x: 0, y: 0 }); // 目标悬停倾斜
  const cHov = useRef({ x: 0, y: 0 }); // 当前悬停倾斜

  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const lastT = useRef(0);

  // prop 最新值挂 ref，render 回调直接读，不重建 RAF
  const cfg = useRef({
    autoRotate,
    autoRotateSpeed,
    enableMouseParallax,
    enableHoverRotation,
  });
  cfg.current = {
    autoRotate,
    autoRotateSpeed,
    enableMouseParallax,
    enableHoverRotation,
  };

  const reset = useCallback(() => {
    yaw.current = defaultRotationY;
    pitch.current = defaultRotationX;
    vel.current = { x: 0, y: 0 };
    tPar.current = { x: 0, y: 0 };
    tHov.current = { x: 0, y: 0 };
  }, [defaultRotationX, defaultRotationY]);

  // 当默认角变化时同步静态/初始状态
  useEffect(() => {
    yaw.current = defaultRotationY;
    pitch.current = defaultRotationX;
  }, [defaultRotationX, defaultRotationY]);

  // RAF 循环：只在非 reduced-motion 时运行
  useEffect(() => {
    if (reduced) return;
    let raf = 0;

    const tick = (t: number) => {
      const dt = lastT.current ? Math.min((t - lastT.current) * 0.001, 0.1) : 0;
      lastT.current = t;
      const c = cfg.current;

      // 自动旋转
      if (c.autoRotate) yaw.current += c.autoRotateSpeed * dt;

      // 拖拽惯性
      yaw.current += vel.current.x;
      pitch.current += vel.current.y;
      vel.current.x *= INERTIA;
      vel.current.y *= INERTIA;
      if (Math.abs(vel.current.x) < 1e-3) vel.current.x = 0;
      if (Math.abs(vel.current.y) < 1e-3) vel.current.y = 0;

      // 俯仰限位，避免翻面
      pitch.current = Math.max(-80, Math.min(80, pitch.current));

      // 视差 / 悬停缓动逼近目标
      const pt = c.enableMouseParallax ? tPar.current : { x: 0, y: 0 };
      const ht = c.enableHoverRotation ? tHov.current : { x: 0, y: 0 };
      cPar.current.x += (pt.x - cPar.current.x) * EASE;
      cPar.current.y += (pt.y - cPar.current.y) * EASE;
      cHov.current.x += (ht.x - cHov.current.x) * EASE;
      cHov.current.y += (ht.y - cHov.current.y) * EASE;

      const el = modelRef.current;
      if (el) {
        el.style.transform = [
          `translate3d(${cPar.current.x.toFixed(2)}px, ${cPar.current.y.toFixed(2)}px, 0)`,
          `rotateX(${(pitch.current + cHov.current.y).toFixed(2)}deg)`,
          `rotateY(${(yaw.current + cHov.current.x).toFixed(2)}deg)`,
        ].join(" ");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // ── 指针交互 ──
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || !enableManualRotation) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    vel.current = { x: 0, y: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const stage = stageRef.current;
    // 视差 / 悬停：基于指针相对舞台中心的归一化位置
    if (stage && (enableMouseParallax || enableHoverRotation)) {
      const r = stage.getBoundingClientRect();
      const nx = r.width ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0; // -1..1
      const ny = r.height ? ((e.clientY - r.top) / r.height) * 2 - 1 : 0;
      tPar.current = { x: nx * PARALLAX_MAG, y: ny * PARALLAX_MAG };
      tHov.current = { x: nx * HOVER_MAG, y: -ny * HOVER_MAG };
    }
    // 拖拽旋转
    if (dragging.current && enableManualRotation) {
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      yaw.current += dx * ROTATE_SPEED;
      pitch.current += dy * ROTATE_SPEED;
      vel.current = { x: dx * ROTATE_SPEED, y: dy * ROTATE_SPEED };
    }
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onPointerLeave = () => {
    dragging.current = false;
    tPar.current = { x: 0, y: 0 };
    tHov.current = { x: 0, y: 0 };
  };

  // 静态（reduced-motion / SSR 首帧）模型变换
  const staticTransform = `rotateX(${defaultRotationX}deg) rotateY(${defaultRotationY}deg)`;

  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface",
        "select-none",
        enableManualRotation && !reduced ? "cursor-grab active:cursor-grabbing touch-pan-y" : "",
        className,
      )}
      style={{ width, height, ...style } as CSSProperties}
    >
      {/* 3D 舞台：perspective 容器 + preserve-3d 模型层 */}
      <div
        ref={stageRef}
        className="absolute inset-0 grid place-items-center"
        style={{ perspective: `${perspective}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <div
          ref={modelRef}
          className="[transform-style:preserve-3d] will-change-transform"
          style={{ transform: staticTransform }}
        >
          {children}
        </div>

        {/* 接触阴影：底部柔和椭圆，呼应原 ContactShadows */}
        {showContactShadow && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-1/2 h-4 w-2/5 -translate-x-1/2 rounded-[50%] blur-md"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--color-foreground) 0%, transparent 70%)",
              opacity: 0.18,
            }}
          />
        )}
      </div>

      {/* 工具按钮：重置视角（呼应原截图按钮位） */}
      {showResetButton && !reduced && (
        <button
          type="button"
          onClick={reset}
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg",
            "border border-border bg-surface/80 px-2.5 py-1.5 text-xs font-medium text-foreground",
            "backdrop-blur-sm transition-colors hover:bg-surface",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {locale.reset}
        </button>
      )}
    </div>
  );
}
