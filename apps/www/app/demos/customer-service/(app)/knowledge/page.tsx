"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Clock, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardSkeleton,
  Drawer,
  DrawerClose,
  DrawerContent,
  Field,
  Heading,
  Input,
  Markdown,
  Popconfirm,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tag,
  Text,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
} from "@hulianui/ui";
import { articles as seed, KB_CATEGORIES } from "../../_data/knowledge";
import type { KnowledgeArticle } from "../../_data/types";
import { useMockData } from "../../../lib/async";

// 表单可选分类（去掉「全部」这个仅用于检索的伪分类）
const FORM_CATEGORIES = KB_CATEGORIES.filter((c) => c !== "全部");
interface ArticleDraft {
  title: string;
  category: string;
  excerpt: string;
  body: string;
}
const EMPTY_DRAFT: ArticleDraft = { title: "", category: FORM_CATEGORIES[0], excerpt: "", body: "" };

export default function KnowledgePage() {
  const { data, loading } = useMockData(seed);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("全部");
  const [active, setActive] = useState<KnowledgeArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (data) setArticles(data);
  }, [data]);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setTitleError("");
    setCreating(true);
  };

  const submitDraft = () => {
    const title = draft.title.trim();
    if (!title) {
      setTitleError("请填写文章标题");
      return;
    }
    const body = draft.body.trim();
    const excerpt = draft.excerpt.trim() || body.slice(0, 48) || "（暂无摘要）";
    const article: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      title,
      category: draft.category,
      excerpt,
      body: body || excerpt,
      views: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setArticles((prev) => [article, ...prev]);
    toast({ title: "文章已发布", description: `「${title}」已加入知识库（demo 内存态）`, tone: "success" });
    setCreating(false);
  };

  const list = useMemo(() => {
    const kw = keyword.trim();
    return articles.filter((a) => {
      if (category !== "全部" && a.category !== category) return false;
      if (kw && !`${a.title}${a.excerpt}${a.body}`.includes(kw)) return false;
      return true;
    });
  }, [articles, keyword, category]);

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setActive((prev) => (prev?.id === id ? null : prev));
    toast({ title: "文章已删除", description: "知识库条目已移除（demo 内存态，刷新还原）", tone: "info" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading level={1} size="xl">
            知识库
          </Heading>
          <Text tone="muted" className="mt-1">
            坐席自助检索的标准应答与处理流程，沉淀团队服务经验。
          </Text>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button size="sm" aria-label="新增文章" onClick={openCreate}>
                <Plus className="size-4" /> 新增文章
              </Button>
            }
          />
          <TooltipContent>新增知识库文章</TooltipContent>
        </Tooltip>
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

      {/* 骨架 / 卡片网格 */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : list.length === 0 ? (
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
                <div className="mt-1 flex items-center justify-between gap-4 text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" /> {a.views.toLocaleString("zh-CN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {a.updatedAt}
                    </span>
                  </div>
                  {/* 删除：独立拦截点击冒泡，避免触发卡片打开 */}
                  <Popconfirm
                    title="确认删除此文章？"
                    description="删除后从知识库移除，坐席将无法检索。"
                    danger
                    okText="删除"
                    onConfirm={() => deleteArticle(a.id)}
                  >
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-6 px-0 text-muted hover:text-danger"
                            aria-label="删除文章"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        }
                      />
                      <TooltipContent>删除文章</TooltipContent>
                    </Tooltip>
                  </Popconfirm>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* 文章详情抽屉 */}
      <Drawer open={active != null} onOpenChange={(o) => !o && setActive(null)}>
        <DrawerContent
          side="right"
          title={active?.title}
          className="w-full max-w-xl"
          footer={
            <>
              <DrawerClose render={<Button variant="outline">关闭</Button>} />
              <Button
                onClick={() => {
                  if (active) {
                    setDraft({ title: active.title, category: active.category, excerpt: active.excerpt, body: active.body });
                    setTitleError("");
                    setActive(null);
                    setCreating(true);
                  }
                }}
              >
                编辑
              </Button>
            </>
          }
        >
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

      {/* 新增文章抽屉（表单 + 钉底操作区） */}
      <Drawer open={creating} onOpenChange={setCreating}>
        <DrawerContent
          side="right"
          title="新增知识库文章"
          description="填写标准应答内容，发布后坐席即可检索。"
          className="w-full max-w-xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setCreating(false)}>
                取消
              </Button>
              <Button onClick={submitDraft}>
                <Plus className="size-4" /> 发布文章
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Field
              label={
                <>
                  文章标题 <span className="text-danger">*</span>
                </>
              }
              error={titleError}
            >
              <Input
                value={draft.title}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, title: e.target.value }));
                  if (titleError) setTitleError("");
                }}
                placeholder="例如：退货退款政策与时效说明"
              />
            </Field>
            <Field label="所属分类">
              <Select
                items={FORM_CATEGORIES.map((c) => ({ value: c, label: c }))}
                value={draft.category}
                onValueChange={(v) => setDraft((d) => ({ ...d, category: (v as string) ?? d.category }))}
              >
                <SelectTrigger className="w-full" />
                <SelectContent>
                  {FORM_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="摘要" description="列表卡片展示，留空则自动截取正文前 48 字。">
              <Textarea
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                rows={2}
                placeholder="一句话概括文章要点…"
              />
            </Field>
            <Field label="正文" description="支持 Markdown 语法。">
              <Textarea
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                rows={8}
                placeholder={"## 处理流程\n1. …\n2. …"}
              />
            </Field>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
