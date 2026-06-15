"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { LanyardProps } from "./lanyard.types";

// 吸取自 React Bits Lanyard：一张工牌挂在挂绳上、可抓取拖拽、松手后带物理回弹地来回摆动。
// 瑚琏化：原件依赖 three.js + @react-three/rapier 物理引擎 + GLB 模型 + meshline（均为禁用/未装依赖），
//   这里整体重构为「单摆 + 阻尼弹簧」二维物理 —— 原生 PointerEvents 抓取卡片，requestAnimationFrame
//   逐帧积分角速度（stiffness 回正 + damping 衰减）模拟摆动，挂绳用 SVG 二次贝塞尔曲线随卡片实时弯折。
//   不用 motion 的 drag（其需 domMax features，与本库减包用的 domAnimation·strict 冲突），改纯指针事件 + RAF。
//   颜色全吃 token（挂绳默认 var(--color-primary)，工牌走 surface/border/foreground）；
//   reduced-motion 时仍可拖拽但松手立即静止归位（不逐帧抖动），DOM 两态完全一致。
export function Lanyard({
  ropeLength = 120,
  ropeColor = "var(--color-primary)",
  stiffness = 0.045,
  damping = 0.92,
  children,
  title = "瑚琏 · HULIAN",
  subtitle = "拖动摆一摆",
  className,
  style,
  ...props
}: LanyardProps & Omit<React.HTMLAttributes<HTMLDivElement>, keyof LanyardProps>) {
  const reduce = useReducedMotion();

  // 摆角（弧度，0 = 垂直向下）与角速度，存 ref 避免逐帧 setState；用 state 触发重绘。
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // 卸载兜底：拖拽中挂在 window 上的 move/up 监听的卸钩函数。正常松手时 onUp 自卸并清空；
  // 若组件在拖拽途中卸载（onUp 永不触发），unmount cleanup 调用它防止 window 监听泄漏。
  const detachDragRef = useRef<(() => void) | null>(null);
  const [angle, setAngle] = useState(0);

  // 拖拽稳定参数引用，供事件回调读到最新值而不重绑监听。
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  const lenRef = useRef(ropeLength);
  lenRef.current = ropeLength;

  useEffect(() => {
    // jsdom / SSR 守卫：无 requestAnimationFrame 时安全退出（测试环境不跑物理）。
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      return;
    }
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      if (!draggingRef.current) {
        if (reduceRef.current) {
          // reduced-motion：不做余摆，直接收敛归零。
          angleRef.current = 0;
          velRef.current = 0;
        } else {
          // 弹簧回正：加速度 = -k·θ；阻尼：v *= damping。
          velRef.current = (velRef.current - stiffness * angleRef.current) * damping;
          angleRef.current += velRef.current;
          // 近静止时吸附归零，停止无意义微抖。
          if (Math.abs(angleRef.current) < 0.0004 && Math.abs(velRef.current) < 0.0004) {
            angleRef.current = 0;
            velRef.current = 0;
          }
        }
      }
      setAngle(angleRef.current);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [stiffness, damping]);

  // 卸载兜底：组件若在拖拽途中卸载，onUp 永不触发，确保移除 window 上残留的 move/up 监听。
  useEffect(() => {
    return () => {
      detachDragRef.current?.();
      detachDragRef.current = null;
    };
  }, []);

  // 指针按下 → 抓取：在 window 上挂 move/up，按指针水平位移反推摆角。
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    velRef.current = 0;
    const startX = e.clientX;
    const startAngle = angleRef.current;

    const onMove = (ev: PointerEvent) => {
      const len = lenRef.current;
      if (reduceRef.current) {
        angleRef.current = 0;
        velRef.current = 0;
        setAngle(0);
        return;
      }
      const dx = ev.clientX - startX;
      const prev = angleRef.current;
      // 水平位移换算成摆角：远离垂直越难（atan2 软上限），手感更像真实悬挂。
      const next = startAngle + Math.atan2(dx, Math.max(len * 0.6, len - Math.abs(dx) * 0.3));
      const clamped = Math.max(-1.2, Math.min(1.2, next));
      velRef.current = clamped - prev;
      angleRef.current = clamped;
      setAngle(clamped);
    };
    const detach = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      detachDragRef.current = null;
    };
    const onUp = () => {
      draggingRef.current = false;
      detach();
    };
    // 若上一次拖拽尚未松手（理论上不会，防御性），先卸旧监听再挂新的。
    detachDragRef.current?.();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    detachDragRef.current = detach;
  }, []);

  // 卡片中心相对锚点（极坐标 → 笛卡尔）：摆放卡片 + 绘制挂绳曲线终点。
  const tipX = Math.sin(angle) * ropeLength;
  const tipY = Math.cos(angle) * ropeLength;
  // 二次贝塞尔控制点：沿摆向轻微偏移，使挂绳呈自然垂坠弯弧。
  const ctrlX = Math.sin(angle) * ropeLength * 0.4;
  const ctrlY = ropeLength * 0.55;

  return (
    <div
      {...props}
      ref={rootRef}
      style={style}
      className={cn(
        "relative flex w-full select-none items-start justify-center overflow-hidden",
        className,
      )}
    >
      {/* 顶部锚点钉：挂绳从这里垂下。 */}
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <div className="size-3 rounded-full border border-border bg-surface shadow-sm" />
      </div>

      {/* 挂绳层：SVG 二次贝塞尔曲线，随卡片摆角实时弯折（aria-hidden 装饰）。 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1.5 -translate-x-1/2"
        width={ropeLength * 2}
        height={ropeLength + 24}
        viewBox={`${-ropeLength} 0 ${ropeLength * 2} ${ropeLength + 24}`}
      >
        <path
          d={`M 0 0 Q ${ctrlX} ${ctrlY} ${tipX} ${tipY}`}
          fill="none"
          stroke={ropeColor}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </svg>

      {/* 工牌：原生指针拖拽抓取，松手交还 RAF 物理回弹。 */}
      <div
        onPointerDown={onPointerDown}
        className="absolute top-1.5 z-20 origin-top cursor-grab touch-none active:cursor-grabbing"
        style={{
          transform: `translate(${tipX}px, ${tipY}px)`,
          willChange: "transform",
        }}
      >
        {/* 钩扣 */}
        <div className="mx-auto mb-1 h-3 w-5 rounded-b-md border border-t-0 border-border bg-surface" />
        {children != null ? (
          children
        ) : (
          <div className="w-40 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
            <div className="mx-auto mb-3 size-12 rounded-full bg-primary/15" />
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}
