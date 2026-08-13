"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { TextRevealProps } from "./text-reveal.types";

// 循环揭示扫光（#255）。库里 20 多个字效件按用途只有一类——**一次性进场**（滚入视口播一次就静），
// 缺的是另一类：**持续循环、表示「这件事正在进行」**的状态文字（「OCR 中」「解析中」「归档中」）。
// 差别不在参数而在用途：进场动画播完就没了，而「进行中」的动画**停下来本身就是错误信号**，
// 用户是靠它还在动来判断后台任务没死。
//
// 与 AnimatedShinyText 的分界：那件是在**已经可见**的文字上加一道单色高光；本件是把文字从
// transparent **揭示**成 textColor，色带可配。两件事叠在一个组件里会让「加高光」与「揭示」
// 两种语义打架，所以另起一件（这也是 issue 里 ① / ② 两条建议中我们选 ① 的理由）。

// 一整条渐变是元素宽的 3 倍，窗口（元素本身）在它上面从右滑到左：
//   image  [0 ────── 34% 已揭示(textColor) ── 40%~60% 色带 ── 66% ────── 100% 未揭示(transparent)]
//   起点 background-position: 100% → 窗口落在最右 1/3 → 整串透明（未揭示）
//   终点 background-position: 0    → 窗口落在最左 1/3 → 整串 textColor（全部揭示）
// 三个数值不是随手取的：色带两端必须落在 (33.3%, 66.7%) 之内，否则起点/终点的窗口里会漏进
// 一截色带，表现为「还没开始扫，左边就已经有颜色了」。
const REVEALED_END = 34;
const BAND_START = 40;
const BAND_END = 60;
const UNREVEALED_START = 66;

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function sweepGradient(colors: string[], textColor: string): string {
  const span = BAND_END - BAND_START;
  const band = colors.map((color, i) => {
    const at = colors.length === 1 ? (BAND_START + BAND_END) / 2 : BAND_START + (span * i) / (colors.length - 1);
    return `${color} ${at}%`;
  });
  return `linear-gradient(90deg, ${textColor} 0%, ${textColor} ${REVEALED_END}%, ${band.join(", ")}, transparent ${UNREVEALED_START}%, transparent 100%)`;
}

export function TextReveal({
  text,
  colors = DEFAULT_COLORS,
  textColor = "var(--color-foreground)",
  duration = 2,
  repeat = false,
  startOnView = true,
  once = true,
  className,
  style,
  ...props
}: TextRevealProps) {
  const items = Array.isArray(text) ? text : [text];
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(!startOnView);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!startOnView) {
      setStarted(true);
      return;
    }
    const el = ref.current;
    // 没有 IntersectionObserver（老环境 / 测试环境）就直接开扫：宁可早扫一轮，
    // 也不要让文字卡在「未揭示」= 透明 = 看不见的状态上。
    if (!el || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          if (once) io.disconnect();
        } else if (!once) {
          setStarted(false);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startOnView, once]);

  // 重新开扫时把进度拨回 0。只切 play-state 是「从暂停处继续」——`once={false}` 第二次滚回视口
  // 会从上一轮停下的地方接着扫，而不是重新扫一遍。
  //
  // 为什么不换 key 把扫光节点重挂（那是更直觉的写法）：被观察的就是这个节点，重挂之后
  // IntersectionObserver 仍盯着已经卸载的旧节点，于是第三次进出视口就再也不触发了 —— 而且
  // 这种坏法在测试里是**看不见**的（假的 observer 直接调回调，根本不看观察的是谁）。
  // 拨进度不动节点，观察对象自始至终是同一个。
  useEffect(() => {
    if (!started) return;
    // subtree：多串轮换时跑动画的是子节点，不是根。getAnimations 自带样式刷新，
    // 所以这一帧刚挂上的动画取得到。
    for (const animation of ref.current?.getAnimations?.({ subtree: true }) ?? []) {
      animation.currentTime = 0;
    }
  }, [started]);

  // 动画写在 class 里而不是内联 style：内联优先级高于类，一旦内联，`motion-reduce` 就永远关不掉。
  // fill-mode 取 both 是这件事成立的关键——
  //   · 未开扫（paused 在第 0 帧）：显示 from = 整串透明
  //   · 扫完（不 repeat）：停在 to = 整串已揭示
  //   · 减弱动效（animation: none）：动画整条不存在，落回**静态** background-position(0 0)，
  //     也就是整串 textColor。issue 里说的「关掉动画后字是 transparent 会整串消失」在这个
  //     结构下不可能发生，不需要 JS 兜底把 sweep 位置 set 到终点。
  const animation = cn(
    repeat
      ? "[animation:hulian-text-reveal_var(--hulian-reveal-duration,2s)_linear_infinite_both]"
      : "[animation:hulian-text-reveal_var(--hulian-reveal-duration,2s)_linear_both]",
    !started && "[animation-play-state:paused]",
    "motion-reduce:[animation:none]",
  );

  const sweepClass = cn("bg-clip-text text-transparent bg-no-repeat", animation);
  const sweepStyle = {
    "--hulian-reveal-duration": `${duration}s`,
    backgroundImage: sweepGradient(colors, textColor),
    backgroundSize: "300% 100%",
  } as CSSProperties;

  const active = items[index % items.length] ?? "";
  const onAnimationIteration =
    items.length > 1 ? () => setIndex((i) => (i + 1) % items.length) : undefined;

  if (items.length === 1) {
    return (
      <span
        ref={ref}
        className={cn(sweepClass, className)}
        style={{ ...sweepStyle, ...style }}
        {...props}
      >
        {active}
      </span>
    );
  }

  // 多串轮换：所有串叠进同一个网格单元，容器宽度自然等于最宽那串的宽度，换串不跳。
  // 不用「克隆 ghost 节点量宽度再 animate 宽度」那条路——那要读 DOM、要在字体加载完后重量，
  // 而这里 CSS 自己就能算出最大值。
  return (
    <span ref={ref} className={cn("inline-grid", className)} style={style} {...props}>
      {items.map((item, i) =>
        i === index ? (
          <span
            key={i}
            className={cn("[grid-area:1/1]", sweepClass)}
            style={sweepStyle}
            onAnimationIteration={onAnimationIteration}
          >
            {item}
          </span>
        ) : (
          // 占位串只撑宽度：文字挂在 data 属性上由伪元素渲染（规则在 preset-core.css），
          // 不进 DOM 文本 —— 否则这个状态标签的 textContent 会是三个阶段名连在一起。
          <span key={i} aria-hidden data-hulian-ghost-text={item} className="invisible [grid-area:1/1]" />
        ),
      )}
    </span>
  );
}
