/** @jsxImportSource ../../../lib/fixture-jsx */
import { Avatar, Card, Heading, Tag, Text } from "@hulianui/ui";

const MEMBERS = [
  {
    name: "陈航",
    fallback: "陈",
    role: "联合创始人 & CEO",
    bio: "前分布式系统架构师，相信基础设施应当隐于无形。",
  },
  {
    name: "Marco Reyes",
    fallback: "M",
    role: "平台工程负责人",
    bio: "把瀚云的调度内核从单区域扩展到三大洲。",
  },
  {
    name: "林之华",
    fallback: "林",
    role: "首席设计师",
    bio: "主导控制台与文档体系，痴迷于克制的信息密度。",
  },
  {
    name: "Aisha Karim",
    fallback: "A",
    role: "可观测性技术主管",
    bio: "构建了支撑百万级指标的实时链路追踪管线。",
  },
  {
    name: "周慕白",
    fallback: "周",
    role: "弹性算力负责人",
    bio: "让冷启动从秒级进入毫秒级的那个人。",
  },
  {
    name: "Daniel Osei",
    fallback: "D",
    role: "开发者关系负责人",
    bio: "把工程团队的声音带到社区，也把社区带回团队。",
  },
  {
    name: "苏晚",
    fallback: "苏",
    role: "安全工程负责人",
    bio: "守护多租户隔离边界，把零信任写进每一行配置。",
  },
  {
    name: "Elena Volkov",
    fallback: "E",
    role: "数据基础设施工程师",
    bio: "维护着瀚云内部最繁忙的事件总线。",
  },
];

export function TeamGridBlock() {
  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            团队
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            打造瀚云的人
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            一支横跨基础设施、设计与开发者体验的小而专注的团队，让复杂的云能力变得简单可用。
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <Card
              key={m.name}
              variant="outline"
              className="flex flex-col items-center gap-3 p-6 text-center"
            >
              <Avatar size="lg" fallback={m.fallback} />
              <div className="flex flex-col gap-1">
                <Text weight="medium" className="text-foreground">
                  {m.name}
                </Text>
                <Text size="xs" tone="muted">
                  {m.role}
                </Text>
              </div>
              <Text size="sm" tone="muted">
                {m.bio}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
