import {
  Children,
  Fragment,
  isValidElement,
  memo,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import type {
  DescriptionsAlign,
  DescriptionsItemData,
  DescriptionsItemProps,
  DescriptionsProps,
  DescriptionsSize,
} from "./descriptions.types";

// 递归收集 DescriptionsItem 子节点的 props。
// 关键：Children.toArray 不会展开 Fragment（<>...</> 会被当成单个节点），
// 必须手动下钻，否则 Fragment 包裹的多个 item 会被误并成一格（label 丢失、值全挤一起）。
function collectItems(children: ReactNode): DescriptionsItemData[] {
  const out: DescriptionsItemData[] = [];
  Children.toArray(children).forEach((c) => {
    if (!isValidElement(c)) return;
    const el = c as ReactElement<DescriptionsItemProps>;
    if (el.type === Fragment) {
      out.push(...collectItems((el.props as { children?: ReactNode }).children));
      return;
    }
    out.push({ label: el.props.label, children: el.props.children, span: el.props.span });
  });
  return out;
}

// 纯皮肤 + CSS Grid 布局（零 Base UI、零浮层、零依赖，纯静态可 RSC，照 breadcrumb/badge 范式）：
// 详情页键值对。数据源二选一——items 数组 prop 优先，否则读 DescriptionsItem 子节点的 props。
// 全吃语义 token：label=text-muted-foreground / value=text-foreground / border=border-border，明暗自适配。

// ─────────────────────────────────────────────────────────────────────────────
// 为什么 horizontal 是「外层栅格开键/值两条轨道 + 每项 subgrid」而不是「每项自己 flex」
//
// 每项各自 flex 时，键的宽度由**这一格自己的文字**决定：一张表里「昵称」和「小程序绑定门店」
// 会算出两个宽度，于是同一列上下行的值参差不齐 —— 这正是 <table> 布局天然没有、而我们此前
// 有的毛病。改成外层按「键列 值列」成对开轨道、每项用 subgrid 借用父轨道之后，键列宽度由
// 整表最长的那个键名统一决定，逐列对齐是布局本身的结果，不需要消费方去猜一个宽度值。
//
// 仍然保留每项一层 wrapper（而不是把键/值直接铺成栅格子项）：跨列项在窄容器里要整项退成
// 整行（下面的 col-[1/-1]），没有 wrapper 的话键会被留在上一行、值单独换行。
// ─────────────────────────────────────────────────────────────────────────────

// 列数按**容器宽度**降档（照 pro-form 的判据：详情页常被塞进抽屉/分栏，视口断点在那里是
// 错的判据 —— 视口很宽而这块只有 380px）。用不重叠的区间而不是层层覆盖的 max-*：
// 区间写法与样式表里的先后顺序无关，不必赌 Tailwind 怎么排变体。
const HORIZONTAL_TRACKS = "grid-cols-[repeat(var(--hl-desc-cols),var(--hl-desc-label)_minmax(0,1fr))]";
const VERTICAL_TRACKS = "grid-cols-[repeat(var(--hl-desc-cols),minmax(0,1fr))]";
const COLLAPSE = {
  horizontal: [
    "@max-lg:grid-cols-[var(--hl-desc-label)_minmax(0,1fr)]",
    "@lg:@max-3xl:grid-cols-[repeat(2,var(--hl-desc-label)_minmax(0,1fr))]",
    "@3xl:@max-5xl:grid-cols-[repeat(3,var(--hl-desc-label)_minmax(0,1fr))]",
  ],
  vertical: [
    "@max-lg:grid-cols-[minmax(0,1fr)]",
    "@lg:@max-3xl:grid-cols-[repeat(2,minmax(0,1fr))]",
    "@3xl:@max-5xl:grid-cols-[repeat(3,minmax(0,1fr))]",
  ],
} as const;
// 每一档降到几列（与上面三条区间一一对应）
const COLLAPSE_COLUMNS = [1, 2, 3] as const;
// 跨列项在某一档放不下时整项退成整行。不这么做的话它会按 span 去占并不存在的轨道，
// 栅格会凭空长出隐式列，整张表跟着错位。
const SPAN_FULL_ROW = [
  "@max-lg:col-[1/-1]",
  "@lg:@max-3xl:col-[1/-1]",
  "@3xl:@max-5xl:col-[1/-1]",
] as const;

const CELL_PADDING: Record<DescriptionsSize, string> = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
};
const PLAIN_ROW_PADDING: Record<DescriptionsSize, string> = { sm: "py-1", md: "py-1.5" };

const ALIGN_ITEMS: Record<DescriptionsAlign, string> = {
  baseline: "items-baseline",
  start: "items-start",
  center: "items-center",
};
// 表格态的对齐落在**格子内部**而不是格子之间：格子本身必须撑满整行高度，
// 否则键那格的底色只包住文字、行一高就露出半截。
const BORDERED_ALIGN: Record<Exclude<DescriptionsAlign, "baseline">, string> = {
  start: "items-start",
  center: "items-center",
};

/** 值是不是「空」。数字 0 是事实值（0 条记录），不算空。 */
function isEmptyValue(value: ReactNode): boolean {
  return value == null || value === "" || value === false;
}

// DescriptionsItem 仅作数据载体：由父级 Descriptions 读取其 props 渲染；单独渲染时降级显示内容。
export function DescriptionsItem({ children }: DescriptionsItemProps) {
  return <>{children}</>;
}

function DescriptionsImpl({
  title,
  extra,
  column = 3,
  layout = "horizontal",
  bordered = false,
  size = "md",
  labelWidth,
  emptyText = "—",
  align,
  items,
  className,
  children,
  ...props
}: DescriptionsProps) {
  // 归一化数据源：items 数组 prop 优先，否则下钻 DescriptionsItem 子节点（含 Fragment 展开）
  const data: DescriptionsItemData[] = items ?? collectItems(children);

  const vertical = layout === "vertical";

  // 表格态里 baseline 是做不到的：键那格要撑满行高才能让底色成立，而 align-self: baseline
  // 与 stretch 互斥。静默无效比报错更难查（同 Button 的 muted、Textarea 的 resize），所以点名。
  if (bordered && align === "baseline") {
    warnOnce(
      "descriptions-baseline-on-bordered",
      `[hulian] Descriptions: align="baseline" 在 bordered 表格态下无效（键格要撑满行高，` +
        `底色才不会只包住文字），已按 "start" 处理。要基线对齐请去掉 bordered。`,
    );
  }
  const resolvedAlign: DescriptionsAlign = align ?? (bordered ? "start" : "baseline");
  const borderedAlign = resolvedAlign === "baseline" ? "start" : resolvedAlign;

  const gridStyle = {
    "--hl-desc-cols": column,
    "--hl-desc-label":
      typeof labelWidth === "number" ? `${labelWidth}px` : (labelWidth ?? "max-content"),
  } as CSSProperties;

  return (
    // @container：降档判据是这块**自己的宽度**，所以容器上下文必须由组件自己建立，
    // 不能指望消费方在外面套一个。
    <div className={cn("@container w-full text-sm", className)} {...props}>
      {(title != null || extra != null) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title != null ? (
            <div className="text-base font-medium text-foreground">{title}</div>
          ) : (
            <span />
          )}
          {extra != null ? <div className="text-muted-foreground">{extra}</div> : null}
        </div>
      )}

      <div
        data-slot="descriptions-grid"
        style={gridStyle}
        className={cn(
          "grid",
          vertical ? VERTICAL_TRACKS : HORIZONTAL_TRACKS,
          // 只挂「比当前列数更窄」的那几档：column=2 时不该出现 3 列的中间态。
          (vertical ? COLLAPSE.vertical : COLLAPSE.horizontal).filter(
            (_, i) => COLLAPSE_COLUMNS[i]! < column,
          ),
          !bordered && !vertical && "gap-x-2",
          !bordered && vertical && "gap-x-6",
          bordered &&
            "overflow-hidden rounded-[var(--radius)] border-t border-l border-border",
        )}
      >
        {data.map((item, i) => {
          const span = Math.min(Math.max(item.span ?? 1, 1), column);
          const hasLabel = item.label != null;
          const value = isEmptyValue(item.children) ? emptyText : item.children;

          return (
            <div
              key={i}
              style={{
                // horizontal 一项占「span 个键/值对」＝ 2×span 条轨道
                gridColumn: `span ${vertical ? span : span * 2} / span ${vertical ? span : span * 2}`,
              }}
              className={cn(
                "min-w-0",
                // 放不下的档位退成整行（见 SPAN_FULL_ROW 注释）
                SPAN_FULL_ROW.filter((_, i) => COLLAPSE_COLUMNS[i]! < span),
                bordered
                  ? cn(
                      "border-r border-b border-border",
                      vertical ? "flex flex-col" : "grid grid-cols-subgrid",
                    )
                  : vertical
                    ? cn("flex flex-col gap-1", PLAIN_ROW_PADDING[size])
                    : cn(
                        "grid grid-cols-subgrid",
                        ALIGN_ITEMS[resolvedAlign],
                        PLAIN_ROW_PADDING[size],
                      ),
              )}
            >
              {hasLabel &&
                (bordered ? (
                  <div
                    data-slot="descriptions-label"
                    className={cn(
                      "flex bg-surface font-medium text-muted-foreground",
                      CELL_PADDING[size],
                      vertical
                        ? "border-b border-border"
                        : cn(
                            "min-w-0 border-r border-border",
                            BORDERED_ALIGN[borderedAlign],
                            // 键名不折行：折行的键列会跟着变宽变矮，整表的对齐基准就飘了。
                            // 键名确实很长时用 labelWidth 钉死列宽。
                            "whitespace-nowrap",
                          ),
                    )}
                  >
                    {item.label}
                  </div>
                ) : (
                  <span
                    data-slot="descriptions-label"
                    className={cn(
                      "min-w-0 text-muted-foreground",
                      vertical ? "text-sm" : "whitespace-nowrap",
                    )}
                  >
                    {item.label}
                  </span>
                ))}

              {bordered ? (
                <div
                  className={cn(
                    "flex min-w-0 text-foreground",
                    CELL_PADDING[size],
                    !vertical && BORDERED_ALIGN[borderedAlign],
                    // 无键名时值占满整项（subgrid 下不写会只占第一条轨道）
                    !vertical && (hasLabel ? "col-[2/-1]" : "col-[1/-1]"),
                  )}
                >
                  <span className="min-w-0 flex-1">{value}</span>
                </div>
              ) : vertical ? (
                <span className="min-w-0 text-foreground">{value}</span>
              ) : (
                <span
                  className={cn(
                    "min-w-0 text-foreground",
                    hasLabel ? "col-[2/-1]" : "col-[1/-1]",
                    column > 1 && "pe-6",
                  )}
                >
                  {value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
DescriptionsImpl.displayName = "Descriptions";

// children 路径每次渲染都要 collectItems 递归下钻一遍（含 Fragment 展开），详情页里
// 又常和会频繁更新的操作区共存。items（或 children）引用没变、其余 props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// memo 在 RSC 下被 Flight 直接拆包渲染，故本体仍不需要 "use client"。
export const Descriptions = memo(DescriptionsImpl);
Descriptions.displayName = "Descriptions";
