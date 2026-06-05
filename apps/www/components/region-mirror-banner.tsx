"use client";

import { useEffect, useState } from "react";
import { Banner } from "@hulianui/ui";

// 仅在 Cloudflare 主站对「中国大陆」访客提示切到阿里云镜像站（直连、绕开 Cloudflare 更快）。
// 检测靠 Cloudflare 边缘内置端点 /cdn-cgi/trace（返回文本含 loc=CN），零后端、比时区/语言猜测可靠。
// 镜像站（aliyun）没有该端点，故只在主站触发、单向提示，不会反向锁死。
const MAIN_HOST = "hulianui.haloritual.com";
const MIRROR_HOST = "hulianui-zh.haloritual.com";
const DISMISS_KEY = "hl-mirror-banner-dismissed";

/**
 * 从 Cloudflare `/cdn-cgi/trace` 响应文本里解析访客国家码（`loc=XX` 行）。
 * 拿不到返回 null。纯函数，便于单测。
 */
export function parseCfLoc(traceText: string): string | null {
  for (const line of traceText.split("\n")) {
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    if (line.slice(0, eq).trim() === "loc") {
      return line.slice(eq + 1).trim().toUpperCase() || null;
    }
  }
  return null;
}

export function RegionMirrorBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 只在主站触发；镜像站 / 本地 dev / 预览域名都不提示。
    if (window.location.hostname !== MAIN_HOST) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // 隐私模式下 localStorage 可能抛错，忽略，按未关闭处理。
    }

    let alive = true;
    fetch("/cdn-cgi/trace", { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("trace failed"))))
      .then((text) => {
        if (alive && parseCfLoc(text) === "CN") setShow(true);
      })
      .catch(() => {
        // 拿不到地理信息就不打扰用户。
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;

  // 保留当前路径/查询/锚点，切到镜像同一页面。
  const { pathname, search, hash } = window.location;
  const mirrorUrl = `https://${MIRROR_HOST}${pathname}${search}${hash}`;

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // 忽略写入失败。
    }
  };

  return (
    <Banner
      tone="info"
      align="center"
      onClose={dismiss}
      closeLabel="不再提示"
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
        </svg>
      }
      action={
        <a
          href={mirrorUrl}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          切换到镜像 →
        </a>
      }
    >
      检测到你在中国大陆，访问镜像站点更快
    </Banner>
  );
}
