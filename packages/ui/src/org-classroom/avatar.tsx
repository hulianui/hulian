import { memo } from "react";

/**
 * 坐在椅子上的剪影。公开的 Avatar 是头像，不从这里再导出一个同名组件。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl() {
  return (
    <svg viewBox="0 0 48 44" className="h-11 w-10 overflow-visible" aria-hidden data-seat-person>
      <ellipse cx="24" cy="40" rx="10" ry="3" fill="var(--color-foreground)" opacity="0.16" />
      <path d="M10 40c1-10 6-14 14-14s13 4 14 14" fill="var(--color-foreground)" />
      <path d="M14 28h20c1 3.2-.6 5.4-4.6 6.2H18.6C14.6 33.4 13 31.2 14 28z" fill="var(--zone-accent, var(--color-primary))" />
      <circle cx="24" cy="12" r="8" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
