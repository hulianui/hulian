export interface AvatarCirclesItem {
  src: string;
  alt?: string;
}

export interface AvatarCirclesProps {
  /** 头像列表（按序堆叠，后者压前者）。 */
  avatars: AvatarCirclesItem[];
  /** 额外人数（渲染为末尾 "+N" 圆）。 */
  extraCount?: number;
  /** 圆直径档位。 */
  size?: "sm" | "md" | "lg";
  className?: string;
}
