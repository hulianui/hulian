import type { ComponentProps } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import type { AccordionRootProps } from "@base-ui/react/accordion";

/**
 * Base UI 的 Root 是泛型组件（`<Value = any>(props: Props<Value>)`）。
 * 过一道 `ComponentProps<typeof Root>` 会把 `Value` 擦成 `unknown`，于是消费方的 `value` 恒为
 * `unknown[]`、`onValueChange` 恒回吐 `unknown[]` —— 而受控 accordion 的值几乎总是 `string[]`，
 * 受控用法必然 TS2322（hulianui/hulian#163）。这里把泛型原样透下去。
 *
 * 默认值给 `string` 而不是 Base UI 的 `any`：AccordionItem 的 `value` 在文档与示例里都是字符串，
 * `any` 会把受控写法的类型检查整个关掉。同一处方在 `Text` / `Heading` 的 `as` 上做过（#62）。
 */
export type AccordionProps<Value = string> = AccordionRootProps<Value>;
export type AccordionItemProps = ComponentProps<typeof BaseAccordion.Item>;
export type AccordionTriggerProps = ComponentProps<typeof BaseAccordion.Trigger>;

export interface AccordionPanelProps extends ComponentProps<typeof BaseAccordion.Panel> {
  /**
   * 不画皮：为真时不渲染内层那层内边距 + 次要文字色的皮肤 div，children 直接进 Base UI 的 Panel。
   * 面板里装的是一整块功能区（权限编辑器、集成配置表单）而不是一段短说明时用它——
   * 默认皮肤的 `text-muted-foreground` 会沿继承链把整块内容染成次要色，内边距也会跟内容自带的叠加。
   * 与 `Card` 的 `variant="plain"` 同名同义（hulianui/hulian#162 / #159）。
   * @default false
   */
  plain?: boolean;
}
