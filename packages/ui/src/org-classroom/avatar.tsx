import { memo } from "react";

/**
 * 工位上的剪影。和公开的 Avatar（头像）不是同一件东西，不从包入口导出。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl() {
  return (
    <svg viewBox="0 0 48 56" className="h-11 w-9 overflow-visible" aria-hidden>
      <circle cx="24" cy="14" r="9" fill="var(--color-foreground)" />
      <path d="M8 50c1.4-14 8-20 16-20s14.6 6 16 20" fill="var(--color-foreground)" />
      <path d="M12 31h24c1.4 5-1.2 9-6.5 10.2H18.5C13.2 40 10.6 36 12 31z" fill="var(--zone-accent, var(--color-primary))" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
