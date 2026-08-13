"use client";
import {
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import type { FlipDirection, FlipTextProps } from "./flip-text.types";

// 悬停逐字 3D 翻面的页面标题（#254）。库里 20 多个字效件全是「一次性进场」或「常驻装饰」，
// 缺的是这一档「摸上去它翻一下」的标题交互。
//
// 三处与既有字效件不同的取舍，都是标题场景逼出来的：
//   ① 收 children 不收 text: string —— 标题几乎总是变量（见 .types.ts）。
//   ② as 参与类型推导 —— 它得自己就是那个 h1/h2。
//   ③ 一次性播完，不跟随 hover 状态回退 —— 见下面 handleEnter 的注释。
//
// 实现上刻意**不引 motion**：整件事就是一条 transform 关键帧 + 每字一个 animation-delay，
// 纯 CSS 就够。标题件会出现在几乎每个页面上，为一次悬停彩蛋把动画运行时拖进首屏路径不划算。
// 需要的那点状态（正在播 / 播完了）用一个 useState 就够，故只有 "use client" 这一项成本。

// 每档方向两件事：容器绕哪个轴转（动画类），以及背面静息时摆在哪一侧（背面的静态 transform）。
// 两者互为逆变换：背面先绕轴摆到 ±90°、再沿自身 Z 轴推出半个行高，于是它静息时正好边缘对着
// 观众（投影面积为 0，看不见）；容器转过来的那一刻它恰好落到正面原先的位置上。
//
// 两个面渲染的是同一个字，所以动画**不加 forwards**：一轮播完容器自动回到 0°，从背面切回正面
// 的那一帧观众看不出任何差别。这就是「翻完之后瞬时归零」，不需要额外写一次 set。
const FLIP: Record<FlipDirection, { anim: string; back: string }> = {
  top: {
    anim: "[animation:hulian-text-flip-top_0.5s_ease-in-out]",
    back: "rotateX(90deg) translateZ(0.5lh)",
  },
  bottom: {
    anim: "[animation:hulian-text-flip-bottom_0.5s_ease-in-out]",
    back: "rotateX(-90deg) translateZ(0.5lh)",
  },
  left: {
    anim: "[animation:hulian-text-flip-left_0.5s_ease-in-out]",
    back: "rotateY(-90deg) translateZ(0.5lh)",
  },
  right: {
    anim: "[animation:hulian-text-flip-right_0.5s_ease-in-out]",
    back: "rotateY(90deg) translateZ(0.5lh)",
  },
};

/** 从 children 递归取纯文本：字符串/数字直接取，元素取它的 children，其余（布尔/空/函数子元素）忽略。 */
function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

export function FlipText<E extends ElementType = "span">({
  children,
  direction = "top",
  splitType = "char",
  duration = 0.5,
  stagger = 30,
  as,
  className,
  onMouseEnter,
  ...props
}: FlipTextProps<E>) {
  const Comp = (as ?? "span") as ElementType;
  const [playing, setPlaying] = useState(false);
  // 重入保护走 ref 而不是读 state：同一次渲染里连续两次 mouseenter（指针在字与字之间穿梭时
  // 真的会发生）读到的 state 还是旧值，会重复起一轮把已经在跑的动画拦腰打断。
  const playingRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 卸载保护：标题常出现在列表/详情这类频繁进出的位置，定时器不清会在卸载后 setState。
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const text = textOf(children);
  // word：按空白切并保留分隔（capture group），char：Array.from 按码点切（中文/emoji 安全）。同 SplitText。
  const segments = splitType === "word" ? text.split(/(\s+)/) : Array.from(text);

  const handleEnter = (event: MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event);
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    // 一轮 = 单字时长 + 最后一个字的错峰。播完就撤动画类，**不跟随 hover 状态**：
    // 跟随的话指针中途划走会把翻到一半的字停在斜面上，那一帧是能看出来的；而播完再撤，
    // 容器已经转到 ±90°（背面正对观众）、与 0° 的正面渲染完全一致，撤下去无痕。
    timer.current = setTimeout(
      () => {
        playingRef.current = false;
        setPlaying(false);
      },
      duration * 1000 + stagger * Math.max(segments.length - 1, 0),
    );
  };

  return (
    <Comp
      aria-label={text || undefined}
      className={className}
      onMouseEnter={handleEnter}
      {...props}
    >
      {/* 取不出文字（children 只有图标之类）就不切，原样渲染——否则整段内容会凭空消失。 */}
      {text === ""
        ? children
        : segments.map((seg, i) => {
            if (seg === "") return null;
            if (/^\s+$/.test(seg)) {
              // 纯空白段不参与翻转，按原样保留排版宽度
              return (
                <span key={i} aria-hidden className="whitespace-pre">
                  {seg}
                </span>
              );
            }
            return (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "relative inline-block [transform-style:preserve-3d]",
                  playing && FLIP[direction].anim,
                  // 动画写在 class 里而不是内联 style，就是为了这一条能压住它：
                  // 内联样式的优先级高于类，动画一旦内联，减弱动效偏好就永远关不掉。
                  "motion-reduce:[animation:none]",
                )}
                // 时长与错峰是每个字不同的值，只能内联；它们是 longhand，压不住上面那条
                // `animation: none`（那条把 animation-name 清成 none，没有名字就没有动画）。
                style={{ animationDuration: `${duration}s`, animationDelay: `${i * stagger}ms` }}
              >
                <span className="block [backface-visibility:hidden]">{seg}</span>
                {/* 背面那个字**不进 DOM 文本**，靠伪元素 content: attr() 承载（规则在 preset-core.css）。
                    写成真节点的话它就是同一个字的第二份拷贝，h1 的 textContent 会变成「状状态态」——
                    框选复制、爬虫读到的标题、任何按 textContent 取值的地方全被污染。这是标题件不能忍的。 */}
                <span
                  data-hulian-flip-back={seg}
                  className="absolute inset-0 [backface-visibility:hidden]"
                  style={{ transform: FLIP[direction].back }}
                />
              </span>
            );
          })}
    </Comp>
  );
}
