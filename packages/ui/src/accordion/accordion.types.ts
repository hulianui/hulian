import type { ComponentProps } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";

export type AccordionProps = ComponentProps<typeof BaseAccordion.Root>;
export type AccordionItemProps = ComponentProps<typeof BaseAccordion.Item>;
export type AccordionTriggerProps = ComponentProps<typeof BaseAccordion.Trigger>;
export type AccordionPanelProps = ComponentProps<typeof BaseAccordion.Panel>;
