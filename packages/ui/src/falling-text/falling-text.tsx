"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { FallingTextProps } from "./falling-text.types";

// 吸取自 React Bits FallingText：整段文字按词拆分，触发后每个词作为刚体受重力下落、
// 撞墙/落地反弹堆叠，可用指针拖拽抛掷。
// 瑚琏化要点：
// 1. 去依赖——原库用 matter-js 物理引擎，这里用纯 requestAnimationFrame 自写二维刚体积分
//    （重力 + 墙体/地面碰撞 + 反弹 + 空气阻尼 + 角速度），零运行时依赖。
// 2. token——高亮词默认走 text-primary（替原库写死 cyan）；容器/文本吃 foreground token。
// 3. reduced-motion——useReducedMotion() 时不启动物理，词块以静态文本铺排（DOM 两态一致，
//    词块始终在 DOM 内，只是不掉落），避免「reveal 后不可见」坑。
// 4. RSC——含 ref/effect/指针交互，必 "use client"。

interface Body {
  el: HTMLSpanElement;
  x: number; // 中心 x
  y: number; // 中心 y
  vx: number;
  vy: number;
  angle: number;
  va: number; // 角速度
  hw: number; // 半宽
  hh: number; // 半高
}

const DEFAULT_HIGHLIGHT_CLASS = "text-primary font-semibold";

export function FallingText({
  text = "",
  highlightWords: highlightWordsProp,
  highlightClass = DEFAULT_HIGHLIGHT_CLASS,
  trigger = "auto",
  gravity = 1,
  bounce = 0.6,
  fontSize = "1.5rem",
  className,
  style,
}: FallingTextProps) {
  const highlightWords = highlightWordsProp ?? [];
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);

  const words = text.length > 0 ? text.split(/\s+/).filter(Boolean) : [];

  // 触发逻辑：auto 立即；scroll 用 IntersectionObserver；click/hover 由事件回调置 true。
  useEffect(() => {
    if (reduce) return; // 降级：不启动物理
    if (trigger === "auto") {
      setStarted(true);
      return;
    }
    if (trigger === "scroll") {
      const node = containerRef.current;
      if (!node) return;
      const ob = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setStarted(true);
            ob.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      ob.observe(node);
      return () => ob.disconnect();
    }
  }, [trigger, reduce]);

  const handleTrigger = useCallback(() => {
    if (!reduce && (trigger === "click" || trigger === "hover")) {
      setStarted(true);
    }
  }, [reduce, trigger]);

  // 物理积分循环：started 时把每个词块从其当前布局位置「冻结」成绝对定位刚体，
  // 逐帧积分重力/碰撞/拖拽，写回 transform。
  useLayoutEffect(() => {
    if (!started) return;
    const container = containerRef.current;
    const textLayer = textRef.current;
    if (!container || !textLayer) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    const spans = Array.from(
      textLayer.querySelectorAll<HTMLSpanElement>("[data-word]"),
    );
    if (spans.length === 0) return;

    // 先量取每个词在自然布局下的位置，再切到 absolute（量序固定，避免回流污染）。
    const bodies: Body[] = spans.map((el) => {
      const r = el.getBoundingClientRect();
      const hw = r.width / 2;
      const hh = r.height / 2;
      const x = r.left - rect.left + hw;
      const y = r.top - rect.top + hh;
      return {
        el,
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: 0,
        angle: 0,
        va: (Math.random() - 0.5) * 2,
        hw,
        hh,
      };
    });

    // 切绝对定位，锚点用 transform translate(-50%,-50%)，left/top 设 0 后纯靠 transform 定位。
    bodies.forEach((b) => {
      b.el.style.position = "absolute";
      b.el.style.left = "0px";
      b.el.style.top = "0px";
      b.el.style.margin = "0";
      b.el.style.willChange = "transform";
      writeTransform(b);
    });

    // 指针拖拽：抓住最近的词块跟随指针，松手时按位移给出抛掷速度。
    let dragged: Body | null = null;
    let pointerId: number | null = null;
    let lastPx = 0;
    let lastPy = 0;

    const localPoint = (e: PointerEvent) => {
      const cr = container.getBoundingClientRect();
      return { px: e.clientX - cr.left, py: e.clientY - cr.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      let best: Body | null = null;
      let bestD = Infinity;
      for (const b of bodies) {
        if (
          px >= b.x - b.hw &&
          px <= b.x + b.hw &&
          py >= b.y - b.hh &&
          py <= b.y + b.hh
        ) {
          const d = (px - b.x) ** 2 + (py - b.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = b;
          }
        }
      }
      if (best) {
        dragged = best;
        pointerId = e.pointerId;
        lastPx = px;
        lastPy = py;
        try {
          container.setPointerCapture(e.pointerId);
        } catch {
          /* best-effort */
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragged || e.pointerId !== pointerId) return;
      const { px, py } = localPoint(e);
      dragged.vx = (px - lastPx) * 60;
      dragged.vy = (py - lastPy) * 60;
      dragged.x = px;
      dragged.y = py;
      lastPx = px;
      lastPy = py;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      dragged = null;
      pointerId = null;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        /* best-effort */
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);

    const G = 1400 * gravity; // 像素/秒² 基准重力
    const AIR = 0.999; // 空气阻尼
    const ANG_DAMP = 0.985;
    let raf = 0;
    let prev = performance.now();

    const step = (now: number) => {
      // dt 上限 1/30s，标签页切回不暴冲。
      const dt = Math.min((now - prev) / 1000, 1 / 30);
      prev = now;

      for (const b of bodies) {
        if (b === dragged) {
          // 拖拽中：位置由指针接管，本帧不积分，仅写 transform。
          b.angle += b.va * dt;
          writeTransform(b);
          continue;
        }
        b.vy += G * dt;
        b.vx *= AIR;
        b.vy *= AIR;
        b.va *= ANG_DAMP;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += b.va * dt;

        // 地面
        if (b.y + b.hh > height) {
          b.y = height - b.hh;
          b.vy = -b.vy * bounce;
          b.vx *= 0.92; // 落地摩擦
          b.va *= 0.9;
          if (Math.abs(b.vy) < 12) b.vy = 0;
        }
        // 天花板
        if (b.y - b.hh < 0) {
          b.y = b.hh;
          b.vy = -b.vy * bounce;
        }
        // 左右墙
        if (b.x - b.hw < 0) {
          b.x = b.hw;
          b.vx = -b.vx * bounce;
        } else if (b.x + b.hw > width) {
          b.x = width - b.hw;
          b.vx = -b.vx * bounce;
        }
        writeTransform(b);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
    };
  }, [started, gravity, bounce]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden text-center text-foreground",
        (trigger === "click" || trigger === "hover") && !started && "cursor-pointer",
        className,
      )}
      style={style}
      onClick={trigger === "click" ? handleTrigger : undefined}
      onMouseEnter={trigger === "hover" ? handleTrigger : undefined}
    >
      <div
        ref={textRef}
        data-falling-text
        className="inline-block leading-relaxed"
        style={{ fontSize }}
      >
        {words.map((word, i) => {
          const isHi = highlightWords.some((hw) => word.startsWith(hw));
          return (
            <span
              key={`${word}-${i}`}
              data-word
              className={cn(
                "inline-block select-none px-0.5",
                isHi && highlightClass,
              )}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function writeTransform(b: Body) {
  b.el.style.transform = `translate(${b.x - b.hw}px, ${b.y - b.hh}px) rotate(${b.angle}rad)`;
}
