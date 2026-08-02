"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { cn } from "../lib/cn";
import { motionEaseCss } from "../motion";
import { glareState, normalizePointer, tiltAngles } from "./tilt-geometry";
import type { TiltProps } from "./tilt.types";

// Tilt = 通用视差倾斜**包裹器**：裹住任意 children，按指针（或陀螺仪 / 手动角度）做 3D 倾斜，
// 可选跟随指针的反光高光层。
//
// 和 TiltedCard 的分工：TiltedCard 是**卡片**（图片 + 浮动气泡 + overlay，结构固定）；
// 本组件是**原语**，裹什么都行——价目表、图表卡、登录框、一段 3D 文案。
// 对标 react-parallax-tilt 的能力面（glare/陀螺仪/全窗跟踪/手动角度/单轴/静息角），
// 但零依赖、吃瑚琏动效曲线、默认尊重 reduced-motion。

const REST = { rotateX: 0, rotateY: 0 };

export function Tilt({
  children,
  tiltEnable = true,
  maxAngleX = 12,
  maxAngleY = 12,
  reverse = false,
  axis,
  initialAngleX = 0,
  initialAngleY = 0,
  manualAngleX,
  manualAngleY,
  scale = 1,
  perspective = 1000,
  transitionSpeed = 300,
  transitionEasing = motionEaseCss.out,
  reset = true,
  trackOnWindow = false,
  gyroscope = false,
  glare = false,
  glareMaxOpacity = 0.35,
  glareColor = "#ffffff",
  glareReverse = false,
  glareBorderRadius,
  onTiltMove,
  onTiltEnter,
  onTiltLeave,
  className,
  style,
  ...rest
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [angles, setAngles] = useState(REST);
  const [glareLight, setGlareLight] = useState({ angle: 0, opacity: 0 });
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  // reduced-motion 下彻底不倾斜（这类效果对前庭敏感人群最不友好），但 children 照常渲染。
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const enabled = tiltEnable && !reduced;

  const applyPoint = (px: number, py: number) => {
    const next = tiltAngles(px, py, { maxAngleX, maxAngleY, reverse, axis });
    const light = glareState(px, py, { maxOpacity: glareMaxOpacity, reverse: glareReverse });
    setAngles(next);
    setGlareLight(light);
    onTiltMove?.({ angles: next, glare: light });
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || trackOnWindow) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const [px, py] = normalizePointer(e.clientX, e.clientY, rect);
    applyPoint(px, py);
  };

  const onPointerEnter = () => {
    if (!enabled) return;
    setActive(true);
    onTiltEnter?.();
  };

  const onPointerLeave = () => {
    if (!enabled) return;
    setActive(false);
    if (reset) {
      setAngles(REST);
      setGlareLight({ angle: 0, opacity: 0 });
    }
    onTiltLeave?.();
  };

  // 全局监听用「稳定 handler + latest ref」：handler 只在开关变化时挂/卸，
  // 却始终读到最新的 props——直接把 applyPoint 写进依赖会每次渲染都重挂监听。
  const applyRef = useRef(applyPoint);
  applyRef.current = applyPoint;

  // 全窗跟踪：卡片不必被指针悬停也会随全局指针动（大面积主视觉常用）。
  useEffect(() => {
    if (!enabled || !trackOnWindow || typeof window === "undefined") return;
    const onMove = (e: globalThis.PointerEvent) => {
      const [px, py] = normalizePointer(e.clientX, e.clientY, {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      applyRef.current(px, py);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, trackOnWindow]);

  // 陀螺仪：把设备姿态映射到 0..1 的「虚拟指针」。iOS 需站点自行取得
  // DeviceOrientationEvent 权限（未授权时事件不触发，组件静默保持静息态）。
  useEffect(() => {
    if (!enabled || !gyroscope || typeof window === "undefined") return;
    const onOrient = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e;
      if (beta == null || gamma == null) return;
      // beta ∈ [-180,180]（前后倾）、gamma ∈ [-90,90]（左右倾）；各取 ±45° 作满量程。
      const py = 0.5 - Math.max(-45, Math.min(45, beta)) / 90;
      const px = 0.5 + Math.max(-45, Math.min(45, gamma)) / 90;
      applyRef.current(px, py);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, [enabled, gyroscope]);

  // 手动角度接管对应轴；静息角在无交互时兜底。
  const rotateX = manualAngleX ?? (enabled ? angles.rotateX || initialAngleX : initialAngleX);
  const rotateY = manualAngleY ?? (enabled ? angles.rotateY || initialAngleY : initialAngleY);
  const zoom = enabled && active ? scale : 1;

  const innerStyle: CSSProperties = {
    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
    transformStyle: "preserve-3d",
    transition: `transform ${transitionSpeed}ms ${transitionEasing}`,
    willChange: "transform",
  };

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{ perspective: `${perspective}px`, ...style }}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      {...rest}
    >
      <div data-tilt-inner style={innerStyle}>
        {children}
        {glare && enabled && (
          <span
            data-tilt-glare
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              borderRadius: glareBorderRadius,
              backgroundImage: `linear-gradient(${glareLight.angle}deg, ${glareColor} 0%, transparent 80%)`,
              opacity: glareLight.opacity,
              transition: `opacity ${transitionSpeed}ms ${transitionEasing}`,
            }}
          />
        )}
      </div>
    </div>
  );
}
