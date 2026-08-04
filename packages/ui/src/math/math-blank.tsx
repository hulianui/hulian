"use client";
import { useComponentLocale } from "../config/locale-context";

// 填空槽单独拆成 client 子组件，只为了一件事：读屏文案要走 Locale SSOT，而那是 React context。
//
// Formula 本体刻意保持 RSC 安全（katex.renderToString 是纯函数，服务端就能排完），
// 若为了这个 aria-label 给整个组件加 "use client"，题库页面里几十个公式就全被拽进客户端了。
// RSC 渲染 client 子组件是成立的，代价只有真出现填空槽时的这一个小组件。

/** 填空槽（`____`）。不用下划线字符画线 —— 那样读屏会念出一串「下划线」。 */
export function MathBlank({ width }: { width: number }) {
  const locale = useComponentLocale().mathText ?? { blank: "填空", rowSeparator: "；" };
  return (
    <span
      role="img"
      aria-label={locale.blank}
      className="mx-[0.15em] inline-block border-b border-current align-baseline"
      style={{ minWidth: `${width}em` }}
    />
  );
}
