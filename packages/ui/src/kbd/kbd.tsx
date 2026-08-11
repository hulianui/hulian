import { Children, Fragment, memo } from "react";
import { cn } from "../lib/cn";
import type { KbdGroupProps, KbdProps } from "./kbd.types";

// 纯皮肤 <kbd>（可 RSC）。组合键(⌘+K)交给 KbdGroup；keys 符号自动映射仍是 YAGNI。
function KbdImpl({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[min(var(--radius),0.375rem)] border border-border bg-surface-hover px-1.5 font-mono text-xs font-medium text-muted-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
KbdImpl.displayName = "Kbd";

// 快捷键提示常成排渲染（命令面板、菜单项尾巴、帮助页），父级一动就整排重算。
// props 全是原语时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Kbd = memo(KbdImpl);
Kbd.displayName = "Kbd";

/**
 * 组合键容器（可 RSC）。只做三件事：统一 gap、画分隔符、给整组一个无障碍名。
 *
 * 单键才是少数形态 —— 命令面板尾巴、菜单项右侧、快捷键帮助里基本都是组合键。没有容器时
 * 每个调用处都要自己拍板「分隔符长什么样、键距多大、要不要 aria-label」，前两项只是重复，
 * 第三项会**直接漏掉**：一串并排的 `<kbd>` 在读屏里是几个互不相干的碎片，而漏没漏在视觉上
 * 完全看不出来（hulianui/hulian#165）。
 *
 * 仍然不做符号映射（`Meta → ⌘` 之类）：键名该显示成什么取决于消费方的平台探测与文案口径，
 * 库里内置一张表只会在跨平台产品里猜错。
 */
export function KbdGroup({
  keys,
  children,
  separator = "+",
  label,
  className,
  ...props
}: KbdGroupProps) {
  // children 优先：给了就说明消费方要自己控制每个键帽（自定义 className、图标键、混排文字）。
  // 用 toArray 的长度判断而不是 `children != null`：它会把 null / false / 数组这些形态先摊平，
  // 于是 `{cond && <Kbd/>}` 这类条件渲染求值成空时能落回 keys，而不是渲染出一个空容器。
  const provided = Children.toArray(children);
  const items =
    provided.length > 0 ? provided : (keys ?? []).map((key, index) => <Kbd key={index}>{key}</Kbd>);
  // 分隔符默认 "+"，传 null / "" 表示只要间距不要符号。
  const hasSeparator = separator !== null && separator !== undefined && separator !== "";

  return (
    <span
      // rest 展开在最前 —— 组件自身的 role / aria 赢（consuming.md §7 的透传口径，#157）。
      // 这一层的无障碍语义是它的正确性契约：调用处顺手传个 role 就把整组的读屏名掀翻，
      // 而掀没掀翻在页面上一点看不出来，正是 #165 要根治的那类静默失效。
      {...props}
      // aria-label 落在无 role 的 span 上多数读屏会忽略，必须配一个 role 才生效；
      // 没给 label 就不要平白造一个空的 group 层级出来（此时 role 由消费方说了算）。
      {...(label ? { role: "group", "aria-label": label } : {})}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {items.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && hasSeparator ? (
            // 分隔符是画给眼睛看的：读屏把它念成「加号」只会把键名切碎，整组的语义由 label 承担。
            <span aria-hidden="true" className="select-none text-xs text-muted-foreground">
              {separator}
            </span>
          ) : null}
          {item}
        </Fragment>
      ))}
    </span>
  );
}
// 刻意**不**套 memo：容器唯一的 props 是 keys 数组 / children，调用处基本写成字面量，
// 每次渲染都是新引用，浅比较必然失手 —— 那样只是白付一次比较的钱（0.28.0 回滚过 34 个
// 同类无效 memo）。真正需要 bailout 的是键帽本身，Kbd 的 props 是原语，它那层已经生效。
KbdGroup.displayName = "KbdGroup";
