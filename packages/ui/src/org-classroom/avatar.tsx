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
      <path d="M26 54c.8-6 4.2-8 10-8s9.2 2 10 8" fill="var(--color-foreground)" />
      <path
        data-seat-scarf
        d="M8 32h56c1.4 8-3.2 12-16 14.5H24C11.2 44 6.6 40 8 32z"
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
