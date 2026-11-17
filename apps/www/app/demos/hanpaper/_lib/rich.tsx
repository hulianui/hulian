import { Fragment, type ReactNode } from "react";

/**
 * Interpolates React nodes into a localized template: `"see {fig} and {cite}"`.
 * Prose lives in `.content.ts` as plain strings so both locales stay complete;
 * cross references (FigRef / SecRef / Cite / EqRef) are injected here.
 * Unknown placeholders are left as-is so a typo is visible instead of silently dropped.
 */
export function rich(template: string, nodes: Record<string, ReactNode>): ReactNode {
  const parts = template.split(/\{(\w+)\}/g);
  return parts.map((part, i) => {
    if (i % 2 === 0) return part ? <Fragment key={i}>{part}</Fragment> : null;
    return <Fragment key={i}>{part in nodes ? nodes[part] : `{${part}}`}</Fragment>;
  });
}
