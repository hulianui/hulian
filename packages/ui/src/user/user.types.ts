import type { ReactNode } from "react";
import type { AvatarProps } from "../avatar/avatar.types";

export interface UserProps {
  /** 主名称（必填）。 */
  name: ReactNode;
  /** 次级描述（邮箱/角色/@handle 等）。 */
  description?: ReactNode;
  /** 透传给内置 Avatar 的属性（src/alt/fallback/size）。 */
  avatarProps?: AvatarProps;
  className?: string;
}
