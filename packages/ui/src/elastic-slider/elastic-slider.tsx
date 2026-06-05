"use client";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Volume1, Volume2 } from "lucide-react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { ElasticSliderProps } from "./elastic-slider.types";

// 吸取自 React Bits ElasticSlider：拖动越界时轨道像橡皮筋一样被拉伸（横向溢出 + 纵向压扁），
// 配合两端图标的回弹位移与 hover 整体放大；松手 spring 弹回。
// 瑚琏化：去 chakra/react-icons，图标换 lucide(Volume1/Volume2)；配色全走 token（bg-surface-hover/bg-primary/text-muted）；
// 减包用 m + LazyMotionProvider(domAnimation) 取代全量 motion；reduced-motion 下保留交互与数值更新、仅去 spring/缩放动效（DOM 两态一致）。
const MAX_OVERFLOW = 50;

/** sigmoid 衰减：越界越多增益越小，模拟橡皮筋张力上限 */
function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  isStepped = false,
  stepSize = 1,
  leftIcon = <Volume1 className="size-5" aria-hidden />,
  rightIcon = <Volume2 className="size-5" aria-hidden />,
  showValue = true,
  onValueChange,
  className,
  style,
  ...props
}: ElasticSliderProps) {
  return (
    <LazyMotionProvider>
      <div
        {...props}
        style={style}
        className={cn(
          "flex w-48 flex-col items-center justify-center gap-4",
          className,
        )}
      >
        <SliderBody
          defaultValue={defaultValue}
          startingValue={startingValue}
          maxValue={maxValue}
          isStepped={isStepped}
          stepSize={stepSize}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          showValue={showValue}
          onValueChange={onValueChange}
        />
      </div>
    </LazyMotionProvider>
  );
}

interface SliderBodyProps {
  defaultValue: number;
  startingValue: number;
  maxValue: number;
  isStepped: boolean;
  stepSize: number;
  leftIcon: ReactNode;
  rightIcon: ReactNode;
  showValue: boolean;
  onValueChange?: (value: number) => void;
}

// 内部用大写命名（含 hooks）；与原版 Slider 子组件同构，便于在 hover/region 状态下隔离 motion 值。
function SliderBody({
  defaultValue,
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  showValue,
  onValueChange,
}: SliderBodyProps) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<"left" | "middle" | "right">("middle");
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useMotionValueEvent(clientX, "change", (latest) => {
    if (!sliderRef.current) return;
    const { left, right } = sliderRef.current.getBoundingClientRect();
    let next: number;
    if (latest < left) {
      setRegion("left");
      next = left - latest;
    } else if (latest > right) {
      setRegion("right");
      next = latest - right;
    } else {
      setRegion("middle");
      next = 0;
    }
    overflow.jump(decay(next, MAX_OVERFLOW));
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let next =
        startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
      if (isStepped) next = Math.round(next / stepSize) * stepSize;
      next = Math.min(Math.max(next, startingValue), maxValue);
      setValue(next);
      onValueChange?.(next);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    if (reduce) {
      overflow.jump(0);
      setRegion("middle");
      return;
    }
    animate(overflow, 0, { type: "spring", bounce: 0.5 });
  };

  const getRangePercentage = () => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return ((value - startingValue) / totalRange) * 100;
  };

  // scaleX：轨道宽度方向随越界量等比拉伸（1 + overflow/width）
  const trackScaleX = useTransform(() => {
    if (sliderRef.current) {
      const { width } = sliderRef.current.getBoundingClientRect();
      return 1 + overflow.get() / width;
    }
    return 1;
  });
  // scaleY：越界越多越被压扁（橡皮筋变瘦）
  const trackScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]);
  // transformOrigin：从远离指针的一端开始拉伸
  const trackOrigin = useTransform(() => {
    if (sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      return clientX.get() < left + width / 2 ? "right" : "left";
    }
    return "center";
  });
  const trackHeight = useTransform(scale, [1, 1.2], [6, 12]);
  const trackMargin = useTransform(scale, [1, 1.2], [0, -3]);
  const wrapperOpacity = useTransform(scale, [1, 1.2], [0.7, 1]);
  const leftIconX = useTransform(() =>
    region === "left" ? -overflow.get() / scale.get() : 0,
  );
  const rightIconX = useTransform(() =>
    region === "right" ? overflow.get() / scale.get() : 0,
  );

  const enlarge = () => {
    if (!reduce) animate(scale, 1.2);
  };
  const shrink = () => {
    if (!reduce) animate(scale, 1);
  };

  return (
    <>
      <m.div
        onHoverStart={enlarge}
        onHoverEnd={shrink}
        onTouchStart={enlarge}
        onTouchEnd={shrink}
        style={reduce ? undefined : { scale, opacity: wrapperOpacity }}
        className="flex w-full touch-none select-none items-center justify-center gap-4"
      >
        <m.div
          animate={
            reduce
              ? undefined
              : {
                  scale: region === "left" ? [1, 1.4, 1] : 1,
                  transition: { duration: 0.25 },
                }
          }
          style={reduce ? undefined : { x: leftIconX }}
          className="text-muted"
        >
          {leftIcon}
        </m.div>

        <div
          ref={sliderRef}
          className="relative flex w-full max-w-[200px] flex-grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
        >
          <m.div
            style={
              reduce
                ? undefined
                : {
                    scaleX: trackScaleX,
                    scaleY: trackScaleY,
                    transformOrigin: trackOrigin,
                    height: trackHeight,
                    marginTop: trackMargin,
                    marginBottom: trackMargin,
                  }
            }
            className="flex h-1.5 flex-grow"
          >
            <div className="relative h-full flex-grow overflow-hidden rounded-full bg-surface-hover">
              <div
                className="absolute h-full rounded-full bg-primary"
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </m.div>
        </div>

        <m.div
          animate={
            reduce
              ? undefined
              : {
                  scale: region === "right" ? [1, 1.4, 1] : 1,
                  transition: { duration: 0.25 },
                }
          }
          style={reduce ? undefined : { x: rightIconX }}
          className="text-muted"
        >
          {rightIcon}
        </m.div>
      </m.div>
      {showValue && (
        <p className="-translate-y-4 text-xs font-medium tracking-wide text-muted tabular-nums">
          {Math.round(value)}
        </p>
      )}
    </>
  );
}
