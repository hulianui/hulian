import { Heading, Tag, Text } from "@hulianui/ui";

type EntryKind = "新增" | "修复" | "优化";

const KIND_TONE: Record<EntryKind, "success" | "warning" | "neutral"> = {
  新增: "success",
  修复: "warning",
  优化: "neutral",
};

const RELEASES: Array<{
  version: string;
  date: string;
  entries: Array<{ kind: EntryKind; text: string }>;
}> = [
  {
    version: "v3.4.0",
    date: "2026 年 5 月 30 日",
    entries: [
      { kind: "新增", text: "弹性算力支持运行时快照，冷启动 P50 进入 400ms 区间。" },
      { kind: "新增", text: "控制台新增全球边缘节点拓扑视图。" },
      { kind: "优化", text: "调度内核在跨区迁移时的延迟抖动降低约 40%。" },
    ],
  },
  {
    version: "v3.3.0",
    date: "2026 年 5 月 12 日",
    entries: [
      { kind: "新增", text: "可观测性面板支持自定义采样率与长尾命中策略。" },
      { kind: "修复", text: "修复高并发下链路追踪偶发丢失根 span 的问题。" },
      { kind: "优化", text: "指标查询接口在大时间窗口下的响应速度提升。" },
    ],
  },
  {
    version: "v3.2.0",
    date: "2026 年 4 月 24 日",
    entries: [
      { kind: "新增", text: "新增多租户网络微分段能力，支持租户内部策略下发。" },
      { kind: "修复", text: "修复部分区域镜像拉取超时未正确重试的边界情况。" },
    ],
  },
  {
    version: "v3.1.0",
    date: "2026 年 4 月 8 日",
    entries: [
      { kind: "新增", text: "事件总线开放公测，支持背压与分区消费。" },
      { kind: "优化", text: "文档站全面重写，上手时间缩短约一半。" },
      { kind: "修复", text: "修复控制台暗色模式下个别图表配色对比不足。" },
    ],
  },
];

export function ChangelogBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            更新日志
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            瀚云有什么新变化
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            每一次发布的能力新增、缺陷修复与性能优化，透明可追溯。
          </Text>
        </div>

        <div className="border-l border-border pl-8">
          {RELEASES.map((release) => (
            <div key={release.version} className="relative pb-12 last:pb-0">
              <span
                className="absolute -left-[2.3125rem] top-1.5 size-2.5 rounded-full border-2 border-bg bg-primary"
                aria-hidden
              />
              <div className="mb-4 flex items-baseline gap-3">
                <Text as="span" weight="medium" className="font-mono text-foreground">
                  {release.version}
                </Text>
                <Text as="span" size="xs" tone="muted">
                  {release.date}
                </Text>
              </div>
              <ul className="flex flex-col gap-3">
                {release.entries.map((entry, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Tag variant="soft" tone={KIND_TONE[entry.kind]} size="sm">
                      {entry.kind}
                    </Tag>
                    <Text size="sm" tone="muted" className="pt-0.5">
                      {entry.text}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
