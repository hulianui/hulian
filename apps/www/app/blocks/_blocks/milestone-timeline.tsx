import { Heading, Tag, Text, Timeline, type TimelineItemProps } from "@hulianui/ui";

// 发展历程 Block —— 自包含、可整段复制。
// 公司里程碑事件时间线（dogfood 库 Timeline 的 alternate 中轴交替模式）。
// 与「关于」块的里程碑数字（NumberTicker 量化背书）互补：这里讲的是「一路怎么走过来的」。
// 数据内联在本文件，复制后改 MILESTONES 即可。

interface Milestone {
  year: string;
  title: string;
  desc: string;
  color: TimelineItemProps["color"];
}

const MILESTONES: Milestone[] = [
  {
    year: "2019",
    title: "车库里的第一行代码",
    desc: "三位创始人受够了在割裂的系统间搬运数据，决定亲手造一个把它们串起来的平台，瀚云正式立项。",
    color: "primary",
  },
  {
    year: "2020",
    title: "首个公测版本上线",
    desc: "内测开放，首批 100 个团队接入。我们立下规矩——不堆功能，只解决真问题。",
    color: "default",
  },
  {
    year: "2021",
    title: "完成 A 轮融资",
    desc: "拿到 A 轮，团队扩张到 30 人，弹性算力与全球边缘网络从蓝图走向生产。",
    color: "success",
  },
  {
    year: "2023",
    title: "边缘网络覆盖全球",
    desc: "边缘节点突破百个、覆盖 20 国，海外用户首屏时间普遍降到 400ms 以内。",
    color: "primary",
  },
  {
    year: "2024",
    title: "通过企业级合规",
    desc: "完成 SOC 2 Type II 与等保三级审计，迎来第一家上市公司客户，企业版正式发布。",
    color: "warning",
  },
];

export function MilestoneTimelineBlock() {
  const items: TimelineItemProps[] = MILESTONES.map((m) => ({
    color: m.color,
    label: (
      <span className="font-semibold tracking-tight text-foreground">{m.year}</span>
    ),
    children: (
      <div className="pb-2">
        <Text weight="semibold" className="text-foreground">
          {m.title}
        </Text>
        <Text tone="muted" size="sm" className="mt-1 leading-relaxed">
          {m.desc}
        </Text>
      </div>
    ),
  }));

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            发展历程
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            一路走来
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            从车库里的三个人，到服务全球十余万开发者，每一步都算数。
          </Text>
        </div>
        <Timeline mode="alternate" items={items} pending="未完待续，下一站由你定义" />
      </div>
    </section>
  );
}
