"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { MagnetProps } from "./magnet.types";

// 吸取自 React Bits Magnet：指针进入元素感应区后，内容按「到中心的距离 / 强度」磁吸跟随指针，离开则平滑归位。
// 瑚琏化：内层位移层带 token 类（will-change-transform）；reduced-motion → 钳住位移恒为原点（DOM 两态一致，无闪烁）；
// 监听器 jsdom 安全（getBoundingClientRect 在测试中返回全 0，不触发吸附亦不抛错）；外层透传 {...props} + className 合并。
export function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.5s ease-in-out",
  wrapperClassName,
  innerClassName,
  style,
  ...props
}: MagnetProps) {
  const reduce = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const magnetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 禁用或 reduced-motion：归位并不挂监听，内容保持静止居中。
    if (disabled || reduce) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const node = magnetRef.current;
      if (!node) return;

      const { left, top, width, height } = node.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true);
        setPosition({
          x: (e.clientX - centerX) / magnetStrength,
          y: (e.clientY - centerY) / magnetStrength,
        });
      } else {
        setIsActive(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [padding, disabled, magnetStrength, reduce]);

  return (
    <div
      {...props}
      ref={magnetRef}
      className={cn("relative inline-block", wrapperClassName)}
      style={style}
    >
      <div
        className={cn("will-change-transform", innerClassName)}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isActive ? activeTransition : inactiveTransition,
        }}
      >
        {children}
      </div>
    </div>
  );
}
