/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import { useState } from "react";
import { Banner, Link } from "@hulianui/ui";
import { Sparkles, Rocket } from "lucide-react";

// 顶部通栏公告条区块 —— 自包含、可整段复制。
// 用库里的 Banner 组件，堆叠两种 tone 变体：
//  1) brand soft 信息条（新版本公告 + 行动链接 + 可关闭）
//  2) brand solid 促销条（限时活动 + 行动链接 + 可关闭）
// 复制后改：tone / variant / 文案 / action href。各条独立 onClose 状态控制显隐。

export function BannerBlock() {
  const [showInfo, setShowInfo] = useState(true);
  const [showPromo, setShowPromo] = useState(true);

  return (
    <div className="flex flex-col">
      {/* 信息条：新版本公告 */}
      {showInfo && (
        <Banner
          tone="brand"
          variant="soft"
          icon={<Rocket />}
          align="center"
          onClose={() => setShowInfo(false)}
          closeLabel="关闭"
          action={
            <Link href="https://example.com/#changelog" className="text-current underline">
              查看更新日志
            </Link>
          }
        >
          瀚云 v3 已发布：弹性算力闲时归零，边缘节点扩展至 300+
        </Banner>
      )}

      {/* 促销条：限时活动（实色更醒目） */}
      {showPromo && (
        <Banner
          tone="brand"
          variant="solid"
          icon={<Sparkles />}
          align="center"
          onClose={() => setShowPromo(false)}
          closeLabel="关闭"
          action={
            <Link href="https://example.com/#upgrade" className="text-current underline">
              立即领取
            </Link>
          }
        >
          限时优惠：升级 Pro 年付立享 8 折，新用户再送 ¥200 算力券
        </Banner>
      )}
    </div>
  );
}
