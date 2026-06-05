import Link from "next/link";
import { Card, CardBody, Heading, Tag, Text } from "@hulianui/ui";
import { demos } from "./lib/demos";

// /demos 画廊占位页（正式版由另一会话做）。读 lib/demos.ts 清单渲染最简卡片网格。
export default function DemosPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10">
        <Heading level={1} size="3xl">
          内置示例
        </Heading>
        <Text tone="muted" className="mt-2">
          用 @hulianui/ui 100% 搭建的真实业务场景 —— 以 dogfood 驱动组件库迭代。
        </Text>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {demos.map((d) => (
          <Link key={d.slug} href={d.href} className="group block focus:outline-none">
            <Card
              variant="elevated"
              className="h-full transition-transform group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring"
            >
              <CardBody className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Tag tone="brand" size="sm">
                    {d.category}
                  </Tag>
                  {d.status === "wip" && (
                    <Tag tone="warning" size="sm" dot pulse>
                      建设中
                    </Tag>
                  )}
                </div>
                <Heading level={2} size="lg">
                  {d.title}
                </Heading>
                <Text tone="muted" size="sm" className="flex-1">
                  {d.description}
                </Text>
                <div className="flex flex-wrap gap-1.5">
                  {d.tags.map((t) => (
                    <Tag key={t} variant="outline" tone="neutral" size="sm">
                      {t}
                    </Tag>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
