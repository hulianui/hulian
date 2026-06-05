"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { TextCursorProps } from "./text-cursor.types";

// 吸取自 React Bits TextCursor：光标在容器内移动时，沿轨迹按固定间距落下一串文本字形，
// 字形随机微浮动并随时间淡出回收，形成「拖尾打字」的鼠标特效。
// 瑚琏化：motion 运行时（必 "use client"，减包 m + LazyMotionProvider 取代全量 motion）；
// 字形吃 text-foreground token、容器 border-border（替原硬编码黑字）；RSC 安全（仅客户端建几何）；
// reduced-motion → 去随机浮动、瞬时回收（DOM 两态一致，仅停动画不改结构）。

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  angle: number;
  randomX: number;
  randomY: number;
  randomRotate: number;
}

export function TextCursor({
  text = "瑚",
  spacing = 80,
  followMouseDirection = true,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 30,
  maxPoints = 5,
  fontSize = "1.875rem",
  className,
  children,
  ...props
}: TextCursorProps) {
  const reduce = useReducedMotion();
  const float = randomFloat && !reduce;

  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMoveTimeRef = useRef(Date.now());
  const idCounter = useRef(0);

  // 把会被闭包捕获的可变 props 收进 ref，使 mousemove handler 保持稳定（只挂一次监听）。
  const cfg = useRef({ spacing, followMouseDirection, randomFloat, maxPoints });
  cfg.current = { spacing, followMouseDirection, randomFloat, maxPoints };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const randomData = () =>
      cfg.current.randomFloat
        ? {
            randomX: Math.random() * 10 - 5,
            randomY: Math.random() * 10 - 5,
            randomRotate: Math.random() * 10 - 5,
          }
        : { randomX: 0, randomY: 0, randomRotate: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { spacing: sp, followMouseDirection: follow, maxPoints: max } =
        cfg.current;

      setTrail((prev) => {
        const next = [...prev];
        if (next.length === 0) {
          next.push({
            id: idCounter.current++,
            x: mouseX,
            y: mouseY,
            angle: 0,
            ...randomData(),
          });
        } else {
          const last = next[next.length - 1];
          const dx = mouseX - last.x;
          const dy = mouseY - last.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= sp) {
            const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const angle = follow ? rawAngle : 0;
            const steps = Math.floor(distance / sp);
            for (let i = 1; i <= steps; i++) {
              const t = (sp * i) / distance;
              next.push({
                id: idCounter.current++,
                x: last.x + dx * t,
                y: last.y + dy * t,
                angle,
                ...randomData(),
              });
            }
          }
        }
        return next.length > max ? next.slice(next.length - max) : next;
      });

      lastMoveTimeRef.current = Date.now();
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval]);

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden border border-border",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <LazyMotionProvider>
          <AnimatePresence>
            {trail.map((item) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, scale: 1, rotate: item.angle }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: float ? [0, item.randomX, 0] : 0,
                  y: float ? [0, item.randomY, 0] : 0,
                  rotate: float
                    ? [item.angle, item.angle + item.randomRotate, item.angle]
                    : item.angle,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  opacity: { duration: exitDuration, ease: "easeOut" },
                  ...(float && {
                    x: {
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                    },
                    y: {
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                    },
                    rotate: {
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror" as const,
                    },
                  }),
                }}
                className="absolute whitespace-nowrap text-foreground select-none"
                style={{ left: item.x, top: item.y, fontSize }}
              >
                {text}
              </m.div>
            ))}
          </AnimatePresence>
        </LazyMotionProvider>
      </div>
      {children != null && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
