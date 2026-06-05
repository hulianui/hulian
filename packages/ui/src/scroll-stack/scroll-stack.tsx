"use client";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ScrollStackItemProps, ScrollStackProps } from "./scroll-stack.types";

// 吸取自 React Bits ScrollStack：滚动驱动的卡片堆叠效果——卡片随滚动逐张被「钉」在容器顶部，
// 后来的卡片层层压在前一张之上，伴随缩放递进 / 可选旋转 / 景深模糊，形成扑克牌收拢般的纵深感。
//
// 瑚琏化要点：
// 1. 去依赖：原版强依赖 lenis（平滑滚动库）做惯性滚动 + gsap-free 的逐帧 transform。
//    瑚琏版砍掉 lenis，回归原生 overflow-y 滚动 + requestAnimationFrame 节流的 transform 计算，
//    零运行时依赖（浏览器原生平滑滚动已足够，且避免劫持用户滚动惯性带来的可访问性争议）。
// 2. token：卡片皮肤（圆角 / 边框 / 阴影 / 底色）全走瑚琏 token（bg-surface / border-border / shadow-lg），
//    替原版写死的 rgba 阴影与 40px 圆角。
// 3. reduced-motion：useReducedMotion() 命中时跳过逐帧 transform，卡片以静态平铺呈现，
//    且强制关闭 blur（DOM 结构两态完全一致，绝不条件卸载内容）。
// 4. RSC 边界：含 ref/effect/scroll 监听，标 "use client"。
// 5. 卡片识别走 data-scroll-stack-card 属性（替原版的 class 选择器），与瑚琏 token class 不耦合。

/** 单张堆叠卡片。带 data-scroll-stack-card 标记供 ScrollStack 识别并参与堆叠计算。 */
export function ScrollStackItem({ children, itemClassName }: ScrollStackItemProps) {
  return (
    <div
      data-scroll-stack-card
      className={cn(
        "box-border w-full rounded-2xl border border-border bg-surface p-8 shadow-lg",
        "min-h-[16rem]",
        itemClassName,
      )}
    >
      {children}
    </div>
  );
}

interface CardTransform {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
}

export function ScrollStack({
  children,
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
  className,
  style,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef<Map<number, CardTransform>>(new Map());
  const stackCompletedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  const reduceMotion = useReducedMotion();
  const effectiveBlur = reduceMotion ? 0 : blurAmount;

  const parsePercentage = useCallback((value: string, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value) || 0;
  }, []);

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (end <= start) return scrollTop >= end ? 1 : 0;
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    [],
  );

  const updateCardTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    const cards = cardsRef.current;
    if (!scroller || !cards.length) return;

    const scrollTop = scroller.scrollTop;
    const containerHeight = scroller.clientHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endEl = scroller.querySelector<HTMLElement>("[data-scroll-stack-end]");
    const endElementTop = endEl ? endEl.offsetTop : 0;

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = card.offsetTop;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;

      // reduced-motion：保持静态平铺（无缩放/位移/旋转/模糊），但 DOM 不变
      if (reduceMotion) {
        const flat: CardTransform = { translateY: 0, scale: 1, rotation: 0, blur: 0 };
        card.style.transform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
        card.style.filter = "";
        lastTransformsRef.current.set(i, flat);
        return;
      }

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (effectiveBlur) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j++) {
          const jCardTop = cards[j].offsetTop;
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * effectiveBlur);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const next: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const last = lastTransformsRef.current.get(i);
      const changed =
        !last ||
        Math.abs(last.translateY - next.translateY) > 0.1 ||
        Math.abs(last.scale - next.scale) > 0.001 ||
        Math.abs(last.rotation - next.rotation) > 0.1 ||
        Math.abs(last.blur - next.blur) > 0.1;

      if (changed) {
        card.style.transform = `translate3d(0, ${next.translateY}px, 0) scale(${next.scale}) rotate(${next.rotation}deg)`;
        card.style.filter = next.blur > 0 ? `blur(${next.blur}px)` : "";
        lastTransformsRef.current.set(i, next);
      }

      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    parsePercentage,
    calculateProgress,
    stackPosition,
    scaleEndPosition,
    itemStackDistance,
    itemScale,
    baseScale,
    rotationAmount,
    effectiveBlur,
    reduceMotion,
    onStackComplete,
  ]);

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    rafRef.current = requestAnimationFrame(() => {
      updateCardTransforms();
      tickingRef.current = false;
    });
  }, [updateCardTransforms]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-scroll-stack-card]"),
    );
    cardsRef.current = cards;
    const cache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
    });

    updateCardTransforms();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cache.clear();
      tickingRef.current = false;
    };
  }, [itemDistance, updateCardTransforms]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={scrollerRef}
      style={style}
      className={cn(
        "relative h-full w-full overflow-y-auto overflow-x-visible",
        "[overscroll-behavior:contain] [scroll-behavior:smooth]",
        className,
      )}
    >
      <div className="px-4 pb-[40vh] pt-[20vh]">
        {children}
        {/* 末尾占位，让最后一张卡的钉住能干净释放 */}
        <div data-scroll-stack-end aria-hidden className="h-px w-full" />
      </div>
    </div>
  );
}
