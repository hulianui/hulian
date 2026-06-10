"use client";
import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { CardSwapEasing, CardSwapProps } from "./card-swap.types";

// 吸取自 React Bits CardSwap：一摞 3D 透视卡片自动轮换——最前卡片向下坠落，
// 其余卡片逐级向前递进，坠落卡再绕回队尾，循环往复，营造「卡片洗牌」纵深感。
//
// 瑚琏化要点：
// 1. 去 gsap 依赖：用 motion 的 useAnimate（imperative scope）重写原 gsap 时间线
//    （drop → promote 错峰 → return），三段时序与 promoteOverlap/returnDelay 一一对应。
// 2. 缓动改吃 motion 内置 spring / easeInOut（elastic→弹性 spring，smooth→顺滑），不引外部缓动表。
// 3. token：卡片缺省皮肤用 bg-surface / border-border / text-foreground 语义 token，替原始写死 #000/#fff。
// 4. reduced-motion：不轮换、直接把每张卡静置于初始堆叠槽位（DOM 两态一致，仅去动效）。
// 5. RSC 不安全（用 ref / useAnimate / 定时器）→ "use client"。
// 6. 每张卡由组件自有的定位 wrapper 承载（ref / 宽高 / 居中负 margin / 动画都打在 wrapper 上），
//    children 可以是任意元素（包括不转发 ref 的包装组件）——不再用 cloneElement 注 ref，
//    否则 children 一旦是函数组件包装层，ref 全空 → 初始落位与轮换静默失效（曾发生）。
// 7. placement="center"：原版右下锚定 + 5%/18% 外溢是营销页贴边设计，在画廊/普通容器里
//    会被裁掉大半；center 模式按错位距离计算整摞包围盒、把堆叠完整居中框进容器。
// 8. children 先递归展开 Fragment：用户惯用 <>…</> 包多张卡，而 Children.toArray 不拆
//    Fragment——不展开则 total=1，`total < 2` 门控直接退出，轮换静默全灭（曾发生）。
// 9. motion v12 已知行为：动画被中断（同元素同值的新 animate / scope stop）时，其
//    finished promise 永不 settle（JSAnimation.stop→teardown 不调 notifyFinished）。
//    纯 await 链会被吊死 → 每段动画都套 raceTimeout 兜底；并加 in-flight 守卫，
//    防 delay < 三段总时长时下一轮 swap 中断上一轮（中断即吊死 + 视觉撕裂）。

/** 单张卡片：填满所属槽位 + 3D 保留 + 默认瑚琏皮肤，可被 className 覆盖。 */
export const CardSwapCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardSwapCard({ className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        {...rest}
        style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden", ...style }}
        className={cn(
          "h-full w-full rounded-xl border border-border bg-surface text-foreground",
          className,
        )}
      />
    );
  },
);

/** 槽位几何：第 i 张卡片在堆叠中的 X/Y/Z 偏移与层级（与原始 makeSlot 对齐）。 */
function makeSlot(i: number, distX: number, distY: number, total: number) {
  return {
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i,
  };
}

interface EasingConfig {
  type: "spring" | "tween";
  durDrop: number;
  durMove: number;
  durReturn: number;
  promoteOverlap: number;
  returnDelay: number;
}

function easingConfig(easing: CardSwapEasing): EasingConfig {
  return easing === "elastic"
    ? { type: "spring", durDrop: 0.9, durMove: 0.9, durReturn: 0.9, promoteOverlap: 0.9, returnDelay: 0.05 }
    : { type: "tween", durDrop: 0.55, durMove: 0.55, durReturn: 0.55, promoteOverlap: 0.45, returnDelay: 0.2 };
}

/** 递归展开 Fragment：<>…</> 包裹的多张卡也要数成多个 children（见文件头注释 8）。 */
function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flattenChildren((child.props as { children?: ReactNode }).children)
      : [child],
  );
}

/**
 * await 一段 motion 动画，但以超时兜底：被中断的动画 finished promise 永不 settle
 * （motion v12 JSAnimation/NativeAnimation 的 stop() 均不 notifyFinished），
 * 纯 await 会把整条 swap 链吊死、order 永不轮转（见文件头注释 9）。
 */
function settle(animation: PromiseLike<unknown>, capSeconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, capSeconds * 1000);
    void Promise.resolve(animation).then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      () => {
        clearTimeout(timer);
        resolve();
      },
    );
  });
}

/** 弹性 spring 不吃 duration（物理参数优先），真实安定 ~1.1s；超时上限统一加冗余。 */
const SETTLE_MARGIN = 2;

function CardSwapRoot({
  width = 380,
  height = 280,
  cardDistance = 56,
  verticalDistance = 64,
  delay = 5000,
  pauseOnHover = false,
  skewAmount = 5,
  easing = "elastic",
  placement = "bottom-right",
  onCardClick,
  children,
  className,
  style,
}: CardSwapProps) {
  const reduced = useReducedMotion();
  const [scope, animate] = useAnimate();
  const config = useMemo(() => easingConfig(easing), [easing]);

  const childArr = useMemo(() => flattenChildren(children), [children]);
  const total = childArr.length;

  // refs 数量随卡片数变化重建；存放每张卡片 DOM。
  const refs = useMemo(
    () => childArr.map(() => ({ current: null as HTMLDivElement | null })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total],
  );
  // 当前堆叠顺序（队首=最前卡片的原始索引）。
  const order = useRef<number[]>([]);

  const motionTransition = useMemo(
    () =>
      config.type === "spring"
        ? ({ type: "spring" as const, stiffness: 180, damping: 14, mass: 1 })
        : ({ type: "tween" as const, ease: "easeInOut" as const }),
    [config.type],
  );

  useEffect(() => {
    if (total === 0) return;
    order.current = Array.from({ length: total }, (_, i) => i);

    // 初始落位：每张卡片静置于其堆叠槽位（居中靠负 margin，故 x/y/z 交给 motion 独立驱动）。
    refs.forEach((r, i) => {
      const el = r.current;
      // Offscreen/StrictMode 被动效果重连时 r.current 可能指向已脱档节点（el 真但 el.style undefined），
      // 故须连 .style 一并把守，避免 reconnectPassiveEffects 路径下崩溃。
      if (!el?.style) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, total);
      void animate(el, { x: slot.x, y: slot.y, z: slot.z, skewY: skewAmount }, { duration: 0 });
      el.style.zIndex = String(slot.zIndex);
    });

    // reduced-motion：不轮换，保持初始堆叠（DOM 两态一致）。
    if (reduced || total < 2) return;

    let cancelled = false;
    // in-flight 守卫：上一轮三段还没走完时跳过本次 tick，避免同元素动画互相中断
    //（中断方造成被中断方 promise 吊死 + 前卡半路被拽走的视觉撕裂）。
    let swapping = false;

    const swap = async () => {
      if (cancelled || swapping || order.current.length < 2) return;
      const [front, ...rest] = order.current;
      const elFront = refs[front]?.current;
      if (!elFront?.style) return;
      swapping = true;
      try {
        const frontBaseSlot = makeSlot(0, cardDistance, verticalDistance, total);

        // ① drop：最前卡片向下坠落 500px（仅叠加 Y 偏移，X/Z/skew 不变）。
        await settle(
          animate(
            elFront,
            { y: frontBaseSlot.y + 500 },
            { ...motionTransition, duration: config.durDrop },
          ),
          config.durDrop + SETTLE_MARGIN,
        );
        if (cancelled) return;

        // ② promote：其余卡片逐级向前递进，错峰 0.06s 制造层叠波纹。
        await Promise.all(
          rest.map((idx, i) => {
            const el = refs[idx]?.current;
            if (!el?.style) return Promise.resolve();
            const slot = makeSlot(i, cardDistance, verticalDistance, total);
            el.style.zIndex = String(slot.zIndex);
            return settle(
              animate(
                el,
                { x: slot.x, y: slot.y, z: slot.z },
                { ...motionTransition, duration: config.durMove, delay: i * 0.06 },
              ),
              config.durMove + i * 0.06 + SETTLE_MARGIN,
            );
          }),
        );
        if (cancelled) return;

        // ③ return：坠落卡片绕回队尾槽位。
        const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
        elFront.style.zIndex = String(backSlot.zIndex);
        await settle(
          animate(
            elFront,
            { x: backSlot.x, y: backSlot.y, z: backSlot.z },
            { ...motionTransition, duration: config.durReturn },
          ),
          config.durReturn + SETTLE_MARGIN,
        );
        if (cancelled) return;

        order.current = [...rest, front];
      } finally {
        swapping = false;
      }
    };

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      void swap();
      timer = setInterval(() => void swap(), delay);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    start();

    const node = scope.current as HTMLDivElement | null;
    if (pauseOnHover && node) {
      const onEnter = () => stop();
      const onLeave = () => {
        if (!timer) start();
      };
      node.addEventListener("mouseenter", onEnter);
      node.addEventListener("mouseleave", onLeave);
      return () => {
        cancelled = true;
        stop();
        node.removeEventListener("mouseenter", onEnter);
        node.removeEventListener("mouseleave", onLeave);
      };
    }

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, reduced]);

  // 槽位 wrapper 归组件所有：ref / 宽高 / 负 margin 居中 / 点击回调全打在 wrapper 上，
  // children 可以是任意元素（含不转发 ref 的包装组件），动画驱动不依赖 children 配合。
  const rendered = childArr.map((child, i) => (
    <div
      key={i}
      ref={(node: HTMLDivElement | null) => {
        refs[i].current = node;
      }}
      className="absolute left-1/2 top-1/2 [will-change:transform]"
      // 负 margin 完成自居中（left/top 50% + 负半宽高），把 x/y/z/skew 留给 motion 独立驱动。
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      onClick={() => onCardClick?.(i)}
    >
      {child}
    </div>
  ));

  // center 模式：整摞包围盒（卡片中心散布在 0..spreadX / 0..-spreadY）平移回容器正中。
  const spreadX = Math.max(0, total - 1) * cardDistance;
  const spreadY = Math.max(0, total - 1) * verticalDistance;
  const centerTransform = `translate(calc(-50% - ${spreadX / 2}px), calc(-50% + ${spreadY / 2}px))`;

  return (
    <div
      ref={scope}
      className={cn(
        "[perspective:900px]",
        placement === "center"
          ? "absolute left-1/2 top-1/2"
          : "absolute bottom-0 right-0 origin-bottom-right [transform:translate(5%,18%)]",
        className,
      )}
      style={{
        width,
        height,
        ...(placement === "center" ? { transform: centerTransform } : null),
        ...style,
      }}
    >
      {rendered}
    </div>
  );
}

/**
 * 卡片洗牌组件——一摞 3D 透视卡片自动轮换。
 * 复合用法：<CardSwap.Card> 为带默认皮肤的单卡片（也可传任意元素）。
 */
export const CardSwap = Object.assign(CardSwapRoot, { Card: CardSwapCard });
