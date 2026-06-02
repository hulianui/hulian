import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";

export type DrawerSide = "left" | "right" | "top" | "bottom";

export type DrawerProps = ComponentProps<typeof BaseDialog.Root>;

export interface DrawerContentProps {
  /** 贴边方向 + 对应的滑入方向，默认 right。 */
  side?: DrawerSide;
  /** 提供则渲 Dialog.Title 作 a11y label。 */
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}
