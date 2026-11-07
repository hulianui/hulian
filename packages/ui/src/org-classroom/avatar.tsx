import { memo, type MouseEvent as ReactMouseEvent } from "react";

/**
 * 桌后可读的头和围巾。尺寸按 1 倍场景也要能认出是头，不靠把半身缩成点。
 * 围巾颜色吃分区的 `--zone-accent`。
 */
function AvatarImpl({ onSelect }: { onSelect: (event: ReactMouseEvent) => void }) {
  return (
    <svg
      viewBox="0 0 72 56"
      className="h-16 w-[4.6rem] overflow-visible [pointer-events:visiblePainted]"
      aria-hidden
      data-seat-person
      onClick={onSelect}
    >
      <path
        data-seat-scarf
        d="M16 19h40c1.12 7.5-2 10.6-12 12.6H18L8 37.6C10.2 33.2 13.4 25.4 16 19z"
        fill="var(--zone-accent, var(--color-primary))"
      />
      <circle cx="16" cy="18" r="3.2" fill="var(--color-foreground)" />
      <circle cx="56" cy="18" r="3.2" fill="var(--color-foreground)" />
      <circle data-seat-head cx="36" cy="17" r="14" fill="var(--color-foreground)" />
    </svg>
  );
}

export const Avatar = memo(AvatarImpl);
Avatar.displayName = "OrgClassroomAvatar";
