"use client";
import { useMemo, useState } from "react";
import { Search, Eye, Clock } from "lucide-react";
import {
  Card,
  CardBody,
  Drawer,
  DrawerContent,
  Heading,
  Input,
  Markdown,
  Segmented,
  Tag,
  Text,
} from "@hulian/ui";
import { articles, KB_CATEGORIES } from "../../_data/knowledge";
import type { KnowledgeArticle } from "../../_data/types";

export default function KnowledgePage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [active, setActive] = useState<KnowledgeArticle | null>(null);

  const list = useMemo(() => {
    const kw = keyword.trim();
    return articles.filter((a) => {
      if (category !== "全部" && a.category !== category) return false;
      if (kw && !`${a.title}${a.excerpt}${a.body}`.includes(kw)) return false;
      return true;
    });
  }, [keyword, category]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Heading level={1} size="xl">
          知识库
        </Heading>
        <Text tone="muted" className="mt-1">
          坐席自助检索的标准应答与处理流程，沉淀团队服务经验。
        </Text>
      </div>

      {/* 检索区 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索文章标题 / 内容…"
          prefix={<Search className="size-4 text-muted" />}
          className="sm:max-w-xs"
        />
        <Segmented
          size="sm"
          aria-label="文章分类"
          value={category}
          onValueChange={setCategory}
          items={KB_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
      </div>

      {/* 卡片网格 */}
      {list.length === 0 ? (
        <div className="grid place-items-center rounded-[var(--radius)] border border-dashed border-border py-16 text-sm text-muted">
          没有匹配「{keyword || category}」的文章
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <Card
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setActive(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive(a);
                }
              }}
              className="cursor-pointer outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardBody className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Heading level={3} size="sm" className="min-w-0 flex-1">
                    {a.title}
                  </Heading>
                  <Tag tone="brand" size="sm" variant="soft">
                    {a.category}
                  </Tag>
                </div>
                <Text size="sm" tone="muted" className="line-clamp-2 flex-1">
                  {a.excerpt}
                </Text>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" /> {a.views.toLocaleString("zh-CN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {a.updatedAt}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* 文章详情抽屉 */}
      <Drawer open={active != null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent side="right" title={active?.title} className="w-full max-w-xl">
          {active && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs text-muted">
                <Tag tone="brand" size="sm" variant="soft">
                  {active.category}
                </Tag>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" /> {active.views.toLocaleString("zh-CN")} 次阅读
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> 更新于 {active.updatedAt}
                </span>
              </div>
              <Markdown>{active.body}</Markdown>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
