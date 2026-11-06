import { memo } from "react";

/**
 * 坐在椅子上的剪影。公开的 Avatar 是头像，不从这里再导出一个同名组件。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl() {
  return (
    <svg viewBox="0 0 72 86" className="h-[4.5rem] w-14 overflow-visible" aria-hidden data-seat-person>
      <ellipse cx="36" cy="80" rx="16" ry="4" fill="var(--color-foreground)" opacity="0.16" />
      <path d="M16 82c1.4-18 9-26 20-26s18.6 8 20 26" fill="var(--color-foreground)" />
      <path d="M20 64c.4-16 7-24 16-24s15.6 8 16 24v4H20z" fill="var(--color-foreground)" />
      <path
        data-seat-scarf
        d="M17 48h38c1.4 7-2.4 12-10 14H27C19.4 60 15.6 55 17 48z"
        fill="var(--zone-accent, var(--color-primary))"
      />
      <path d="M28 54h16c.6 2.4-1 4-4.5 4.6H32.5C29 58 27.4 56.4 28 54z" fill="var(--color-foreground)" opacity="0.28" />
      <path d="M31 40h10c.6 2.2 0 4-2 5h-6c-2-1-2.6-2.8-2-5z" fill="var(--color-foreground)" />
      <circle cx="22" cy="24" r="3.2" fill="var(--color-foreground)" />
      <circle cx="50" cy="24" r="3.2" fill="var(--color-foreground)" />
      <circle cx="36" cy="22" r="13" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
