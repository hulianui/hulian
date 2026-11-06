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
        d="M12 30h48c1.6 11-4 16.5-16 18.5H28C16 46.5 10.4 41 12 30z"
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
