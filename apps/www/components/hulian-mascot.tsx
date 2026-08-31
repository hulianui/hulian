"use client";
import { useEffect, useState } from "react";
import { cn } from "@hulianui/ui";

/**
 * 瑚琏「器灵」—— 站点品牌 IP。
 *
 * 它不是新造的吉祥物，就是 `public/logo.svg` 那只双耳簋本身长了眼睛：**同一套 19×19 网格、
 * 同一个 60px 格距、同样 crispEdges**，所以 logo 与器灵之间可以无缝互变，站上不会出现两套打架的视觉。
 * 器型逐格来自 logo.svg，`hulian-mascot.test.tsx` 会读那个文件比对，改了 logo 而没同步这里就会红。
 *
 * 三个刻意的取舍：
 * 1. **眼睛是挖空，不是黑块。** 整只器是一条 `fill="currentColor"` 的 path，眼睛靠
 *    `fill-rule="evenodd"` 自然成洞 —— 于是亮/暗主题、任意底色、任意 text-* 颜色都自适应，
 *    不需要 mask、不需要 useId、SSR 安全。若把眼睛画成实心黑块，暗色主题下就是一坨死黑。
 * 2. **不用 AI 出的位图。** 定形阶段用百炼探了姿态与表情（眼睛落在器腹、闭眼是横线+睫毛、
 *    zZ 与方块当配件），但位图进不了站点：体积大、不跟主题变色、不能被交互驱动。
 *    最终形态是这份几十字节的网格数据。
 * 3. **动效全部可降级。** 浮动/眨眼/上升都挂在 `.hl-mascot-*` 上，
 *    `prefers-reduced-motion: reduce` 时整体停在静止帧（见 globals.css）。
 */

// ── 器身：与 apps/www/public/logo.svg 逐格同构（第 0 行对应网格 y=3）──
const BODY_TOP = 3;
const BODY = [
  "....###########....", // 3  口沿
  "....###########....", // 4
  "......#######......", // 5  束颈
  "..#.###########.#..", // 6  器腹 + 双耳
  ".#################.", // 7
  ".#################.", // 8
  "..#.###########.#..", // 9
  ".....#########.....", // 10
  ".......#####.......", // 11 束腰
  ".....#########.....", // 12 圈足
  ".....#########.....", // 13
  "......#######......", // 14
] as const;

export const GRID = 19;
export const CELL = 60; // 与 logo.svg 一致：19 × 60 = 1140

type Cell = readonly [number, number];

/** 器腹中心列是 9，两只眼对称落在 7 / 11。睁眼 1 格宽 2 格高，小尺寸下最耐缩。 */
const EYES: Record<string, readonly Cell[]> = {
  open: [
    [7, 7],
    [7, 8],
    [11, 7],
    [11, 8],
  ],
  // 闭眼摊平成 3 格横线：比睁眼宽一档，才读得出「合上了」而不是「变小了」
  closed: [
    [6, 8],
    [7, 8],
    [8, 8],
    [10, 8],
    [11, 8],
    [12, 8],
  ],
  // ^ ^：外侧两格低、中间一格高
  happy: [
    [6, 8],
    [7, 7],
    [8, 8],
    [10, 8],
    [11, 7],
    [12, 8],
  ],
};

/**
 * 配件活在器身上方的空区。
 * 口沿只占 cols 4–14，所以 col 15–18 在 row 3 也是空的 —— Z 借这一列多拿一行，
 * 做成标准 4×4。先前的 3×3 版本只有器身宽度的 1/6，在 96px 下读成一根小柱子而不是 Z。
 */
const ZZZ: readonly Cell[] = [
  [15, 0],
  [16, 0],
  [17, 0],
  [18, 0],
  [17, 1],
  [16, 2],
  [15, 3],
  [16, 3],
  [17, 3],
  [18, 3],
];
/**
 * 「上菜」的三块积木：瑚琏之器盛的是组件。
 *
 * 三条几何约束都是被截图推翻过一次才定下来的：
 * · 每块 3×2 格 —— 1×1 在真实使用尺寸下就是一粒灰尘，看不见等于没做。
 * · 全部落在 row 0–1，**空出 row 2** —— 贴着 row 3 的口沿排会读成王冠，不是「端出来的东西」。
 * · 横跨 col 4–14，与口沿同宽区间、等距三分 —— 中心列落在 9，与器身对称轴一致。
 */
const BLOCKS: readonly (readonly Cell[])[] = [4, 8, 12].map((x0) => [
  [x0, 0],
  [x0 + 1, 0],
  [x0 + 2, 0],
  [x0, 1],
  [x0 + 1, 1],
  [x0 + 2, 1],
]);

export type MascotMood = "idle" | "blink" | "happy" | "wink" | "sleep" | "serve";

const EYES_FOR: Record<MascotMood, readonly Cell[]> = {
  idle: EYES.open!,
  blink: EYES.closed!,
  happy: EYES.happy!,
  // 单边闭：左眼横线 + 右眼睁着
  wink: [...EYES.closed!.slice(0, 3), ...EYES.open!.slice(2)],
  sleep: EYES.closed!,
  serve: EYES.open!,
};

function bodyCells(): Cell[] {
  const out: Cell[] = [];
  BODY.forEach((row, i) => {
    [...row].forEach((ch, x) => {
      if (ch === "#") out.push([x, i + BODY_TOP]);
    });
  });
  return out;
}

/** 每格一个闭合子路径；配 fill-rule=evenodd，落在器身内的格子自动变成洞。 */
export function cellsToPath(cells: readonly Cell[]): string {
  return cells
    .map(([x, y]) => `M${x * CELL} ${y * CELL}h${CELL}v${CELL}h${-CELL}Z`)
    .join("");
}

const BODY_CELLS = bodyCells();

export interface HulianMascotProps {
  /** 表情。`idle` 下会自动眨眼（见 `blinking`）。 */
  mood?: MascotMood;
  /**
   * 是否自动眨眼。默认 true，但只在 `mood="idle"` 时生效；
   * `prefers-reduced-motion: reduce` 下自动关闭（不是减速，是不眨）。
   */
  blinking?: boolean;
  /** 整体上下浮动。默认 true，同样受 reduced-motion 收敛。 */
  floating?: boolean;
  /**
   * 收紧 viewBox 到内容包围盒。
   *
   * 默认（false）与 `logo.svg` 共用 19×19 的完整坐标系 —— 两者可以互相替换、日后也能做
   * logo↔器灵的形变。代价是底部 row 15–18 永远是空的：**同样的盒子里器灵只有 ~79% 高**，
   * 而且视觉重心偏上。当图标槽、空态插画这类「按盒子给尺寸」的场合，传 `tight`。
   *
   * 收紧后仍是**所有表情共用的同一个框**（含配件所在的 row 0–2），
   * 所以在原地切表情时不会忽大忽小。
   */
  tight?: boolean;
  /**
   * 无障碍名。给了就渲染成 `role="img"` 并带 `<title>`；
   * 不给则视为纯装饰 `aria-hidden` —— 器灵旁边通常已经有文案，重复播报只会吵。
   */
  title?: string;
  className?: string;
}

/**
 * 收紧后的 viewBox：横跨 col 1–18（左耳最外沿 … zZ 最右列），纵跨 row 0–14
 * （配件顶 … 圈足底）。所有表情共用这一个框，切表情不会跳尺寸。
 */
const TIGHT_VIEW_BOX = `${1 * CELL} 0 ${18 * CELL} ${15 * CELL}`;
const FULL_VIEW_BOX = `0 0 ${GRID * CELL} ${GRID * CELL}`;

export function HulianMascot({
  mood = "idle",
  blinking = true,
  floating = true,
  tight = false,
  title,
  className,
}: HulianMascotProps) {
  const [blinkNow, setBlinkNow] = useState(false);

  useEffect(() => {
    if (!blinking || mood !== "idle") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const schedule = () => {
      // 眨眼不能等距 —— 等距会读成机械闪烁而不是活物。2.4~5s 随机。
      timer = window.setTimeout(() => {
        setBlinkNow(true);
        timer = window.setTimeout(() => {
          setBlinkNow(false);
          schedule();
        }, 120);
      }, 2400 + Math.random() * 2600);
    };
    schedule();
    return () => {
      window.clearTimeout(timer);
      setBlinkNow(false);
    };
  }, [blinking, mood]);

  const effective: MascotMood = mood === "idle" && blinkNow ? "blink" : mood;
  const d = cellsToPath([...BODY_CELLS, ...EYES_FOR[effective]]);
  const decorative = title == null;

  return (
    <svg
      viewBox={tight ? TIGHT_VIEW_BOX : FULL_VIEW_BOX}
      shapeRendering="crispEdges"
      className={cn("block size-full", floating && "hl-mascot-float", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      focusable="false"
    >
      {title == null ? null : <title>{title}</title>}
      <path d={d} fill="currentColor" fillRule="evenodd" />
      {effective === "sleep" ? (
        <path className="hl-mascot-zzz" d={cellsToPath(ZZZ)} fill="currentColor" opacity={0.55} />
      ) : null}
      {effective === "serve"
        ? BLOCKS.map((block, i) => (
            <path
              key={`${block[0]![0]}-${block[0]![1]}`}
              className={`hl-mascot-block hl-mascot-block-${i + 1}`}
              d={cellsToPath(block)}
              fill="currentColor"
            />
          ))
        : null}
    </svg>
  );
}
