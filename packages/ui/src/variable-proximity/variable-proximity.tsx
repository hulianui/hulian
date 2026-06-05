"use client";
import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { VariableProximityProps } from "./variable-proximity.types";

// 吸取自 React Bits VariableProximity：鼠标靠近时逐字插值字体可变轴（font-variation-settings），
// 越近越「重/张」，离开半径即回弹，距离按 linear / exponential / gaussian 衰减。
// 瑚琏化：
// 1. 去 gsap/外部字体依赖——RAF 自驱 + 内置 var(--color-foreground) token 文字色，可变字体由调用方提供。
// 2. "use client" + useReducedMotion()：偏好减弱动效时整段定格在 from 设置（DOM 两态一致，不卸载内容）。
// 3. 指针位置走 ref（不触发 re-render），逐帧只改 letter.style.fontVariationSettings，零重渲染。
// 4. 完整文本以 sr-only 副本朗读，逐字 span 一律 aria-hidden，可访问性不受拆字影响。

function parseSettings(raw: string): Map<string, number> {
  return new Map(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [name, value] = s.split(/\s+/);
        return [name.replace(/['"]/g, ""), Number.parseFloat(value)] as [
          string,
          number,
        ];
      }),
  );
}

export function VariableProximity({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  containerRef,
  radius = 50,
  falloff = "linear",
  className,
  style,
  onClick,
}: VariableProximityProps) {
  const reduce = useReducedMotion();
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mousePositionRef = useRef({ x: -9999, y: -9999 });
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  // 解析 from/to 为「轴 → (起值, 终值)」插值表；缺省的目标轴回退到起值（不动）。
  const axes = useMemo(() => {
    const from = parseSettings(fromFontVariationSettings);
    const to = parseSettings(toFontVariationSettings);
    return Array.from(from.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: to.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  // 监听全局指针/触摸，换算成容器内相对坐标（仅写 ref，不引发 re-render）。
  useEffect(() => {
    if (reduce) return;
    const update = (x: number, y: number) => {
      const el = containerRef?.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        mousePositionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        mousePositionRef.current = { x, y };
      }
    };
    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) update(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch);
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [containerRef, reduce]);

  // RAF 主循环：逐帧按指针距离插值每个字形的 fontVariationSettings。
  useEffect(() => {
    // 减弱动效：定格在 from 设置，不起 RAF（DOM 仍为同一组字形）。
    if (reduce) {
      for (const el of letterRefs.current) {
        if (el) el.style.fontVariationSettings = fromFontVariationSettings;
      }
      return;
    }

    const falloffValue = (distance: number) => {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
      switch (falloff) {
        case "exponential":
          return norm ** 2;
        case "gaussian":
          return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
        default:
          return norm;
      }
    };

    let frameId: number;
    const loop = () => {
      const container = containerRef?.current;
      const containerRect = container?.getBoundingClientRect();
      const { x, y } = mousePositionRef.current;

      // 指针未移动则跳过本帧（省 reflow）。
      if (lastPositionRef.current.x !== x || lastPositionRef.current.y !== y) {
        lastPositionRef.current = { x, y };

        letterRefs.current.forEach((el) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const offsetLeft = containerRect ? containerRect.left : 0;
          const offsetTop = containerRect ? containerRect.top : 0;
          const cx = rect.left + rect.width / 2 - offsetLeft;
          const cy = rect.top + rect.height / 2 - offsetTop;
          const distance = Math.hypot(x - cx, y - cy);

          if (distance >= radius) {
            el.style.fontVariationSettings = fromFontVariationSettings;
            return;
          }
          const f = falloffValue(distance);
          el.style.fontVariationSettings = axes
            .map(
              ({ axis, fromValue, toValue }) =>
                `'${axis}' ${fromValue + (toValue - fromValue) * f}`,
            )
            .join(", ");
        });
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [axes, containerRef, falloff, fromFontVariationSettings, radius, reduce]);

  // 拆词 → 拆字；词内用 inline-block + nowrap 防断词，词间补不可断空隙。
  const words = label.split(" ");
  let letterIndex = 0;

  return (
    <span
      className={cn("inline text-foreground", className)}
      onClick={onClick}
      style={style}
    >
      {words.map((word, wordIndex) => (
        <span
          // 词为稳定切分单元，索引作 key 安全
          key={`w-${wordIndex}`}
          className="inline-block whitespace-nowrap"
        >
          {word.split("").map((letter) => {
            const i = letterIndex++;
            return (
              <span
                key={`l-${i}`}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className="inline-block"
                style={{ fontVariationSettings: fromFontVariationSettings }}
                aria-hidden="true"
              >
                {letter}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span className="inline-block" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
}
