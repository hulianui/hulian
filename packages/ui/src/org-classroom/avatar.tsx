import { memo, type MouseEvent as ReactMouseEvent } from "react";

/**
 * 桌面后升起的头和围巾。肩只留一窄条，腿在等距平面里沿桌深走。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl({ onSelect }: { onSelect: (event: ReactMouseEvent) => void }) {
  return (
    <svg
      viewBox="0 0 64 46"
      className="h-12 w-[3.15rem] overflow-visible [pointer-events:visiblePainted]"
      aria-hidden
      data-seat-person
      onClick={onSelect}
    >
      <path d="M22 44c.7-7 4.6-10 10-10s9.3 3 10 10" fill="var(--color-foreground)" />
      <path
        data-seat-scarf
        d="M14 27h36c1.1 6.2-2 9.6-10 11.2H24C16 36.6 12.9 33.2 14 27z"
        fill="var(--zone-accent, var(--color-primary))"
      />
      <circle cx="18" cy="16" r="2.5" fill="var(--color-foreground)" />
      <circle cx="46" cy="16" r="2.5" fill="var(--color-foreground)" />
      <circle cx="32" cy="15" r="10" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
