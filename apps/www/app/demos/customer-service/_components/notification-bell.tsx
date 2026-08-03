"use client";
import { copy } from "./notification-bell.content";

import { useState } from "react";
import { Bell, MessageSquarePlus, Ticket, Star, CheckCheck } from "lucide-react";
import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from "@hulianui/ui";

interface Notice {
  id: string;
  icon: typeof Bell;
  tone: "brand" | "warning" | "success";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const SEED: Notice[] = [
  {
    id: "n1",
    icon: MessageSquarePlus,
    tone: "brand",
    title: copy("newSessionIncoming"),
    desc: copy("zhaoTiezhuInitiatedConsultationThroughTheWeb"),
    time: copy("justNow"),
    read: false,
  },
  {
    id: "n2",
    icon: Ticket,
    tone: "warning",
    title: copy("workOrderAssigned"),
    desc: copy("tAppWasNotShippedAfterOrdering"),
    time: copy("minutesAgo"),
    read: false,
  },
  {
    id: "n3",
    icon: Star,
    tone: "success",
    title: copy("receivedPositiveReviewsFromCustomers"),
    desc: copy("linWanruGaveThisServiceAStar"),
    time: copy("minutesAgo2"),
    read: false,
  },
];

const TONE_BG: Record<Notice["tone"], string> = {
  brand: "bg-primary/12 text-primary",
  warning: "bg-warning/12 text-warning",
  success: "bg-success/12 text-success",
};

export function NotificationBell() {
  const [notices, setNotices] = useState<Notice[]>(SEED);
  const unread = notices.filter((n) => !n.read).length;

  const markAllRead = () => setNotices((ns) => ns.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotices((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={copy("notificationValue", unread > 0 ? copy("valueUnreadItems", unread) : "")}
            className="size-9 px-0"
          >
            <Badge count={unread} size="sm" className="pointer-events-none">
              <Bell className="size-[18px]" />
            </Badge>
          </Button>
        }
      />
      <PopoverContent side="bottom" align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold">{copy("notification")}{unread > 0 && <span className="ml-1 text-xs font-normal text-muted">{unread}{copy("unreadItems")}</span>}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={unread === 0}
            onClick={markAllRead}
          >
            <CheckCheck className="size-3.5" />{copy("allRead")}</Button>
        </div>

        <ul className="max-h-80 overflow-y-auto py-1">
          {notices.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-hover"
                >
                  <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${TONE_BG[n.tone]}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{n.title}</span>
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-danger" aria-label={copy("unread")} />}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted">{n.desc}</span>
                    <span className="text-[11px] text-muted">{n.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border px-4 py-2 text-center">
          <Button variant="ghost" size="sm" className="h-7 w-full text-xs text-muted">{copy("viewAllNotifications")}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
