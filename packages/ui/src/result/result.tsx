import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { ResultProps, ResultStatus } from "./result.types";

// 结果页（可 RSC）。居中状态图标 + 标题 + 副标题 + 详情槽 + 操作槽，纯皮肤吃语义 token。
// 状态色：success→success / error,500→danger / info→primary / warning,403→warning / 404→muted（无 info token，沿用 Alert 的 info≡primary 裁决）。

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const SuccessIcon = (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.4 2.4 4.6-5" />
  </Svg>
);
const ErrorIcon = (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6m0-6-6 6" />
  </Svg>
);
const InfoIcon = (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5m0-8h.01" />
  </Svg>
);
const WarningIcon = (
  <Svg>
    <path d="M12 3 2.5 20.5h19L12 3Z" />
    <path d="M12 9.5v4.5m0 3h.01" />
  </Svg>
);
const LockIcon = (
  <Svg>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
const SearchIcon = (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);
const ServerIcon = (
  <Svg>
    <rect x="3" y="4" width="18" height="7" rx="1.5" />
    <rect x="3" y="13" width="18" height="7" rx="1.5" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  </Svg>
);

const STATUS: Record<ResultStatus, { color: string; icon: ReactNode }> = {
  success: { color: "text-success", icon: SuccessIcon },
  error: { color: "text-danger", icon: ErrorIcon },
  info: { color: "text-primary", icon: InfoIcon },
  warning: { color: "text-warning", icon: WarningIcon },
  "403": { color: "text-warning", icon: LockIcon },
  "404": { color: "text-muted-foreground", icon: SearchIcon },
  "500": { color: "text-danger", icon: ServerIcon },
};

export function Result({
  status = "info",
  icon,
  title,
  subTitle,
  content,
  className,
  children,
  ...props
}: ResultProps) {
  const { color, icon: defaultIcon } = STATUS[status];
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-10 text-center", className)}
      {...props}
    >
      {icon !== null && <span className={cn("[&_svg]:size-16", color)}>{icon ?? defaultIcon}</span>}
      {title != null && <div className="text-lg font-semibold text-foreground">{title}</div>}
      {subTitle != null && <div className="max-w-md text-sm text-muted-foreground">{subTitle}</div>}
      {content != null && (
        <div className="mt-2 w-full max-w-lg rounded-[var(--radius)] border border-border bg-surface-hover/50 px-4 py-3 text-left text-sm text-muted-foreground">
          {content}
        </div>
      )}
      {children != null && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{children}</div>
      )}
    </div>
  );
}
