import { memo } from "react";

/**
 * 桌面后升起的上半身。腿留在等距平面里，不在这里再画一条站直的身子。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl() {
  return (
    <svg viewBox="0 0 64 58" className="h-12 w-11 overflow-visible" aria-hidden data-seat-person>
      <path d="M14 56c1-14 8-20 18-20s17 6 18 20" fill="var(--color-foreground)" />
      <path d="M16 44c.6-12 6.5-18 16-18s15.4 6 16 18v4H16z" fill="var(--color-foreground)" />
      <path
        data-seat-scarf
        d="M12 36h40c1.2 6.5-2.2 11-10.5 12.5H22.5C14.2 47 10.8 42.5 12 36z"
        fill="var(--zone-accent, var(--color-primary))"
      />
      <path d="M24 42h16c.5 2-.8 3.4-4 4H28c-3.2-.6-4.5-2-4-4z" fill="var(--color-foreground)" opacity="0.28" />
      <circle cx="20" cy="20" r="3" fill="var(--color-foreground)" />
      <circle cx="44" cy="20" r="3" fill="var(--color-foreground)" />
      <circle cx="32" cy="18" r="11" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
