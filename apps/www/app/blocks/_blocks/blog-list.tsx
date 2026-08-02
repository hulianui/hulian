/** @jsxImportSource ../../../lib/fixture-jsx */
import { Avatar, Card, Heading, Tag, Text } from "@hulianui/ui";

const FEATURED = {
  category: "架构",
  title: "瀚云调度内核的三年演进：从单区域到全球弹性",
  summary:
    "我们如何重写调度层，让工作负载在三大洲之间秒级迁移，同时把跨区延迟控制在可预测的范围内。这是一篇关于取舍的复盘。",
  author: "Marco Reyes",
  authorFallback: "M",
  date: "2026 年 5 月 28 日",
  gradient: "from-primary/30 via-accent/15 to-bg",
};

const POSTS = [
  {
    category: "可观测性",
    title: "用 1% 采样还原 100% 的故障现场",
    summary: "在保证成本可控的前提下，我们如何让链路追踪依然能精准命中长尾异常请求。",
    author: "Aisha Karim",
    fallback: "A",
    date: "2026 年 5 月 20 日",
    gradient: "from-accent/25 to-bg",
  },
  {
    category: "弹性算力",
    title: "冷启动从 1.8s 砍到 400ms",
    summary: "预热池、镜像分层与运行时快照三管齐下，我们重新定义了函数计算的启动体验。",
    author: "周慕白",
    fallback: "周",
    date: "2026 年 5 月 14 日",
    gradient: "from-primary/20 to-accent/10",
  },
  {
    category: "边缘",
    title: "把计算推到离用户 20ms 的地方",
    summary: "瀚云边缘节点的选址、回源策略与一致性模型，以及我们踩过的坑。",
    author: "林之华",
    fallback: "林",
    date: "2026 年 5 月 6 日",
    gradient: "from-accent/20 via-primary/10 to-bg",
  },
  {
    category: "安全",
    title: "多租户隔离不止于命名空间",
    summary: "从内核 cgroup 到网络微分段，我们如何在共享基础设施上守住硬隔离边界。",
    author: "苏晚",
    fallback: "苏",
    date: "2026 年 4 月 29 日",
    gradient: "from-primary/15 to-accent/15",
  },
  {
    category: "数据",
    title: "支撑百万级指标的事件总线设计",
    summary: "背压、批处理与分区策略，构建一条不会在流量洪峰中崩溃的内部管线。",
    author: "Elena Volkov",
    fallback: "E",
    date: "2026 年 4 月 22 日",
    gradient: "from-accent/30 to-primary/10",
  },
  {
    category: "开发者体验",
    title: "我们重写文档站的那个季度",
    summary: "好的开发者体验始于第一次 curl，我们如何让上手时间缩短一半。",
    author: "Daniel Osei",
    fallback: "D",
    date: "2026 年 4 月 15 日",
    gradient: "from-primary/25 to-bg",
  },
];

export function BlogListBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            工程博客
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            来自瀚云工程团队
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            真实的架构决策、性能复盘与踩坑记录，写给同样在构建基础设施的工程师。
          </Text>
        </div>

        <Card variant="outline" className="mb-8 grid grid-cols-1 overflow-hidden md:grid-cols-2">
          <div className={`min-h-56 bg-gradient-to-br ${FEATURED.gradient}`} aria-hidden />
          <div className="flex flex-col justify-center gap-4 p-8">
            <Tag variant="soft" tone="neutral" size="sm">
              {FEATURED.category}
            </Tag>
            <Heading level={3} size="2xl" weight="bold" balance className="text-foreground">
              {FEATURED.title}
            </Heading>
            <Text size="base" tone="muted" lineClamp={2}>
              {FEATURED.summary}
            </Text>
            <div className="mt-2 flex items-center gap-3">
              <Avatar size="sm" fallback={FEATURED.authorFallback} />
              <Text size="sm" className="text-foreground">
                {FEATURED.author}
              </Text>
              <Text size="xs" tone="muted">
                {FEATURED.date}
              </Text>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <Card key={post.title} variant="outline" className="flex flex-col overflow-hidden">
              <div className={`aspect-video bg-gradient-to-br ${post.gradient}`} aria-hidden />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Tag variant="soft" tone="neutral" size="sm">
                  {post.category}
                </Tag>
                <Heading level={3} size="lg" weight="semibold" className="text-foreground">
                  {post.title}
                </Heading>
                <Text size="sm" tone="muted" lineClamp={2}>
                  {post.summary}
                </Text>
                <div className="mt-auto flex items-center gap-2.5 pt-2">
                  <Avatar size="sm" fallback={post.fallback} />
                  <Text size="sm" className="text-foreground">
                    {post.author}
                  </Text>
                  <Text size="xs" tone="muted">
                    {post.date}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
