import { memo, type MouseEvent as ReactMouseEvent } from "react";

/**
 * 桌面后升起的上半身。腿留在等距平面里，不在这里再画一条站直的身子。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl({ onSelect }: { onSelect: (event: ReactMouseEvent) => void }) {
  return (
    <svg
      viewBox="0 0 78 52"
      className="h-14 w-[3.6rem] overflow-visible [pointer-events:visiblePainted]"
      aria-hidden
      data-seat-person
      onClick={onSelect}
    >
      <path d="M10 50c1.2-13 9-18 29-18s27.8 5 29 18" fill="var(--color-foreground)" />
      <path d="M16 40c.8-11 8-16 23-16s22.2 5 23 16v3H16z" fill="var(--color-foreground)" />
      <path
        data-seat-scarf
        d="M8 28h62c1.4 8-3 13-16 15H24C11 41 6.6 36 8 28z"
        fill="var(--zone-accent, var(--color-primary))"
      />
      <path d="M28 34h22c.6 2.4-1 4-5.5 4.8H33.5C29 38 27.4 36.4 28 34z" fill="var(--color-foreground)" opacity="0.22" />
      <circle cx="22" cy="16" r="3.4" fill="var(--color-foreground)" />
      <circle cx="56" cy="16" r="3.4" fill="var(--color-foreground)" />
      <circle cx="39" cy="15" r="12" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
