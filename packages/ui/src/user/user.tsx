import { Avatar } from "../avatar/avatar";
import { cn } from "../lib/cn";
import type { UserProps } from "./user.types";

// 头像 + 名称/描述组合件（可 RSC；内部 Avatar 为 client 岛，组合无新增状态）。
export function User({ name, description, avatarProps, className }: UserProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Avatar {...avatarProps} />
      <div className="inline-flex flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {description != null && <span className="text-xs text-muted">{description}</span>}
      </div>
    </div>
  );
}
