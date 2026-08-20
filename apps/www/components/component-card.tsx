import { Sparkles } from "lucide-react";
import { ComponentThumbnail } from "./component-thumbnail";
import { canPreviewCategory } from "../lib/gallery-preview";
import { withDocsBasePath, DOCS_LOCALE } from "../lib/docs-locale";

/**
 * 组件画廊里的一张卡：活预览 + 名字 + 一句描述。
 *
 * **整卡不能是 `<a>`**（stretched-link 模式：卡片是 div，链接绝对定位覆盖在上层）。
 * 缩略图里渲染的是组件真实示例，其中不少自带 <a>/<button>（SocialButton、Breadcrumb、
 * 分页…），嵌进外层 <a> 会触发 hydration 报错「<a> cannot contain a nested <a>」。
 * 区块画廊踩过同一个坑，同一套解法。
 */
export function ComponentCard({
  slug,
  name,
  description,
  categoryKey,
  animated = false,
}: {
  slug: string;
  name: string;
  description: string;
  categoryKey: string;
  animated?: boolean;
}) {
  return (
    <div
      data-component-card={slug}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface transition-colors hover:bg-surface-hover focus-within:ring-2 focus-within:ring-ring"
    >
      {/* 判据与理由见 canPreviewCategory */}
      {canPreviewCategory(categoryKey) && (
        <div className="border-b border-border">
          <ComponentThumbnail slug={slug} />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground">{name}</span>
          {animated && (
            <Sparkles
              className="size-3.5 shrink-0 text-primary/60"
              aria-label={DOCS_LOCALE === "en" ? "Animated" : "动效"}
            />
          )}
        </div>
        {/* line-clamp-2：描述长短不一，不夹断的话同一行卡片高度会参差 */}
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {/* stretched-link 覆盖层：整卡可点，但不做内容的祖先 */}
      <a
        href={withDocsBasePath(`/components/${slug}`)}
        aria-label={name}
        className="absolute inset-0 z-10 rounded-[inherit] outline-none"
      />
    </div>
  );
}
