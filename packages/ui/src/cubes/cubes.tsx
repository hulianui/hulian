"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { CubesProps } from "./cubes.types";

// 吸取自 React Bits Cubes：gridSize×gridSize 的 3D CSS 立方体阵列，指针靠近的立方体按
// 距离衰减倾斜（rotateX/rotateY），空闲时自动游走，点击从命中点向外环形扩散涟漪高亮。
// 瑚琏化：① 去掉 gsap —— 倾斜用单条 requestAnimationFrame 循环对每个立方体做 lerp 缓动
//          （目标角写 dataset，每帧朝目标插值，直接写 transform，零依赖复刻 power3.out 观感）；
//        ② 颜色全吃 token（面 var(--color-surface) / 边 var(--color-border) / 涟漪 var(--color-primary)），
//          替原始写死 #120F17 / #fff，自动明暗适配；
//        ③ reduced-motion：禁用自动游走 + 指针倾斜（保持 DOM 不变，仅静止），涟漪改为瞬时还原；
//        ④ "use client"（ref/RAF/指针事件），StrictMode 安全（循环句柄置位防双挂载泄漏）。

const PERSPECTIVE = "99999999px";

function gapValue(g: CubesProps["cellGap"], axis: "row" | "col"): string {
  if (typeof g === "number") return `${g}px`;
  const v = g?.[axis];
  if (v === undefined) return "5%";
  return typeof v === "number" ? `${v}px` : v;
}

export function Cubes({
  gridSize = 8,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  cellGap,
  faceColor = "var(--color-surface)",
  edgeColor = "var(--color-border)",
  rippleColor = "var(--color-primary)",
  rippleSpeed = 2,
  autoAnimate = true,
  rippleOnClick = true,
  className,
  style,
}: CubesProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // 当前/目标倾斜状态：以 dataset 存目标角，RAF 循环每帧朝目标 lerp（缓动）。
  const rafRef = useRef<number | null>(null);
  const userActiveRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusRef = useRef({ x: gridSize / 2, y: gridSize / 2 });
  const targetRef = useRef({ x: gridSize / 2, y: gridSize / 2 });

  const cells = useMemo(
    () => Array.from({ length: gridSize }, (_, i) => i),
    [gridSize],
  );

  // 根据焦点(列,行)计算每个立方体的目标角并写入 dataset。
  const aimAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const nodes = scene.querySelectorAll<HTMLElement>("[data-cube]");
      nodes.forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        let angle = 0;
        if (dist <= radius) angle = (1 - dist / radius) * maxAngle;
        cube.dataset.tx = String(-angle);
        cube.dataset.ty = String(angle);
      });
    },
    [radius, maxAngle],
  );

  // 单条 RAF 循环：每帧把每个立方体的当前角朝目标角 lerp，并在空闲时漫游焦点。
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (reduce) {
      // reduced-motion：所有立方体回正且保持静止。
      scene
        .querySelectorAll<HTMLElement>("[data-cube]")
        .forEach((cube) => {
          cube.style.transform = "rotateX(0deg) rotateY(0deg)";
        });
      return;
    }

    let alive = true;
    const wanderSpeed = 0.02;

    const tick = () => {
      if (!alive) return;
      const sc = sceneRef.current;
      if (!sc) return;

      // 空闲时漫游一个虚拟焦点（auto-animate）。
      if (autoAnimate && !userActiveRef.current) {
        const pos = focusRef.current;
        const tgt = targetRef.current;
        pos.x += (tgt.x - pos.x) * wanderSpeed;
        pos.y += (tgt.y - pos.y) * wanderSpeed;
        aimAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          targetRef.current = {
            x: Math.random() * gridSize,
            y: Math.random() * gridSize,
          };
        }
      }

      // 每个立方体当前角朝目标角缓动（lerp ≈ ease-out）。
      sc.querySelectorAll<HTMLElement>("[data-cube]").forEach((cube) => {
        const targetX = Number(cube.dataset.tx ?? 0);
        const targetY = Number(cube.dataset.ty ?? 0);
        const curX = Number(cube.dataset.cx ?? 0);
        const curY = Number(cube.dataset.cy ?? 0);
        const nextX = curX + (targetX - curX) * 0.18;
        const nextY = curY + (targetY - curY) * 0.18;
        cube.dataset.cx = String(nextX);
        cube.dataset.cy = String(nextY);
        cube.style.transform = `rotateX(${nextX}deg) rotateY(${nextY}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    // 初始化漫游焦点。
    focusRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    targetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      alive = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [reduce, autoAnimate, gridSize, aimAt]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce) return;
      const scene = sceneRef.current;
      if (!scene) return;
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      const rect = scene.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;
      aimAt(rowCenter, colCenter);

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [reduce, gridSize, aimAt],
  );

  const resetAll = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.querySelectorAll<HTMLElement>("[data-cube]").forEach((cube) => {
      cube.dataset.tx = "0";
      cube.dataset.ty = "0";
    });
  }, []);

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!rippleOnClick) return;
      const scene = sceneRef.current;
      if (!scene) return;
      const rect = scene.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colHit = Math.floor((e.clientX - rect.left) / cellW);
      const rowHit = Math.floor((e.clientY - rect.top) / cellH);

      const spreadDelay = 60 / Math.max(0.1, rippleSpeed); // ms/环
      const hold = 280 / Math.max(0.1, rippleSpeed);

      scene.querySelectorAll<HTMLElement>("[data-cube]").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const ring = Math.round(Math.hypot(r - rowHit, c - colHit));
        const delay = ring * spreadDelay;
        const faces = cube.querySelectorAll<HTMLElement>("[data-face]");
        if (reduce) {
          // reduced-motion：瞬时高亮一帧不做动画；保持 DOM 一致。
          faces.forEach((f) => {
            f.style.backgroundColor = rippleColor;
          });
          window.setTimeout(() => {
            faces.forEach((f) => {
              f.style.backgroundColor = "";
            });
          }, hold);
          return;
        }
        window.setTimeout(() => {
          faces.forEach((f) => {
            f.style.transition = "background-color 200ms ease-out";
            f.style.backgroundColor = rippleColor;
          });
          window.setTimeout(() => {
            faces.forEach((f) => {
              f.style.backgroundColor = "";
            });
          }, hold);
        }, delay);
      });
    },
    [reduce, rippleOnClick, gridSize, rippleColor, rippleSpeed],
  );

  const sceneStyle: CSSProperties = {
    display: "grid",
    width: "100%",
    height: "100%",
    perspective: PERSPECTIVE,
    gridTemplateColumns: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize
      ? `repeat(${gridSize}, ${cubeSize}px)`
      : `repeat(${gridSize}, 1fr)`,
    columnGap: gapValue(cellGap, "col"),
    rowGap: gapValue(cellGap, "row"),
  };

  const wrapperStyle: CSSProperties = {
    position: "relative",
    aspectRatio: "1 / 1",
    ...(cubeSize
      ? { width: `${gridSize * cubeSize}px`, height: `${gridSize * cubeSize}px` }
      : { width: "100%" }),
    ...style,
  };

  // 立方体面公共样式：吃 token 的面色 + 边框，preserve-3d 由父级承载。
  const faceBase: CSSProperties = {
    position: "absolute",
    inset: 0,
    background: faceColor,
    border: `1px solid ${edgeColor}`,
  };

  // 六面的 3D 摆位（对齐原始：top/bottom/left/right 平移±50%再旋转，front/back 复合旋转）。
  const faces: { key: string; transform: string }[] = [
    { key: "top", transform: "translateY(-50%) rotateX(90deg)" },
    { key: "bottom", transform: "translateY(50%) rotateX(-90deg)" },
    { key: "left", transform: "translateX(-50%) rotateY(-90deg)" },
    { key: "right", transform: "translateX(50%) rotateY(90deg)" },
    { key: "front", transform: "rotateY(-90deg) translateX(50%) rotateY(90deg)" },
    { key: "back", transform: "rotateY(-90deg) translateX(-50%) rotateY(90deg)" },
  ];

  return (
    <div className={cn("text-foreground", className)} style={wrapperStyle}>
      <div
        ref={sceneRef}
        style={sceneStyle}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetAll}
        onClick={handleClick}
        aria-hidden
      >
        {cells.map((r) =>
          cells.map((c) => (
            <div
              key={`${r}-${c}`}
              data-cube
              data-row={r}
              data-col={c}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                aspectRatio: "1 / 1",
                transformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {faces.map((f) => (
                <div
                  key={f.key}
                  data-face
                  style={{ ...faceBase, transform: f.transform }}
                />
              ))}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
